from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path
from typing import Any

try:
    import pyautogui
except ImportError:  # pragma: no cover
    pyautogui = None


CURRENT_DIR = Path(__file__).resolve().parent
RUNTIME_ROOT = CURRENT_DIR.parent
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

from common.game_actions import (  # noqa: E402
    DEFAULT_DELAY_MAX,
    DEFAULT_DELAY_MIN,
    DEFAULT_GAME_WINDOW_TITLE,
    DEFAULT_STOP_KEY,
    check_stop,
    get_game_window,
    is_game_active,
    random_sleep,
    record_coords,
    require_runtime_dependencies,
    safe_click,
)
from common.profile_store import read_json, write_json  # noqa: E402


ASSETS_DIR = RUNTIME_ROOT / "assets"
DEFAULT_PROFILE_PATH = RUNTIME_ROOT / "config" / "gold_drop_profile.json"


def create_default_profile() -> dict[str, Any]:
    return {
        "profile_version": 1,
        "name": "Default Gold Drop Profile",
        "game_window_title": DEFAULT_GAME_WINDOW_TITLE,
        "stop_key": DEFAULT_STOP_KEY,
        "delay_min": DEFAULT_DELAY_MIN,
        "delay_max": DEFAULT_DELAY_MAX,
        "use_image_recognition": True,
        "image_confidence": 0.8,
        "stash_template_path": str(ASSETS_DIR / "stash_template.png"),
        "stash_object_coords": [739, 423],
        "shared_stash_tab_coords": [267, 202],
        "stash_gold_btn_coords": [298, 717],
        "inventory_gold_btn_coords": [892, 711],
        "inventory_hotkey": "b",
        "close_ui_key": "esc",
    }


def load_profile(path: Path) -> dict[str, Any]:
    profile = create_default_profile()
    loaded = read_json(path, default={}) or {}
    profile.update(loaded)
    return profile


def save_profile(path: Path, profile: dict[str, Any]) -> None:
    write_json(path, profile)


def print_profile(profile: dict[str, Any]) -> None:
    import json

    print(json.dumps(profile, indent=2, ensure_ascii=False))


def record_profile(path: Path, profile: dict[str, Any] | None = None) -> dict[str, Any]:
    current = create_default_profile()
    if profile:
        current.update(profile)

    stop_key = str(current["stop_key"])
    game_window_title = str(current["game_window_title"])

    print("Recording gold drop profile.")
    current["stash_object_coords"] = record_coords(
        "Capture the stash object in the world as a fallback click position.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["shared_stash_tab_coords"] = record_coords(
        "Capture the shared stash tab.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["stash_gold_btn_coords"] = record_coords(
        "Capture the stash gold button.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["inventory_gold_btn_coords"] = record_coords(
        "Capture the inventory gold button.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )

    save_profile(path, current)
    return current


def compute_batches(total_gold: int, level: int) -> list[int]:
    max_carry = level * 10000
    if max_carry <= 0:
        raise ValueError("Character level must be positive.")

    batches = [max_carry] * (total_gold // max_carry)
    remainder = total_gold % max_carry
    if remainder > 0:
        batches.append(remainder)
    return batches


def find_stash_on_screen(profile: dict[str, Any]) -> tuple[int, int] | None:
    require_runtime_dependencies("pyautogui", "pygetwindow")

    if not profile.get("use_image_recognition", True):
        return None

    template_path = Path(str(profile.get("stash_template_path", "")))
    if not template_path.exists():
        return None

    window = get_game_window(game_window_title=str(profile["game_window_title"]))
    if not window:
        return None

    try:
        region = (window.left, window.top, window.width, window.height)
        result = pyautogui.locateCenterOnScreen(
            str(template_path),
            confidence=float(profile.get("image_confidence", 0.8)),
            grayscale=True,
            region=region,
        )
    except Exception:
        return None

    if not result:
        return None

    return result.x - window.left, result.y - window.top


def type_text(text: int | str, *, interval: float = 0.005, stop_key: str = DEFAULT_STOP_KEY) -> None:
    require_runtime_dependencies("pyautogui")
    check_stop(stop_key=stop_key)
    pyautogui.typewrite(str(text), interval=interval)


def press_key(key_name: str, *, stop_key: str = DEFAULT_STOP_KEY) -> None:
    require_runtime_dependencies("pyautogui")
    check_stop(stop_key=stop_key)
    pyautogui.press(key_name)


def open_stash_sequence(profile: dict[str, Any]) -> None:
    stash_coords = find_stash_on_screen(profile) or tuple(profile["stash_object_coords"])
    safe_click(
        stash_coords,
        game_window_title=str(profile["game_window_title"]),
        stop_key=str(profile["stop_key"]),
    )
    random_sleep(0.5, 0.8, stop_key=str(profile["stop_key"]))
    safe_click(
        profile["shared_stash_tab_coords"],
        game_window_title=str(profile["game_window_title"]),
        stop_key=str(profile["stop_key"]),
    )
    random_sleep(0.1, 0.3, stop_key=str(profile["stop_key"]))


def drop_gold_cycle(amount: int, profile: dict[str, Any]) -> None:
    stop_key = str(profile["stop_key"])
    game_window_title = str(profile["game_window_title"])
    close_ui_key = str(profile["close_ui_key"])
    inventory_hotkey = str(profile["inventory_hotkey"])

    print(f"Processing batch: {amount}")
    open_stash_sequence(profile)

    safe_click(
        profile["stash_gold_btn_coords"],
        game_window_title=game_window_title,
        stop_key=stop_key,
    )
    type_text(amount, stop_key=stop_key)
    press_key("enter", stop_key=stop_key)
    random_sleep(0.1, 0.2, stop_key=stop_key)

    press_key(close_ui_key, stop_key=stop_key)
    random_sleep(0.3, 0.5, stop_key=stop_key)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Gold drop task for the Diablo II desktop pet runtime."
    )
    parser.add_argument("--profile", default=str(DEFAULT_PROFILE_PATH))
    parser.add_argument("--record-profile", action="store_true")
    parser.add_argument("--print-profile", action="store_true")
    parser.add_argument("--amount", type=int, help="Total gold to drop.")
    parser.add_argument("--level", type=int, default=90, help="Character level.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--wait-seconds", type=float, default=5.0)
    parser.add_argument("--allow-inactive-window", action="store_true")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    profile_path = Path(args.profile).expanduser().resolve()
    profile = load_profile(profile_path)

    if args.record_profile:
        profile = record_profile(profile_path, profile=profile)
        print(f"Saved recorded gold profile to {profile_path}")

    if args.print_profile:
        print_profile(profile)
        if args.amount is None:
            return 0

    if args.amount is None:
        if args.record_profile:
            return 0
        parser.print_help()
        return 0

    batches = compute_batches(args.amount, args.level)
    max_carry = args.level * 10000
    print(f"Max carry per trip: {max_carry}")
    print(f"Batches: {batches}")

    if args.dry_run:
        return 0

    game_window_title = str(profile["game_window_title"])
    if not args.allow_inactive_window and not is_game_active(game_window_title=game_window_title):
        raise RuntimeError(
            f"Game window '{game_window_title}' is not active. "
            "Focus the game window or pass --allow-inactive-window."
        )

    wait_seconds = max(0.0, float(args.wait_seconds))
    if wait_seconds > 0:
        print(f"Execution starts in {wait_seconds:.1f} seconds.")
        time.sleep(wait_seconds)

    for index, batch in enumerate(batches, start=1):
        print(f"Batch {index}/{len(batches)}")
        drop_gold_cycle(batch, profile)
        random_sleep(0.1, 0.2, stop_key=str(profile["stop_key"]))

    print("Gold drop finished.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

    press_key(inventory_hotkey, stop_key=stop_key)
    random_sleep(0.3, 0.5, stop_key=stop_key)

    safe_click(
        profile["inventory_gold_btn_coords"],
        game_window_title=game_window_title,
        stop_key=stop_key,
    )
    type_text(amount, stop_key=stop_key)
    press_key("enter", stop_key=stop_key)
    random_sleep(0.1, 0.2, stop_key=stop_key)

    press_key(close_ui_key, stop_key=stop_key)
    random_sleep(0.3, 0.5, stop_key=stop_key)
