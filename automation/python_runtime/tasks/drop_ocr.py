from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


CURRENT_DIR = Path(__file__).resolve().parent
RUNTIME_ROOT = CURRENT_DIR.parent
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

from common.ocr_utils import (  # noqa: E402
    check_ocr_available,
    get_available_ocr_engine,
    open_image_file,
    recognize_text,
)


NOISE_PREFIXES = (
    "shift",
    "ctrl",
    "alt",
    "caps",
    "fps",
    "ping",
)


def clean_line(value: str) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    text = text.replace("|", " ")
    return text.strip(" -~`!@#$%^&*_=+")


def is_noise_line(value: str) -> bool:
    if not value:
        return True

    lowered = value.lower()
    if any(lowered.startswith(prefix) for prefix in NOISE_PREFIXES):
        return True

    if re.fullmatch(r"[\d\s.:/%+-]+", value):
        return True

    if len(value) <= 1:
        return True

    return False


def split_lines(raw_text: str) -> list[str]:
    lines: list[str] = []
    for part in str(raw_text or "").splitlines():
        cleaned = clean_line(part)
        if not cleaned or is_noise_line(cleaned):
            continue
        lines.append(cleaned)
    return lines


def build_result(image_path: Path) -> dict[str, Any]:
    engine = get_available_ocr_engine()
    if not check_ocr_available():
        return {
            "success": False,
            "imagePath": str(image_path),
            "text": "",
            "lines": [],
            "suggestedItemName": "",
            "suggestedNote": "",
            "engine": engine,
            "warning": "OCR engine is unavailable. Install RapidOCR or Tesseract first.",
        }

    image = open_image_file(image_path)
    raw_text = recognize_text(image)
    lines = split_lines(raw_text)
    suggested_item_name = lines[0] if lines else ""
    suggested_note = " | ".join(lines[1:5]) if len(lines) > 1 else ""

    return {
        "success": True,
        "imagePath": str(image_path),
        "text": raw_text,
        "lines": lines,
        "suggestedItemName": suggested_item_name,
        "suggestedNote": suggested_note,
        "engine": engine,
        "warning": "" if lines else "OCR completed, but no clear text lines were extracted.",
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run OCR on a drop screenshot and return structured suggestions."
    )
    parser.add_argument(
        "--image",
        required=True,
        help="Path to the screenshot image.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print the OCR result as JSON.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    image_path = Path(args.image).expanduser().resolve()
    if not image_path.exists():
        raise FileNotFoundError(f"Screenshot image not found: {image_path}")

    result = build_result(image_path)

    if args.json:
        print(json.dumps(result, ensure_ascii=False))
        return 0

    print(f"Image: {result['imagePath']}")
    print(f"Engine: {result['engine']}")
    print(f"Suggested item: {result['suggestedItemName'] or '(empty)'}")
    print(f"Suggested note: {result['suggestedNote'] or '(empty)'}")
    print()
    print(result["text"] or "(empty)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
