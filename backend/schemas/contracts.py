from typing import Any, Literal
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    query: str = Field(min_length=4, max_length=1000)


class LayerResult(BaseModel):
    name: Literal["NLP", "GNN", "ML-FactCheck"]
    score: int = Field(ge=0, le=100)
    explanation: str
    status: Literal["available", "insufficient_evidence", "unavailable"] = "available"
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence: dict[str, Any] = Field(default_factory=dict)
    errorCode: str | None = None


class GraphNode(BaseModel):
    id: str
    label: str
    followers: int = Field(ge=0)
    cluster: int = Field(ge=0)


class GraphLink(BaseModel):
    source: str
    target: str
    kind: Literal["semantic", "temporal", "url"]


class SourceVerification(BaseModel):
    provider: Literal["NewsAPI"] = "NewsAPI"
    status: Literal["verified", "ambiguous", "unmatched", "disabled"]
    message: str
    confidence: float | None = Field(default=None, ge=0, le=1)
    queryUsed: str | None = None
    matchedTitle: str | None = None
    matchedUrl: str | None = None
    matchedSource: str | None = None


class PostItem(BaseModel):
    id: str
    username: str
    timestamp: str
    text: str
    likes: int = Field(ge=0)
    shares: int = Field(ge=0)
    url: str | None = None
    sourceName: str | None = None
    sourceVerification: SourceVerification | None = None


class AnalyzeResponse(BaseModel):
    query: str
    finalScore: int = Field(ge=0, le=100)
    riskLevel: Literal["Low", "Medium", "High", "Inconclusive"]
    resultStatus: Literal["final", "inconclusive"] = "final"
    confidence: float = Field(default=0.0, ge=0, le=1)
    summary: str
    layers: list[LayerResult]
    nodes: list[GraphNode]
    links: list[GraphLink]
    posts: list[PostItem]


class ErrorResponse(BaseModel):
    detail: str
    requestId: str


class DeepfakeMetadata(BaseModel):
    fileName: str
    mimeType: str
    fileSizeBytes: int = Field(ge=0)
    mediaType: Literal["image", "video"]
    modelVersion: str
    frameCount: int | None = Field(default=None, ge=0)
    framesAnalyzed: int | None = Field(default=None, ge=0)
    samplingStrategy: str | None = None


class DeepfakeResponse(BaseModel):
    mediaType: Literal["image", "video"]
    prediction: Literal["Real", "Fake"]
    confidence: float = Field(ge=0, le=1)
    confidenceLevel: Literal["Low", "Medium", "High"]
    processingTimeMs: int = Field(ge=0)
    message: str
    metadata: DeepfakeMetadata
