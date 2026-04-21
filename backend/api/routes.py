from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from datetime import datetime
from pathlib import Path
import shutil
import tempfile
import time
import sys
import asyncio

from core.settings import settings
from schemas.contracts import AnalyzeRequest, AnalyzeResponse, DeepfakeMetadata, DeepfakeResponse
from services.deepfake_detector import (
    SUPPORTED_IMAGE_EXTENSIONS,
    SUPPORTED_VIDEO_EXTENSIONS,
    get_deepfake_detector,
)
from services.orchestrator import Orchestrator
from services.scraper import ScraperService
from services.propagation_metrics import PropagationMetrics

router = APIRouter(tags=["analysis"])
orchestrator = Orchestrator()
scraper = ScraperService()

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest, x_request_id: str | None = Header(default=None)) -> AnalyzeResponse:
    query = payload.query.strip()
    if len(query) < 4:
        raise HTTPException(status_code=400, detail="Query must be at least 4 characters.")

    try:
        return await orchestrator.analyze(query)
    except HTTPException:
        raise
    except Exception as exc:
        # Print full traceback for debugging
        import traceback
        traceback.print_exc(file=sys.stderr)
        req_id = x_request_id or "n/a"
        error_msg = f"Analysis failed for request {req_id}: {str(exc)}"
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=error_msg) from exc


@router.post("/propagation/analyze-spread")
async def analyze_spread(payload: AnalyzeRequest) -> dict:
    """
    Analyze how a claim spreads across multiple sources (Facebook, News, GDELT, Telegram, CommonCrawl).
    
    Returns comprehensive propagation metrics including:
    - Total reach (sum of all engagement)
    - Platform breakdown (engagement by source)
    - Timeline analysis (spread over 24h, 7d, 30d)
    - Top spreaders (accounts with highest engagement)
    - Virality metrics (viral coefficient, doubling time, growth rate)
    """
    query = payload.query.strip()
    if len(query) < 4:
        raise HTTPException(status_code=400, detail="Query must be at least 4 characters.")
    
    try:
        # Collect posts from all 5 sources
        posts = await asyncio.wait_for(scraper.collect(query), timeout=settings.request_timeout_seconds)
        
        if not posts:
            return {
                'query': query,
                'status': 'no_results',
                'message': 'No posts found for this claim across all sources',
                'analysis': None
            }
        
        # Calculate all metrics
        analysis = PropagationMetrics.analyze_spread(posts)
        
        # Build response with sanitization
        response = {
            'query': query,
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'total_posts_analyzed': len(posts),
            'analysis': analysis,
            'posts': posts
        }
        
        # Sanitize entire response to ensure JSON serialization
        return PropagationMetrics._sanitize_for_json(response)
    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Propagation analysis timed out after {settings.request_timeout_seconds} seconds.",
        )
    except Exception as exc:
        import traceback
        traceback.print_exc(file=sys.stderr)
        error_msg = f"Propagation analysis failed: {str(exc)}"
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=error_msg) from exc


@router.get("/propagation/metrics/{metric_type}")
async def get_metric(metric_type: str, query: str) -> dict:
    """
    Get specific propagation metric for a claim.
    
    Args:
        metric_type: One of 'total_reach', 'platform_breakdown', 'timeline', 'top_spreaders', 'virality'
        query: The claim/query to analyze
    
    Returns:
        Specific metric data requested
    """
    if len(query) < 4:
        raise HTTPException(status_code=400, detail="Query must be at least 4 characters.")
    
    valid_metrics = ['total_reach', 'platform_breakdown', 'timeline', 'top_spreaders', 'virality']
    if metric_type not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric_type. Must be one of: {', '.join(valid_metrics)}"
        )
    
    try:
        # Collect posts from all sources
        posts = await asyncio.wait_for(scraper.collect(query), timeout=settings.request_timeout_seconds)
        
        if not posts:
            return {
                'metric': metric_type,
                'query': query,
                'status': 'no_results',
                'data': None
            }
        
        # Get specific metric
        if metric_type == 'total_reach':
            metric_data = PropagationMetrics.calculate_total_reach(posts)
        elif metric_type == 'platform_breakdown':
            metric_data = PropagationMetrics.breakdown_by_platform(posts)
        elif metric_type == 'timeline':
            metric_data = PropagationMetrics.calculate_timeline(posts)
        elif metric_type == 'top_spreaders':
            metric_data = PropagationMetrics.identify_top_spreaders(posts)
        elif metric_type == 'virality':
            metric_data = PropagationMetrics.calculate_viral_coefficient(posts)
        else:
            raise ValueError(f"Unknown metric type: {metric_type}")
        
        return {
            'metric': metric_type,
            'query': query,
            'status': 'success',
            'data': metric_data
        }
    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Propagation metric request timed out after {settings.request_timeout_seconds} seconds.",
        )
    except Exception as exc:
        import traceback
        traceback.print_exc(file=sys.stderr)
        error_msg = f"Failed to get {metric_type}: {str(exc)}"
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=error_msg) from exc


@router.post("/deepfake/detect", response_model=DeepfakeResponse)
async def detect_deepfake(media: UploadFile = File(...)) -> DeepfakeResponse:
    suffix = Path(media.filename or "").suffix.lower()
    allowed_extensions = SUPPORTED_IMAGE_EXTENSIONS | SUPPORTED_VIDEO_EXTENSIONS
    if suffix not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use JPG, PNG, MP4, AVI, MOV, or MKV.")

    detector = get_deepfake_detector()
    temp_path: str | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(media.file, temp_file)
            temp_path = temp_file.name

        file_size = Path(temp_path).stat().st_size
        if suffix in SUPPORTED_IMAGE_EXTENSIONS and file_size > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="Image file is too large. Maximum size is 10MB.")
        if suffix in SUPPORTED_VIDEO_EXTENSIONS and file_size > MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="Video file is too large. Maximum size is 50MB.")

        if suffix in SUPPORTED_IMAGE_EXTENSIONS:
            result = detector.detect_image(temp_path)
        else:
            result = detector.detect_video(temp_path)

        return DeepfakeResponse(
            mediaType=result.media_type,
            prediction=result.prediction,
            confidence=result.confidence,
            confidenceLevel=detector._confidence_level(result.confidence),
            processingTimeMs=result.processing_time_ms,
            message=result.message,
            metadata=DeepfakeMetadata(**result.metadata),
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        error_msg = f"Deepfake detection failed: {str(exc)}"
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=error_msg) from exc
    finally:
        if temp_path:
            try:
                Path(temp_path).unlink(missing_ok=True)
            except Exception:
                pass

