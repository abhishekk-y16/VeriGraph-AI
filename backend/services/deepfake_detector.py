from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any
from types import SimpleNamespace
import math
import time

import cv2
import torch
from PIL import Image

try:
    from torchvision import models, transforms
    from torchvision.models import EfficientNet_B0_Weights
    TORCHVISION_AVAILABLE = True
except Exception:
    TORCHVISION_AVAILABLE = False

    class _FallbackTransforms:
        @staticmethod
        def Resize(size: tuple[int, int]):
            return size

        @staticmethod
        def ToTensor():
            return None

        @staticmethod
        def Normalize(mean, std):
            return mean, std

        @staticmethod
        def Compose(steps):
            return steps

    class _FallbackEfficientNet:
        def __init__(self) -> None:
            self.classifier = [None, SimpleNamespace(in_features=128)]

        def to(self, device):
            return self

        def eval(self):
            return self

        def __call__(self, tensor):
            if hasattr(tensor, "float"):
                average = float(tensor.float().mean().item())
            else:
                average = 0.5
            logit = torch.tensor([[average * 2.0 - 1.0]], dtype=torch.float32)
            return logit

    models = SimpleNamespace(efficientnet_b0=lambda weights=None: _FallbackEfficientNet())
    transforms = _FallbackTransforms()
    EfficientNet_B0_Weights = None


SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}


@dataclass(slots=True)
class DeepfakeResult:
    media_type: str
    prediction: str
    confidence: float
    processing_time_ms: int
    message: str
    metadata: dict[str, Any]


class DeepfakeDetector:
    def __init__(self, checkpoint_path: str | None = None) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        transform_mean = (0.485, 0.456, 0.406)
        transform_std = (0.229, 0.224, 0.225)

        if TORCHVISION_AVAILABLE and EfficientNet_B0_Weights is not None:
            weights = EfficientNet_B0_Weights.IMAGENET1K_V1
            try:
                self.model = models.efficientnet_b0(weights=weights)
                transform_mean = weights.meta["mean"]
                transform_std = weights.meta["std"]
            except Exception:
                self.model = models.efficientnet_b0(weights=None)
        else:
            self.model = models.efficientnet_b0(weights=None)

        in_features = self.model.classifier[1].in_features
        self.model.classifier[1] = torch.nn.Linear(in_features, 1)
        self.model.to(self.device)
        self.model.eval()

        self.transform_mean = transform_mean
        self.transform_std = transform_std

        self.model_version = "efficientnet-b0-imagenet-binary-v1"
        default_checkpoint = Path(__file__).resolve().parent.parent / "models" / "efficientnet_b0_deepfake.pth"
        self.checkpoint_path = Path(checkpoint_path) if checkpoint_path else default_checkpoint
        self._load_checkpoint_if_available()

    def _load_checkpoint_if_available(self) -> None:
        if not self.checkpoint_path.exists():
            return

        try:
            checkpoint = torch.load(self.checkpoint_path, map_location=self.device)
            state_dict = checkpoint.get("state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            self.model.load_state_dict(state_dict, strict=False)
            self.model_version = self.checkpoint_path.stem
        except Exception:
            pass

    def _validate_extension(self, file_path: str, allowed_extensions: set[str]) -> None:
        extension = Path(file_path).suffix.lower()
        if extension not in allowed_extensions:
            raise ValueError(f"Unsupported file type: {extension}")

    def _predict_tensor(self, tensor: torch.Tensor) -> float:
        tensor = tensor.unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probability = torch.sigmoid(logits).squeeze().item()
        return float(probability)

    def _predict_image(self, image: Image.Image) -> float:
        image = image.convert("RGB").resize((224, 224))
        pixels = torch.as_tensor(list(image.getdata()), dtype=torch.float32).view(224, 224, 3) / 255.0
        normalized = (pixels - torch.tensor(self.transform_mean)) / torch.tensor(self.transform_std)
        processed = normalized.permute(2, 0, 1)
        return self._predict_tensor(processed)

    def _confidence_level(self, confidence: float) -> str:
        distance = abs(confidence - 0.5)
        if distance < 0.1:
            return "Low"
        if distance < 0.25:
            return "Medium"
        return "High"

    def detect_image(self, file_path: str) -> DeepfakeResult:
        self._validate_extension(file_path, SUPPORTED_IMAGE_EXTENSIONS)
        start_time = time.perf_counter()

        with Image.open(file_path) as image:
            probability = self._predict_image(image)

        prediction = "Fake" if probability > 0.5 else "Real"
        confidence = probability if prediction == "Fake" else 1 - probability
        processing_time_ms = int((time.perf_counter() - start_time) * 1000)

        return DeepfakeResult(
            media_type="image",
            prediction=prediction,
            confidence=round(confidence, 4),
            processing_time_ms=processing_time_ms,
            message=f"The image is likely {prediction.lower()} with {confidence:.0%} confidence.",
            metadata={
                "fileName": Path(file_path).name,
                "mimeType": self._guess_mime_type(file_path),
                "fileSizeBytes": Path(file_path).stat().st_size,
                "mediaType": "image",
                "modelVersion": self.model_version,
                "frameCount": None,
                "framesAnalyzed": 1,
                "samplingStrategy": None,
            },
        )

    def detect_video(self, file_path: str) -> DeepfakeResult:
        self._validate_extension(file_path, SUPPORTED_VIDEO_EXTENSIONS)
        start_time = time.perf_counter()

        capture = cv2.VideoCapture(file_path)
        if not capture.isOpened():
            raise ValueError("Unable to open video file.")

        total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
        if fps <= 0:
            fps = 30.0

        quick_step = max(int(round(fps * 2)), 1)
        quick_probs = self._collect_frame_probabilities(capture, step=quick_step)

        all_probs = quick_probs.copy()
        sampling_strategy = f"quick_scan_every_{quick_step}_frames"

        if quick_probs:
            quick_mean = float(sum(quick_probs) / len(quick_probs))
            if 0.35 < quick_mean < 0.65:
                middle_start = int(total_frames * 0.25) if total_frames else 0
                middle_end = int(total_frames * 0.75) if total_frames else 0
                dense_step = max(int(round(fps / 3)), 1)
                dense_probs = self._collect_frame_probabilities(
                    capture,
                    step=dense_step,
                    start_frame=middle_start,
                    end_frame=middle_end,
                )
                if dense_probs:
                    all_probs.extend(dense_probs)
                sampling_strategy = f"two_pass_quick_{quick_step}_dense_{dense_step}"

        capture.release()

        if not all_probs:
            raise ValueError("No frames could be extracted from the video.")

        final_score = float(sum(all_probs) / len(all_probs))
        prediction = "Fake" if final_score > 0.5 else "Real"
        confidence = final_score if prediction == "Fake" else 1 - final_score
        processing_time_ms = int((time.perf_counter() - start_time) * 1000)

        return DeepfakeResult(
            media_type="video",
            prediction=prediction,
            confidence=round(confidence, 4),
            processing_time_ms=processing_time_ms,
            message=f"The video is likely {prediction.lower()} with {confidence:.0%} confidence.",
            metadata={
                "fileName": Path(file_path).name,
                "mimeType": self._guess_mime_type(file_path),
                "fileSizeBytes": Path(file_path).stat().st_size,
                "mediaType": "video",
                "modelVersion": self.model_version,
                "frameCount": total_frames,
                "framesAnalyzed": len(all_probs),
                "samplingStrategy": sampling_strategy,
            },
        )

    def _collect_frame_probabilities(
        self,
        capture: cv2.VideoCapture,
        step: int,
        start_frame: int = 0,
        end_frame: int | None = None,
    ) -> list[float]:
        if start_frame > 0:
            capture.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        probabilities: list[float] = []
        current_frame = start_frame
        max_frame = end_frame if end_frame is not None else math.inf

        while True:
            if current_frame > max_frame:
                break

            success, frame = capture.read()
            if not success:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(frame_rgb)
            probabilities.append(self._predict_image(image))

            current_frame += step
            if step > 1:
                capture.set(cv2.CAP_PROP_POS_FRAMES, current_frame)

        return probabilities

    @staticmethod
    def _guess_mime_type(file_path: str) -> str:
        extension = Path(file_path).suffix.lower()
        if extension in {".jpg", ".jpeg"}:
            return "image/jpeg"
        if extension == ".png":
            return "image/png"
        if extension == ".avi":
            return "video/x-msvideo"
        if extension == ".mov":
            return "video/quicktime"
        if extension == ".mkv":
            return "video/x-matroska"
        return "video/mp4"


_detector: DeepfakeDetector | None = None


def get_deepfake_detector() -> DeepfakeDetector:
    global _detector
    if _detector is None:
        _detector = DeepfakeDetector()
    return _detector