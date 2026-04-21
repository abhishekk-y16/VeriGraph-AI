from pathlib import Path

import numpy as np
import pytest
from PIL import Image
import torch

import services.deepfake_detector as detector_module
from services.deepfake_detector import DeepfakeDetector


def _create_image(path: Path) -> None:
    image = Image.new('RGB', (32, 32), color=(120, 20, 20))
    image.save(path)


class FakeLinear:
    def __init__(self, in_features: int = 128) -> None:
        self.in_features = in_features


class FakeEfficientNet:
    def __init__(self) -> None:
        self.classifier = [None, FakeLinear()]

    def to(self, device):
        return self

    def eval(self):
        return self

    def __call__(self, tensor):
        return torch.zeros((1, 1))


class FakeCapture:
    def __init__(self, frame_count: int, fps: float = 1.0) -> None:
        self.frame_count = frame_count
        self.fps = fps
        self.position = 0
        self.released = False

    def isOpened(self) -> bool:
        return True

    def get(self, prop_id: int) -> float:
        if prop_id == 7:  # cv2.CAP_PROP_FRAME_COUNT
            return float(self.frame_count)
        if prop_id == 5:  # cv2.CAP_PROP_FPS
            return float(self.fps)
        return 0.0

    def set(self, prop_id: int, value: float) -> None:
        if prop_id == 1:  # cv2.CAP_PROP_POS_FRAMES
            self.position = int(value)

    def read(self):
        if self.position >= self.frame_count:
            return False, None
        frame = np.zeros((8, 8, 3), dtype=np.uint8)
        self.position += 1
        return True, frame

    def release(self) -> None:
        self.released = True


def test_detect_image_returns_binary_result(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    image_path = tmp_path / 'sample.png'
    _create_image(image_path)

    monkeypatch.setattr(detector_module.models, 'efficientnet_b0', lambda weights=None: FakeEfficientNet())

    detector = DeepfakeDetector()
    monkeypatch.setattr(detector, '_predict_image', lambda image: 0.87)

    result = detector.detect_image(str(image_path))

    assert result.media_type == 'image'
    assert result.prediction == 'Fake'
    assert result.confidence == pytest.approx(0.87, rel=1e-4)
    assert result.metadata['framesAnalyzed'] == 1


def test_detect_video_uses_two_pass_sampling(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    video_path = tmp_path / 'sample.mp4'
    video_path.write_bytes(b'fake video payload')

    monkeypatch.setattr(detector_module.models, 'efficientnet_b0', lambda weights=None: FakeEfficientNet())

    detector = DeepfakeDetector()
    probabilities = iter([0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.3, 0.4, 0.5, 0.6])
    monkeypatch.setattr(detector, '_predict_image', lambda image: next(probabilities))
    monkeypatch.setattr('services.deepfake_detector.cv2.VideoCapture', lambda path: FakeCapture(frame_count=6, fps=1.0))

    result = detector.detect_video(str(video_path))

    assert result.media_type == 'video'
    assert result.metadata['framesAnalyzed'] >= 3
    assert 'two_pass' in result.metadata['samplingStrategy']
