from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from core.settings import settings
from services.deepfake_detector import get_deepfake_detector

app = FastAPI(title="VeriGraph API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def preload_deepfake_detector() -> None:
    get_deepfake_detector()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "verigraph-backend"}


app.include_router(api_router, prefix="/api")
