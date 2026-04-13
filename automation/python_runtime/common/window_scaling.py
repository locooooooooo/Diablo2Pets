from __future__ import annotations

import copy
from typing import Any, Dict, Iterable

from common.game_actions import DEFAULT_GAME_WINDOW_TITLE, get_game_window


REFERENCE_WINDOW_KEY = "reference_window"

GEM_COORDINATE_KEYS = (
    "cube_slots",
    "cube_output_slot",
    "transmute_btn",
    "result_dest",
    "gem_sources",
    "grid_anchors",
)
RUNE_COORDINATE_KEYS = (
    "cube_slots",
    "cube_output_slot",
    "transmute_btn",
    "result_dest",
    "grid_anchors",
)
MODE_COORDINATE_KEYS = {
    "Gem": GEM_COORDINATE_KEYS,
    "Rune": RUNE_COORDINATE_KEYS,
}


def get_game_window_metrics(window=None, game_window_title: str = DEFAULT_GAME_WINDOW_TITLE):
    try:
        window = window or get_game_window(game_window_title=game_window_title)
    except Exception:
        window = None

    if not window:
        return None

    try:
        return {
            "width": int(window.width),
            "height": int(window.height),
        }
    except Exception:
        return None


def get_mode_coordinate_keys(mode: str):
    return MODE_COORDINATE_KEYS.get(mode, GEM_COORDINATE_KEYS)


def stamp_reference_window(config: Dict[str, Any], window=None, game_window_title: str = DEFAULT_GAME_WINDOW_TITLE):
    metrics = get_game_window_metrics(window=window, game_window_title=game_window_title)
    if metrics:
        config[REFERENCE_WINDOW_KEY] = metrics
    return config


def _is_point(value):
    return (
        isinstance(value, (list, tuple))
        and len(value) == 2
        and all(isinstance(item, (int, float)) for item in value)
    )


def _scale_point(point, scale_x, scale_y):
    scaled = [int(round(point[0] * scale_x)), int(round(point[1] * scale_y))]
    return tuple(scaled) if isinstance(point, tuple) else scaled


def _scale_value(value, scale_x, scale_y):
    if _is_point(value):
        return _scale_point(value, scale_x, scale_y)
    if isinstance(value, list):
        return [_scale_value(item, scale_x, scale_y) for item in value]
    if isinstance(value, tuple):
        return tuple(_scale_value(item, scale_x, scale_y) for item in value)
    if isinstance(value, dict):
        return {key: _scale_value(item, scale_x, scale_y) for key, item in value.items()}
    return value


def build_scaled_config(config: Dict[str, Any], coordinate_keys: Iterable[str], current_metrics=None):
    scaled_config = copy.deepcopy(config or {})
    reference_window = scaled_config.get(REFERENCE_WINDOW_KEY)
    current_window = current_metrics or get_game_window_metrics()

    scale_info = {
        "active": False,
        "scale_x": 1.0,
        "scale_y": 1.0,
        "reference_window": reference_window,
        "current_window": current_window,
    }

    if not reference_window or not current_window:
        return scaled_config, scale_info

    ref_width = max(1, int(reference_window.get("width", 0) or 0))
    ref_height = max(1, int(reference_window.get("height", 0) or 0))
    cur_width = max(1, int(current_window.get("width", 0) or 0))
    cur_height = max(1, int(current_window.get("height", 0) or 0))

    scale_x = cur_width / ref_width
    scale_y = cur_height / ref_height
    scale_info.update(
        {
            "active": abs(scale_x - 1.0) > 0.001 or abs(scale_y - 1.0) > 0.001,
            "scale_x": scale_x,
            "scale_y": scale_y,
        }
    )

    for key in coordinate_keys:
        if key in scaled_config:
            scaled_config[key] = _scale_value(scaled_config[key], scale_x, scale_y)

    return scaled_config, scale_info
