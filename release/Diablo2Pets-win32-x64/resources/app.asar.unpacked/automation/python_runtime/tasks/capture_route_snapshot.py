from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

try:
    import pyautogui
except ImportError:  # pragma: no cover - runtime dependency
    pyautogui = None

RUNTIME_ROOT = Path(__file__).resolve().parents[1]
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

from common.game_actions import (
    DEFAULT_GAME_WINDOW_TITLE,
    get_game_window,
    require_runtime_dependencies,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture the current Diablo II game window for route template authoring."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        required=True,
        help="Directory used to store captured route screenshots.",
    )
    parser.add_argument(
        "--game-window-title",
        default=DEFAULT_GAME_WINDOW_TITLE,
        help="Target game window title.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    require_runtime_dependencies("pyautogui", "pygetwindow")

    if pyautogui is None:
        raise RuntimeError("pyautogui is required for route snapshot capture.")

    window = get_game_window(game_window_title=args.game_window_title)
    if not window:
        raise RuntimeError(f"没有找到游戏窗口：{args.game_window_title}")

    left = int(getattr(window, "left", 0))
    top = int(getattr(window, "top", 0))
    width = int(getattr(window, "width", 0))
    height = int(getattr(window, "height", 0))

    if width <= 0 or height <= 0:
        raise RuntimeError("找到了游戏窗口，但窗口尺寸无效，无法截图。")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    filename = f"route-snapshot-{datetime.now().strftime('%Y%m%d-%H%M%S')}.png"
    output_path = args.output_dir / filename

    image = pyautogui.screenshot(region=(left, top, width, height))
    image.save(output_path)

    print(
        json.dumps(
            {
                "path": str(output_path),
                "detail": "已抓取当前游戏窗口截图。你可以从这张图里裁出 3C、牛场、巴尔等稳定 UI 区域，作为路线模板。",
                "width": width,
                "height": height,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
