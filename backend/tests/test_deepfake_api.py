from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

import main as main_module
import api.routes as routes_module
from main import app
from services.deepfake_detector import DeepfakeResult


class FakeDetector:
    def _confidence_level(self, confidence: float) -> str:
        return 'High'

    def detect_image(self, file_path: str) -> DeepfakeResult:
        return DeepfakeResult(
            media_type='image',
            prediction='Fake',
            confidence=0.91,
            processing_time_ms=12,
            message='The image is likely fake with 91% confidence.',
            metadata={
                'fileName': Path(file_path).name,
                'mimeType': 'image/png',
                'fileSizeBytes': Path(file_path).stat().st_size,
                'mediaType': 'image',
                'modelVersion': 'test-model',
                'frameCount': None,
                'framesAnalyzed': 1,
                'samplingStrategy': None,
            },
        )

    def detect_video(self, file_path: str) -> DeepfakeResult:
        return DeepfakeResult(
            media_type='video',
            prediction='Real',
            confidence=0.78,
            processing_time_ms=25,
            message='The video is likely real with 78% confidence.',
            metadata={
                'fileName': Path(file_path).name,
                'mimeType': 'video/mp4',
                'fileSizeBytes': Path(file_path).stat().st_size,
                'mediaType': 'video',
                'modelVersion': 'test-model',
                'frameCount': 10,
                'framesAnalyzed': 4,
                'samplingStrategy': 'test-sampling',
            },
        )


def test_deepfake_detect_image_endpoint(monkeypatch) -> None:
    monkeypatch.setattr(main_module, 'get_deepfake_detector', lambda: FakeDetector())
    monkeypatch.setattr(routes_module, 'get_deepfake_detector', lambda: FakeDetector())
    client = TestClient(app)

    image_buffer = BytesIO()
    Image.new('RGB', (8, 8), color=(255, 0, 0)).save(image_buffer, format='PNG')
    image_buffer.seek(0)

    response = client.post(
        '/api/deepfake/detect',
        files={'media': ('sample.png', image_buffer, 'image/png')},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['prediction'] == 'Fake'
    assert payload['metadata']['mediaType'] == 'image'


def test_deepfake_detect_rejects_invalid_extension(monkeypatch) -> None:
    monkeypatch.setattr(main_module, 'get_deepfake_detector', lambda: FakeDetector())
    monkeypatch.setattr(routes_module, 'get_deepfake_detector', lambda: FakeDetector())
    client = TestClient(app)

    response = client.post(
        '/api/deepfake/detect',
        files={'media': ('sample.gif', BytesIO(b'gif payload'), 'image/gif')},
    )

    assert response.status_code == 400