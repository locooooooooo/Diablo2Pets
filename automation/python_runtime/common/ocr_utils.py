from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Iterable

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None

try:
    import pyautogui
except ImportError:  # pragma: no cover
    pyautogui = None

try:
    import pytesseract
except ImportError:  # pragma: no cover
    pytesseract = None

try:
    from PIL import Image, ImageGrab
except ImportError:  # pragma: no cover
    Image = None
    ImageGrab = None

try:
    from rapidocr_onnxruntime import RapidOCR

    rapid_ocr_engine = RapidOCR()
except ImportError:  # pragma: no cover
    rapid_ocr_engine = None


TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
DEFAULT_GRID_CAPTURE_BOXES = (
    {"name": "tight", "offset": (0, 0), "size": (30, 25)},
    {"name": "wide", "offset": (-6, -4), "size": (42, 30)},
    {"name": "lower", "offset": (-4, 0), "size": (38, 28)},
)

if pytesseract and os.path.exists(TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


def _normalize_crop_scale(crop_scale=None) -> tuple[float, float]:
    if crop_scale is None:
        return 1.0, 1.0

    if isinstance(crop_scale, (int, float)):
        scale = max(0.1, float(crop_scale))
        return scale, scale

    if isinstance(crop_scale, (list, tuple)) and len(crop_scale) == 2:
        scale_x = max(0.1, float(crop_scale[0]))
        scale_y = max(0.1, float(crop_scale[1]))
        return scale_x, scale_y

    return 1.0, 1.0


def _require_image_stack() -> None:
    missing: list[str] = []
    if cv2 is None:
        missing.append("opencv-python")
    if np is None:
        missing.append("numpy")
    if Image is None:
        missing.append("pillow")
    if missing:
        raise RuntimeError("Missing OCR/image packages: " + ", ".join(missing))


def check_ocr_available() -> bool:
    if rapid_ocr_engine is not None:
        return True
    if not pytesseract:
        return False
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def get_available_ocr_engine() -> str:
    if rapid_ocr_engine is not None:
        return "rapidocr"
    if not pytesseract:
        return "none"
    try:
        pytesseract.get_tesseract_version()
        return "tesseract"
    except Exception:
        return "none"


def get_ocr_status() -> dict[str, Any]:
    status = {
        "available": False,
        "backend": None,
        "rapidocr_available": bool(rapid_ocr_engine),
        "pytesseract_installed": bool(pytesseract),
        "tesseract_configured_path": TESSERACT_CMD if os.path.exists(TESSERACT_CMD) else None,
        "detail": "",
    }

    if rapid_ocr_engine is not None:
        status["available"] = True
        status["backend"] = "rapidocr"
        status["detail"] = "RapidOCR available"
        return status

    if not pytesseract:
        status["detail"] = "RapidOCR unavailable; pytesseract not installed"
        return status

    try:
        pytesseract.get_tesseract_version()
        status["available"] = True
        status["backend"] = "tesseract"
        status["detail"] = "Tesseract available"
    except pytesseract.TesseractNotFoundError:
        status["detail"] = "RapidOCR unavailable; Tesseract executable not found"
    except Exception as exc:
        status["detail"] = f"OCR probe failed: {exc}"

    return status


def get_clipboard_image() -> Any | None:
    if ImageGrab is None or Image is None:
        return None
    try:
        image = ImageGrab.grabclipboard()
    except Exception:
        return None
    if isinstance(image, Image.Image):
        return image
    return None


def open_image_file(path: str | Path) -> Any:
    _require_image_stack()
    return Image.open(path)


def _ensure_pil_image(image: Any) -> Any:
    _require_image_stack()
    if isinstance(image, Image.Image):
        return image.convert("RGB")
    if isinstance(image, np.ndarray):
        if image.ndim == 2:
            return Image.fromarray(image).convert("RGB")
        if image.ndim == 3:
            return Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)).convert("RGB")
    raise TypeError(f"Unsupported image type: {type(image)!r}")


def _resize_image(image: Any, scale_percent: int) -> Any:
    width = max(1, int(image.shape[1] * scale_percent / 100))
    height = max(1, int(image.shape[0] * scale_percent / 100))
    return cv2.resize(image, (width, height), interpolation=cv2.INTER_CUBIC)


def _extract_digits(text: str, max_digits: int = 4) -> str:
    digits = "".join(ch for ch in (text or "") if ch.isdigit())
    if max_digits and len(digits) > max_digits:
        digits = digits[:max_digits]
    return digits


def _iter_number_variants(image: Any) -> list[tuple[str, Any]]:
    pil_image = _ensure_pil_image(image)
    gray = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2GRAY)
    variants = [
        ("gray", _resize_image(gray, 240)),
        ("binary180", _resize_image(cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)[1], 260)),
        ("otsu", _resize_image(cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1], 260)),
        (
            "adaptive",
            _resize_image(
                cv2.adaptiveThreshold(
                    gray,
                    255,
                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                    cv2.THRESH_BINARY,
                    11,
                    2,
                ),
                260,
            ),
        ),
    ]
    variants.append(("binary180_inv", cv2.bitwise_not(variants[1][1])))
    return variants


def _normalize_crop_box(crop_box: Any, crop_scale=None) -> dict[str, int | str]:
    if crop_box is None:
        crop_box = DEFAULT_GRID_CAPTURE_BOXES[0]

    scale_x, scale_y = _normalize_crop_scale(crop_scale)

    if isinstance(crop_box, dict):
        offset_x, offset_y = crop_box.get("offset", (0, 0))
        width, height = crop_box.get("size", (30, 25))
        name = crop_box.get("name", "custom")
    else:
        offset_x, offset_y, width, height = crop_box
        name = "custom"
    return {
        "name": str(name),
        "offset_x": int(round(offset_x * scale_x)),
        "offset_y": int(round(offset_y * scale_y)),
        "width": max(1, int(round(width * scale_x))),
        "height": max(1, int(round(height * scale_y))),
    }


def _resolve_capture_region(
    anchor_x: int,
    anchor_y: int,
    crop_box: Any = None,
    crop_scale=None,
) -> tuple[str, int, int, int, int]:
    normalized = _normalize_crop_box(crop_box, crop_scale=crop_scale)
    left = int(round(anchor_x + int(normalized["offset_x"])))
    top = int(round(anchor_y + int(normalized["offset_y"])))
    return (
        str(normalized["name"]),
        left,
        top,
        int(normalized["width"]),
        int(normalized["height"]),
    )


def preprocess_for_text(image: Any) -> Any:
    pil_image = _ensure_pil_image(image)
    gray = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2GRAY)
    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2,
    )
    return _resize_image(binary, 150)


def recognize_text(image: Any, lang: str = "chi_sim+eng") -> str:
    try:
        if rapid_ocr_engine is not None:
            result, _ = rapid_ocr_engine(np.array(_ensure_pil_image(image)))
            if not result:
                return ""
            return "\n".join(line[1] for line in result)
        if pytesseract:
            processed = preprocess_for_text(image)
            config = r"--oem 3 --psm 6"
            return pytesseract.image_to_string(processed, lang=lang, config=config).strip()
    except Exception:
        return ""
    return ""


def recognize_number(
    image_region: Any,
    *,
    default: int = 0,
    max_digits: int = 4,
    return_meta: bool = False,
) -> Any:
    best_meta = {
        "recognized": False,
        "confidence": 0.0,
        "engine": None,
        "variant": None,
        "raw_text": "",
    }
    try:
        for variant_name, processed in _iter_number_variants(image_region):
            if rapid_ocr_engine is not None:
                result, _ = rapid_ocr_engine(processed)
                if result:
                    raw_text = "".join(line[1] for line in result)
                    digits = _extract_digits(raw_text, max_digits=max_digits)
                    confidence = sum(float(line[2]) for line in result) / len(result)
                    if digits:
                        meta = {
                            "recognized": True,
                            "confidence": confidence,
                            "engine": "rapidocr",
                            "variant": variant_name,
                            "raw_text": raw_text,
                        }
                        value = int(digits)
                        return (value, meta) if return_meta else value
                    if confidence > best_meta["confidence"]:
                        best_meta = {
                            "recognized": False,
                            "confidence": confidence,
                            "engine": "rapidocr",
                            "variant": variant_name,
                            "raw_text": raw_text,
                        }
            if pytesseract:
                config = r"--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789"
                raw_text = pytesseract.image_to_string(processed, config=config).strip()
                digits = _extract_digits(raw_text, max_digits=max_digits)
                if digits:
                    confidence = 0.5
                    try:
                        data = pytesseract.image_to_data(
                            processed,
                            config=config,
                            output_type=pytesseract.Output.DICT,
                        )
                        conf_values = [
                            float(conf)
                            for conf in data.get("conf", [])
                            if conf not in ("", "-1")
                        ]
                        if conf_values:
                            confidence = max(0.0, min(1.0, sum(conf_values) / len(conf_values) / 100.0))
                    except Exception:
                        pass
                    meta = {
                        "recognized": True,
                        "confidence": confidence,
                        "engine": "tesseract",
                        "variant": variant_name,
                        "raw_text": raw_text,
                    }
                    value = int(digits)
                    return (value, meta) if return_meta else value
                if best_meta["engine"] is None:
                    best_meta = {
                        "recognized": False,
                        "confidence": 0.0,
                        "engine": "tesseract",
                        "variant": variant_name,
                        "raw_text": raw_text,
                    }
    except Exception:
        pass
    return (default, best_meta) if return_meta else default


def capture_grid_cell(
    center_x: int,
    center_y: int,
    *,
    crop_box: Any = None,
    crop_scale=None,
) -> Any | None:
    if pyautogui is None:
        return None
    _, left, top, width, height = _resolve_capture_region(
        center_x,
        center_y,
        crop_box=crop_box,
        crop_scale=crop_scale,
    )
    return pyautogui.screenshot(region=(left, top, width, height))


def capture_grid_cell_variants(
    center_x: int,
    center_y: int,
    *,
    crop_boxes: Iterable[Any] | None = None,
    crop_scale=None,
) -> list[tuple[str, Any | None]]:
    crop_boxes = tuple(crop_boxes or DEFAULT_GRID_CAPTURE_BOXES)
    return [
        (
            box.get("name", f"variant_{index}"),
            capture_grid_cell(center_x, center_y, crop_box=box, crop_scale=crop_scale),
        )
        for index, box in enumerate(crop_boxes)
    ]


def crop_grid_cell_from_image(
    image: Any,
    center_x: int,
    center_y: int,
    *,
    crop_box: Any = None,
    crop_scale=None,
) -> Any:
    pil_image = _ensure_pil_image(image)
    _, left, top, width, height = _resolve_capture_region(
        center_x,
        center_y,
        crop_box=crop_box,
        crop_scale=crop_scale,
    )
    left = max(0, left)
    top = max(0, top)
    right = min(pil_image.size[0], left + width)
    bottom = min(pil_image.size[1], top + height)
    return pil_image.crop((left, top, right, bottom))


def crop_grid_cell_variants_from_image(
    image: Any,
    center_x: int,
    center_y: int,
    *,
    crop_boxes: Iterable[Any] | None = None,
    crop_scale=None,
) -> list[tuple[str, Any]]:
    crop_boxes = tuple(crop_boxes or DEFAULT_GRID_CAPTURE_BOXES)
    return [
        (
            box.get("name", f"variant_{index}"),
            crop_grid_cell_from_image(
                image,
                center_x,
                center_y,
                crop_box=box,
                crop_scale=crop_scale,
            ),
        )
        for index, box in enumerate(crop_boxes)
    ]
