from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import numpy as np

try:
    import pyautogui
except ImportError:  # pragma: no cover - runtime dependency
    pyautogui = None

from common.game_actions import DEFAULT_GAME_WINDOW_TITLE, get_game_window, require_runtime_dependencies


@dataclass(frozen=True)
class TemplateSpec:
    name: str
    filename: str
    threshold: float


STATE_TEMPLATES: dict[str, tuple[TemplateSpec, ...]] = {
    "in-game-menu": (
        TemplateSpec("exit_save_btn", "exit_save_btn.png", 0.74),
    ),
    "in-game": (
        TemplateSpec("game_ui_bottom_bar", "game_ui_bottom_bar.png", 0.68),
    ),
    "lobby": (
        TemplateSpec("lobby_create_btn", "lobby_create_btn.png", 0.70),
        TemplateSpec("difficulty_hell_btn", "difficulty_hell_btn.png", 0.76),
    ),
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def emit(payload: dict[str, Any]) -> None:
    payload.setdefault("detectedAt", utc_now())
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Monitor Diablo II window state and emit JSON transitions for auto run counting."
    )
    parser.add_argument(
        "--game-window-title",
        default=DEFAULT_GAME_WINDOW_TITLE,
        help="Target game window title.",
    )
    parser.add_argument(
        "--template-root",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "assets" / "run_counter",
        help="Directory containing state detection templates.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.9,
        help="Polling interval in seconds.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Detect once and exit.",
    )
    return parser.parse_args()


def load_templates(template_root: Path) -> dict[str, dict[str, Any]]:
    loaded: dict[str, dict[str, Any]] = {}
    missing: list[str] = []

    for specs in STATE_TEMPLATES.values():
        for spec in specs:
            if spec.name in loaded:
                continue

            template_path = template_root / spec.filename
            image = cv2.imread(str(template_path), cv2.IMREAD_COLOR)
            if image is None:
                missing.append(str(template_path))
                continue

            loaded[spec.name] = {
                "image": image,
                "gray": cv2.cvtColor(image, cv2.COLOR_BGR2GRAY),
                "width": image.shape[1],
                "height": image.shape[0],
            }

    if missing:
        raise FileNotFoundError(
            "Missing run counter templates:\n" + "\n".join(sorted(missing))
        )

    return loaded


def capture_window_bgr(window: Any) -> np.ndarray | None:
    if pyautogui is None:
        return None

    left = int(getattr(window, "left", 0))
    top = int(getattr(window, "top", 0))
    width = int(getattr(window, "width", 0))
    height = int(getattr(window, "height", 0))

    if width <= 0 or height <= 0:
        return None

    screenshot = pyautogui.screenshot(region=(left, top, width, height))
    rgb = np.array(screenshot)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def find_template_confidence(
    screen_bgr: np.ndarray,
    screen_gray: np.ndarray,
    template: dict[str, Any],
) -> float:
    if (
        screen_bgr.shape[1] < template["width"]
        or screen_bgr.shape[0] < template["height"]
    ):
        return 0.0

    result = cv2.matchTemplate(screen_gray, template["gray"], cv2.TM_CCOEFF_NORMED)
    _min_val, max_val, _min_loc, _max_loc = cv2.minMaxLoc(result)
    return float(max_val)


def detect_state(
    game_window_title: str,
    templates: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    window = get_game_window(game_window_title=game_window_title)
    if not window:
        return {
            "state": "window-missing",
            "detail": f"没有找到窗口：{game_window_title}",
            "template": "",
            "confidence": 0.0,
        }

    screen_bgr = capture_window_bgr(window)
    if screen_bgr is None:
        return {
            "state": "window-missing",
            "detail": "游戏窗口存在，但截图失败。",
            "template": "",
            "confidence": 0.0,
        }

    screen_gray = cv2.cvtColor(screen_bgr, cv2.COLOR_BGR2GRAY)
    best_match = {
        "state": "unknown",
        "detail": "没有匹配到大厅或游戏中的关键模板。",
        "template": "",
        "confidence": 0.0,
    }

    for state_name in ("in-game-menu", "in-game", "lobby"):
        for spec in STATE_TEMPLATES[state_name]:
            confidence = find_template_confidence(
                screen_bgr,
                screen_gray,
                templates[spec.name],
            )
            if confidence > best_match["confidence"]:
                best_match = {
                    "state": "unknown",
                    "detail": f"最高匹配是 {spec.name} ({confidence:.3f})，但没到阈值。",
                    "template": spec.name,
                    "confidence": confidence,
                }

            if confidence >= spec.threshold:
                return {
                    "state": state_name,
                    "detail": f"匹配到 {spec.name} ({confidence:.3f})",
                    "template": spec.name,
                    "confidence": confidence,
                }

    return best_match


def main() -> int:
    args = parse_args()
    require_runtime_dependencies("pyautogui", "pygetwindow")

    if pyautogui is None:
        raise RuntimeError("pyautogui is required for run counter monitor.")

    templates = load_templates(args.template_root)
    last_state: str | None = None
    last_template: str | None = None

    emit(
        {
            "type": "ready",
            "state": "booting",
            "detail": "自动计数监控已启动。",
        }
    )

    while True:
        result = detect_state(args.game_window_title, templates)
        state = str(result["state"])
        template_name = str(result.get("template", ""))

        if state != last_state or template_name != last_template:
            emit(
                {
                    "type": "state",
                    "state": state,
                    "detail": result["detail"],
                    "template": template_name,
                    "confidence": round(float(result.get("confidence", 0.0)), 4),
                }
            )
            last_state = state
            last_template = template_name

        if args.once:
            return 0

        time.sleep(max(0.25, args.interval))


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        emit(
            {
                "type": "status",
                "state": "stopped",
                "detail": "自动计数监控已停止。",
            }
        )
        raise
