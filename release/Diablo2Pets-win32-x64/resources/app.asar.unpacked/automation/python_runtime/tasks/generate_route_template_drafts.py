from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np


@dataclass(frozen=True)
class RouteAlias:
    display_name: str
    slug: str


@dataclass(frozen=True)
class CropPreset:
    name: str
    x: float
    y: float
    width: float
    height: float
    threshold: float


ROUTE_ALIASES: dict[str, RouteAlias] = {
    "3c": RouteAlias("3C", "3c"),
    "chaos": RouteAlias("3C", "3c"),
    "chaossanctuary": RouteAlias("3C", "3c"),
    "混沌避难所": RouteAlias("3C", "3c"),
    "牛场": RouteAlias("牛场", "cow"),
    "cow": RouteAlias("牛场", "cow"),
    "cows": RouteAlias("牛场", "cow"),
    "secretcowlevel": RouteAlias("牛场", "cow"),
    "巴尔": RouteAlias("巴尔", "baal"),
    "baal": RouteAlias("巴尔", "baal"),
    "worldstonekeep": RouteAlias("巴尔", "baal"),
}

DEFAULT_CROP_PRESETS: tuple[CropPreset, ...] = (
    CropPreset("scene_left_upper", 0.12, 0.16, 0.18, 0.14, 0.82),
    CropPreset("scene_center_upper", 0.39, 0.15, 0.20, 0.14, 0.82),
    CropPreset("scene_right_upper", 0.68, 0.16, 0.18, 0.14, 0.82),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate candidate route template crops from the latest captured screenshot."
    )
    parser.add_argument(
        "--capture-dir",
        type=Path,
        required=True,
        help="Directory containing captured game window screenshots.",
    )
    parser.add_argument(
        "--template-root",
        type=Path,
        required=True,
        help="User-writable route template workspace root.",
    )
    parser.add_argument(
        "--route-name",
        required=True,
        help="Current route name, for example 3C, 牛场, 巴尔.",
    )
    return parser.parse_args()


def normalize_route(route_name: str) -> RouteAlias:
    normalized = "".join(route_name.lower().split())
    alias = ROUTE_ALIASES.get(normalized)
    if alias:
        return alias

    lowered = route_name.strip().lower()
    alias = ROUTE_ALIASES.get(lowered)
    if alias:
        return alias

    raise RuntimeError(
        "当前只支持给 3C、牛场、巴尔生成候选模板。请先把默认路线切到这三条中的一条。"
    )


def read_image_bgr(path: Path) -> np.ndarray:
    data = np.fromfile(str(path), dtype=np.uint8)
    if data.size == 0:
        raise RuntimeError(f"截图文件为空：{path}")

    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"无法读取截图：{path}")
    return image


def write_image(path: Path, image: np.ndarray) -> None:
    suffix = path.suffix or ".png"
    success, encoded = cv2.imencode(suffix, image)
    if not success:
        raise RuntimeError(f"无法写出模板图：{path}")
    encoded.tofile(str(path))


def get_latest_capture(capture_dir: Path) -> Path:
    if not capture_dir.exists():
        raise RuntimeError("还没有路线截图目录，请先在桌宠里点一次“抓当前游戏截图”。")

    candidates = sorted(
        capture_dir.glob("route-snapshot-*.png"),
        key=lambda item: item.stat().st_mtime,
        reverse=True,
    )
    if not candidates:
        raise RuntimeError("还没有可用的路线截图，请先在游戏里点一次“抓当前游戏截图”。")

    return candidates[0]


def crop_region(image: np.ndarray, preset: CropPreset) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    height, width = image.shape[:2]
    left = max(0, min(width - 1, int(round(width * preset.x))))
    top = max(0, min(height - 1, int(round(height * preset.y))))
    crop_width = max(48, int(round(width * preset.width)))
    crop_height = max(36, int(round(height * preset.height)))
    right = min(width, left + crop_width)
    bottom = min(height, top + crop_height)

    if right <= left or bottom <= top:
        raise RuntimeError(f"裁图区域无效：{preset.name}")

    return image[top:bottom, left:right].copy(), (left, top, right, bottom)


def main() -> int:
    args = parse_args()
    route = normalize_route(args.route_name)
    latest_capture = get_latest_capture(args.capture_dir)
    source_image = read_image_bgr(latest_capture)

    route_dir = args.template_root / "routes" / route.slug
    route_dir.mkdir(parents=True, exist_ok=True)

    preview = source_image.copy()
    generated_files: list[str] = []
    entries: list[dict[str, str | float]] = []

    for index, preset in enumerate(DEFAULT_CROP_PRESETS, start=1):
        crop, (left, top, right, bottom) = crop_region(source_image, preset)
        output_name = f"auto_{route.slug}_{index}_{preset.name}.png"
        output_path = route_dir / output_name
        write_image(output_path, crop)

        relative_path = output_path.relative_to(args.template_root).as_posix()
        generated_files.append(relative_path)
        entries.append(
            {
                "name": f"auto_{route.slug}_{index}",
                "filename": relative_path,
                "threshold": preset.threshold,
            }
        )

        cv2.rectangle(preview, (left, top), (right, bottom), (80, 190, 255), 2)
        cv2.putText(
            preview,
            str(index),
            (left + 8, top + 24),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (80, 190, 255),
            2,
            cv2.LINE_AA,
        )

    preview_path = route_dir / f"auto_{route.slug}_draft_preview.png"
    write_image(preview_path, preview)

    print(
        json.dumps(
            {
                "routeName": route.display_name,
                "routeSlug": route.slug,
                "sourcePath": str(latest_capture),
                "previewPath": str(preview_path),
                "generatedFiles": generated_files,
                "entries": entries,
                "detail": (
                    f"已从最新截图为 {route.display_name} 生成 {len(entries)} 张候选模板，"
                    "并输出了一张带选框的预览图。"
                ),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
