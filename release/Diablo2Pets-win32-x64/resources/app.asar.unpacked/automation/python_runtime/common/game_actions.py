from __future__ import annotations

import os
import random
import time
from typing import Any, Sequence

try:
    import keyboard
except ImportError:  # pragma: no cover - optional until runtime is installed
    keyboard = None

try:
    import pyautogui
except ImportError:  # pragma: no cover - optional until runtime is installed
    pyautogui = None

try:
    import pygetwindow as gw
except ImportError:  # pragma: no cover - optional until runtime is installed
    gw = None


DEFAULT_GAME_WINDOW_TITLE = "Diablo II: Resurrected"
DEFAULT_DELAY_MIN = 0.05
DEFAULT_DELAY_MAX = 0.10
DEFAULT_STOP_KEY = "f12"


def require_runtime_dependencies(*package_names: str) -> None:
    missing: list[str] = []
    package_map = {
        "keyboard": keyboard,
        "pyautogui": pyautogui,
        "pygetwindow": gw,
    }

    for name in package_names:
        if package_map.get(name) is None:
            missing.append(name)

    if missing:
        missing_text = ", ".join(sorted(missing))
        raise RuntimeError(
            "Missing Python runtime packages: "
            f"{missing_text}. Install them before running this task."
        )


def get_game_window(
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> Any | None:
    require_runtime_dependencies("pygetwindow")

    try:
        windows = gw.getWindowsWithTitle(game_window_title)
    except Exception:
        return None

    if not windows:
        return None

    return windows[0]


def is_game_active(
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> bool:
    window = get_game_window(game_window_title=game_window_title)
    return bool(window and window.isActive)


def release_modifier_keys() -> None:
    if keyboard is None:
        return

    for key_name in ("ctrl", "shift", "alt"):
        try:
            if keyboard.is_pressed(key_name):
                keyboard.release(key_name)
        except Exception:
            continue


def check_stop(stop_key: str = DEFAULT_STOP_KEY) -> None:
    if keyboard is None:
        return

    try:
        if not keyboard.is_pressed(stop_key):
            return
    except Exception:
        return

    if pyautogui is not None:
        try:
            pyautogui.mouseUp()
        except Exception:
            pass

    release_modifier_keys()
    raise SystemExit(f"Emergency stop requested via {stop_key}.")


def sleep_with_stop_check(
    duration_seconds: float,
    stop_key: str = DEFAULT_STOP_KEY,
    poll_seconds: float = 0.02,
) -> None:
    end_time = time.time() + max(0.0, duration_seconds)
    while time.time() < end_time:
        check_stop(stop_key=stop_key)
        time.sleep(poll_seconds)


def random_sleep(
    min_seconds: float = DEFAULT_DELAY_MIN,
    max_seconds: float = DEFAULT_DELAY_MAX,
    stop_key: str = DEFAULT_STOP_KEY,
) -> None:
    delay = random.uniform(min_seconds, max_seconds)
    sleep_with_stop_check(delay, stop_key=stop_key)


def get_relative_coords(
    absolute_x: int,
    absolute_y: int,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> tuple[int, int]:
    window = get_game_window(game_window_title=game_window_title)
    if not window:
        return absolute_x, absolute_y

    return absolute_x - window.left, absolute_y - window.top


def get_absolute_coords(
    relative_x: int,
    relative_y: int,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> tuple[int, int]:
    window = get_game_window(game_window_title=game_window_title)
    if not window:
        return relative_x, relative_y

    return window.left + relative_x, window.top + relative_y


def _normalize_point(point: Sequence[int | float]) -> tuple[int, int]:
    if len(point) != 2:
        raise ValueError(f"Expected a 2D point, got: {point!r}")

    return int(round(point[0])), int(round(point[1]))


def safe_click(
    relative_coords: Sequence[int | float],
    *,
    right_click: bool = False,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
    stop_key: str = DEFAULT_STOP_KEY,
) -> None:
    require_runtime_dependencies("pyautogui", "pygetwindow")
    check_stop(stop_key=stop_key)

    rel_x, rel_y = _normalize_point(relative_coords)
    abs_x, abs_y = get_absolute_coords(
        rel_x,
        rel_y,
        game_window_title=game_window_title,
    )
    pyautogui.click(abs_x, abs_y, button="right" if right_click else "left")
    time.sleep(0.02)


def safe_ctrl_click(
    relative_coords: Sequence[int | float],
    *,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
    stop_key: str = DEFAULT_STOP_KEY,
) -> None:
    require_runtime_dependencies("keyboard", "pyautogui", "pygetwindow")
    check_stop(stop_key=stop_key)

    rel_x, rel_y = _normalize_point(relative_coords)
    abs_x, abs_y = get_absolute_coords(
        rel_x,
        rel_y,
        game_window_title=game_window_title,
    )

    pyautogui.moveTo(abs_x, abs_y)
    keyboard.press("ctrl")
    try:
        time.sleep(0.02)
        pyautogui.click()
        time.sleep(0.02)
    finally:
        keyboard.release("ctrl")
    time.sleep(0.02)


def safe_batch_transfer(
    relative_coords: Sequence[int | float],
    *,
    count: int = 3,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
    stop_key: str = DEFAULT_STOP_KEY,
) -> None:
    require_runtime_dependencies("keyboard", "pyautogui", "pygetwindow")
    check_stop(stop_key=stop_key)

    rel_x, rel_y = _normalize_point(relative_coords)
    abs_x, abs_y = get_absolute_coords(
        rel_x,
        rel_y,
        game_window_title=game_window_title,
    )

    clicks = max(1, (int(count) + 2) // 3)
    pyautogui.moveTo(abs_x, abs_y)
    keyboard.press("ctrl")
    keyboard.press("shift")
    try:
        time.sleep(0.05)
        for _ in range(clicks):
            pyautogui.click(button="right")
            time.sleep(0.05)
    finally:
        keyboard.release("shift")
        keyboard.release("ctrl")
    time.sleep(0.05)


def safe_move_item(
    start_relative: Sequence[int | float],
    end_relative: Sequence[int | float],
    *,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
    stop_key: str = DEFAULT_STOP_KEY,
) -> None:
    require_runtime_dependencies("pyautogui", "pygetwindow")
    check_stop(stop_key=stop_key)

    start_x, start_y = _normalize_point(start_relative)
    end_x, end_y = _normalize_point(end_relative)

    start_abs_x, start_abs_y = get_absolute_coords(
        start_x,
        start_y,
        game_window_title=game_window_title,
    )
    end_abs_x, end_abs_y = get_absolute_coords(
        end_x,
        end_y,
        game_window_title=game_window_title,
    )

    pyautogui.click(start_abs_x, start_abs_y)
    time.sleep(0.02)
    pyautogui.click(end_abs_x, end_abs_y)
    time.sleep(0.02)


def calculate_grid_coords(
    anchors: dict[str, Sequence[int | float]],
    rows: int,
    cols: int,
) -> list[list[tuple[int, int]]]:
    p1 = _normalize_point(anchors["p1"])
    p2 = _normalize_point(anchors["p2"])
    p3 = _normalize_point(anchors["p3"])

    if cols > 1:
        step_x_x = (p2[0] - p1[0]) / (cols - 1)
        step_x_y = (p2[1] - p1[1]) / (cols - 1)
    else:
        step_x_x = 0.0
        step_x_y = 0.0

    if rows > 1:
        step_y_x = (p3[0] - p1[0]) / (rows - 1)
        step_y_y = (p3[1] - p1[1]) / (rows - 1)
    else:
        step_y_x = 0.0
        step_y_y = 0.0

    grid: list[list[tuple[int, int]]] = []
    for row_index in range(rows):
        row_coords: list[tuple[int, int]] = []
        for col_index in range(cols):
            x = p1[0] + col_index * step_x_x + row_index * step_y_x
            y = p1[1] + col_index * step_x_y + row_index * step_y_y
            row_coords.append((int(round(x)), int(round(y))))
        grid.append(row_coords)

    return grid


def record_coords(
    prompt_text: str,
    *,
    confirm_key: str = "f10",
    stop_key: str = DEFAULT_STOP_KEY,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> list[int]:
    require_runtime_dependencies("keyboard", "pyautogui", "pygetwindow")

    print()
    print(prompt_text)
    print(f"Move the mouse, press {confirm_key} to capture, or {stop_key} to cancel.")

    while True:
        check_stop(stop_key=stop_key)
        if keyboard.is_pressed(confirm_key):
            absolute_x, absolute_y = pyautogui.position()
            relative_x, relative_y = get_relative_coords(
                absolute_x,
                absolute_y,
                game_window_title=game_window_title,
            )
            print(f"Captured relative coords: ({relative_x}, {relative_y})")
            time.sleep(0.5)
            return [relative_x, relative_y]
        time.sleep(0.05)


def record_multiple_coords(
    prompt_text: str,
    *,
    add_key: str = "f10",
    finish_key: str = "f11",
    stop_key: str = DEFAULT_STOP_KEY,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
) -> list[list[int]]:
    require_runtime_dependencies("keyboard", "pyautogui", "pygetwindow")

    print()
    print(prompt_text)
    print(f"Press {add_key} to add a point, {finish_key} to finish, or {stop_key} to cancel.")

    results: list[list[int]] = []
    while True:
        check_stop(stop_key=stop_key)
        if keyboard.is_pressed(add_key):
            absolute_x, absolute_y = pyautogui.position()
            relative_x, relative_y = get_relative_coords(
                absolute_x,
                absolute_y,
                game_window_title=game_window_title,
            )
            results.append([relative_x, relative_y])
            print(f"Added point #{len(results)}: ({relative_x}, {relative_y})")
            time.sleep(0.5)
        if keyboard.is_pressed(finish_key):
            print(f"Finished with {len(results)} points.")
            time.sleep(0.5)
            return results
        time.sleep(0.05)


def emergency_exit(message: str, exit_code: int = 1) -> None:
    release_modifier_keys()
    raise SystemExit(message) from None
