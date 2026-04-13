from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any, Iterable


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
    get_absolute_coords,
    random_sleep,
    record_coords,
    safe_batch_transfer,
    safe_click,
    safe_move_item,
)
from common.grid_layout import GEM_ANCHOR_TYPE_LEGACY_OCR, build_mode_grids  # noqa: E402
from common.layout_profiles import (  # noqa: E402
    get_runtime_profile_meta,
    get_runtime_profile_name,
    resolve_runtime_profile,
    store_runtime_profile,
)
from common.ocr_utils import (  # noqa: E402
    capture_grid_cell_variants,
    check_ocr_available,
    crop_grid_cell_variants_from_image,
    open_image_file,
    recognize_number,
)
from common.profile_store import read_json, write_json  # noqa: E402
from common.window_scaling import (  # noqa: E402
    build_scaled_config,
    get_game_window_metrics,
    get_mode_coordinate_keys,
)


GRID_ROWS = 5
GRID_COLS = 7
SOURCE_ROWS = 4
DEFAULT_PROFILE_PATH = RUNTIME_ROOT / "config" / "gem_profile.json"
DEFAULT_LEGACY_CONFIG_PATH = Path(r"E:\Diablo2Tools\gem_cubing\gem_config.json")
OCR_FALLBACK_COUNT = 0
OCR_SCAN_DELAY = 0.05


def create_default_profile() -> dict[str, Any]:
    return {
        "profile_version": 1,
        "name": "Default Gem Cubing Profile",
        "game_window_title": DEFAULT_GAME_WINDOW_TITLE,
        "stop_key": DEFAULT_STOP_KEY,
        "delay_min": DEFAULT_DELAY_MIN,
        "delay_max": DEFAULT_DELAY_MAX,
        "mode": "grid",
        "grid_anchor_type": None,
        "cube_slots": [],
        "cube_output_slot": None,
        "transmute_btn": None,
        "result_dest": None,
        "grid_anchors": None,
        "gem_sources": [],
        "imported_from": None,
    }


def _read_raw_profile(path: Path) -> dict[str, Any]:
    loaded = read_json(path, default={}) or {}
    return loaded if isinstance(loaded, dict) else {}


def _format_profile_hint(profile: dict[str, Any]) -> str:
    profile_name = get_runtime_profile_name(profile)
    if not profile_name:
        return ""
    profile_meta = get_runtime_profile_meta(profile)
    selection_reason = profile_meta.get("selection_reason") or "active"
    return f"[{profile_name} | {selection_reason}]"


def _print_runtime_hints(profile: dict[str, Any], scale_info: dict[str, Any]) -> None:
    profile_hint = _format_profile_hint(profile)
    if profile_hint:
        print(f"Using layout profile {profile_hint}")

    if scale_info.get("active"):
        print(
            "Detected window scaling, auto-adjusted coordinates: "
            f"x{scale_info['scale_x']:.3f}, y{scale_info['scale_y']:.3f}"
        )
    elif not scale_info.get("reference_window"):
        print("No reference window recorded yet; this run will use the original coordinates.")


def load_profile(path: Path) -> dict[str, Any]:
    current_metrics = get_game_window_metrics()
    raw_profile = _read_raw_profile(path)

    if not raw_profile:
        return create_default_profile()

    runtime_profile, _normalized, _profile_meta = resolve_runtime_profile(
        raw_profile,
        current_metrics=current_metrics,
    )
    profile = create_default_profile()
    profile.update(runtime_profile or {})
    return profile


def save_profile(path: Path, profile: dict[str, Any]) -> None:
    merged_profile, _stored_profile_name = store_runtime_profile(
        _read_raw_profile(path),
        profile,
        current_metrics=get_game_window_metrics(),
        profile_name=get_runtime_profile_name(profile),
    )
    write_json(path, merged_profile)


def import_legacy_config(legacy_path: Path, output_path: Path) -> dict[str, Any]:
    if not legacy_path.exists():
        raise FileNotFoundError(f"Legacy config not found: {legacy_path}")

    legacy = read_json(legacy_path, default={}) or {}
    profile = create_default_profile()
    profile.update(
        {
            "cube_slots": legacy.get("cube_slots", []),
            "cube_output_slot": legacy.get("cube_output_slot"),
            "transmute_btn": legacy.get("transmute_btn"),
            "result_dest": legacy.get("result_dest"),
            "mode": legacy.get("mode", "grid"),
            "grid_anchors": legacy.get("grid_anchors"),
            "gem_sources": legacy.get("gem_sources", []),
            "grid_anchor_type": legacy.get("grid_anchor_type") or GEM_ANCHOR_TYPE_LEGACY_OCR,
            "imported_from": str(legacy_path),
        }
    )
    save_profile(output_path, profile)
    return load_profile(output_path)


def profile_is_complete_for_grid(profile: dict[str, Any]) -> bool:
    return all(
        (
            profile.get("grid_anchors"),
            profile.get("cube_slots"),
            profile.get("transmute_btn"),
        )
    )


def record_profile(path: Path, profile: dict[str, Any] | None = None) -> dict[str, Any]:
    current = create_default_profile()
    if profile:
        current.update(profile)

    stop_key = str(current["stop_key"])
    game_window_title = str(current["game_window_title"])

    print("Recording gem cubing profile.")
    current["cube_slots"] = [
        record_coords(
            f"Capture cube input slot #{index + 1}.",
            stop_key=stop_key,
            game_window_title=game_window_title,
        )
        for index in range(3)
    ]
    current["cube_output_slot"] = record_coords(
        "Capture the cube output slot.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["transmute_btn"] = record_coords(
        "Capture the Transmute button.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["result_dest"] = record_coords(
        "Capture a result destination slot for manual mode.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["grid_anchors"] = {
        "p1": record_coords(
            "Capture the top-left gem stack anchor (row 1, col 1).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
        "p2": record_coords(
            "Capture the top-right gem stack anchor (row 1, col 7).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
        "p3": record_coords(
            "Capture the bottom-left gem stack anchor (row 5, col 1).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
    }
    current["grid_anchor_type"] = current.get("grid_anchor_type") or GEM_ANCHOR_TYPE_LEGACY_OCR

    save_profile(path, current)
    return load_profile(path)


def prepare_runtime_state(profile: dict[str, Any], current_metrics=None):
    runtime_profile = create_default_profile()
    runtime_profile.update(profile or {})

    scaled_profile, scale_info = build_scaled_config(
        runtime_profile,
        coordinate_keys=get_mode_coordinate_keys("Gem"),
        current_metrics=current_metrics,
    )

    mode_grids = None
    anchors = scaled_profile.get("grid_anchors")
    if anchors:
        mode_grids = build_mode_grids(
            anchors,
            rows=GRID_ROWS,
            cols=GRID_COLS,
            mode="Gem",
            anchor_type=scaled_profile.get("grid_anchor_type"),
        )

    _print_runtime_hints(profile, scale_info)
    return scaled_profile, scale_info, mode_grids


def build_grid(profile: dict[str, Any]) -> list[list[tuple[int, int]]]:
    _runtime_profile, _scale_info, mode_grids = prepare_runtime_state(profile)
    if not mode_grids:
        raise RuntimeError("Gem profile is missing grid anchors.")
    return mode_grids.get("interaction_grid") or []


def parse_column_matrix(matrix_text: str) -> list[list[int]]:
    grid = [[0 for _ in range(GRID_COLS)] for _ in range(GRID_ROWS)]
    columns = [column.strip() for column in matrix_text.strip().split(";") if column.strip()]

    for col_index, column_text in enumerate(columns[:GRID_COLS]):
        values = [int(part) for part in column_text.split() if part.strip()]
        while len(values) < GRID_ROWS:
            values.append(0)
        for row_index in range(GRID_ROWS):
            grid[row_index][col_index] = values[row_index]

    return grid


def matrix_to_column_text(matrix: list[list[int]]) -> str:
    columns: list[str] = []
    for col_index in range(GRID_COLS):
        parts = [str(matrix[row_index][col_index]) for row_index in range(GRID_ROWS)]
        columns.append(" ".join(parts))
    return "; ".join(columns)


def scan_stack_count_at_position(
    relative_anchor: tuple[int, int],
    *,
    loaded_image: Any | None = None,
    game_window_title: str = DEFAULT_GAME_WINDOW_TITLE,
    crop_scale=None,
) -> tuple[int, dict[str, Any]]:
    if loaded_image is None:
        absolute_x, absolute_y = get_absolute_coords(
            relative_anchor[0],
            relative_anchor[1],
            game_window_title=game_window_title,
        )
        crop_variants = capture_grid_cell_variants(
            absolute_x,
            absolute_y,
            crop_scale=crop_scale,
        )
        source = "screen"
    else:
        crop_variants = crop_grid_cell_variants_from_image(
            loaded_image,
            relative_anchor[0],
            relative_anchor[1],
            crop_scale=crop_scale,
        )
        source = "image"

    best_value = OCR_FALLBACK_COUNT
    best_meta = {
        "recognized": False,
        "confidence": 0.0,
        "engine": None,
        "variant": None,
        "crop_variant": None,
        "raw_text": "",
        "source": source,
    }

    for crop_name, cropped in crop_variants:
        if cropped is None:
            continue

        value, meta = recognize_number(
            cropped,
            default=OCR_FALLBACK_COUNT,
            return_meta=True,
        )
        meta = dict(meta)
        meta["crop_variant"] = crop_name
        meta["source"] = source

        if meta.get("recognized"):
            return value, meta

        if meta.get("confidence", 0.0) >= best_meta.get("confidence", 0.0):
            best_value = value
            best_meta = meta

    return best_value, best_meta


def scan_grid_counts(
    profile: dict[str, Any],
    *,
    image_path: str | None = None,
    positions: Iterable[tuple[int, int]] | None = None,
) -> tuple[list[list[int]], list[dict[str, Any]]]:
    if not check_ocr_available():
        raise RuntimeError(
            "No OCR engine is available. Install rapidocr_onnxruntime or pytesseract."
        )

    runtime_profile, scale_info, mode_grids = prepare_runtime_state(profile)
    if not mode_grids:
        raise RuntimeError("Gem profile is missing grid anchors.")

    scan_grid = mode_grids.get("scan_grid") or []
    loaded_image = open_image_file(image_path) if image_path else None
    game_window_title = str(runtime_profile["game_window_title"])
    crop_scale = (scale_info.get("scale_x", 1.0), scale_info.get("scale_y", 1.0))
    positions = list(
        positions
        or [(row, col) for col in range(GRID_COLS) for row in range(GRID_ROWS)]
    )

    counts = [[0 for _ in range(GRID_COLS)] for _ in range(GRID_ROWS)]
    diagnostics: list[dict[str, Any]] = []

    for row_index, col_index in positions:
        value, meta = scan_stack_count_at_position(
            scan_grid[row_index][col_index],
            loaded_image=loaded_image,
            game_window_title=game_window_title,
            crop_scale=crop_scale,
        )
        counts[row_index][col_index] = value
        diagnostics.append(
            {
                "row": row_index,
                "col": col_index,
                "count": value,
                **meta,
            }
        )
        if loaded_image is None:
            time.sleep(OCR_SCAN_DELAY)

    return counts, diagnostics


def print_scan_report(counts: list[list[int]], diagnostics: Iterable[dict[str, Any]]) -> None:
    print("Gem scan report:")
    for item in diagnostics:
        status = "recognized" if item.get("recognized") else "fallback"
        confidence = float(item.get("confidence", 0.0))
        print(
            f"  Row {item['row'] + 1}, col {item['col'] + 1}: {item['count']} "
            f"[{status}, engine={item.get('engine')}, crop={item.get('crop_variant')}, conf={confidence:.2f}]"
        )

    print()
    print("Counts by row:")
    for row_index in range(GRID_ROWS):
        print("  " + " ".join(str(counts[row_index][col]) for col in range(GRID_COLS)))

    print()
    print("Column-matrix form:")
    print("  " + matrix_to_column_text(counts))


def build_grid_crafting_plan(
    counts: list[list[int]],
    *,
    columns: Iterable[int] | None = None,
    rows: Iterable[int] | None = None,
) -> tuple[list[dict[str, Any]], list[list[int]]]:
    current = [list(row) for row in counts]
    active_columns = list(columns or range(GRID_COLS))
    active_rows = list(rows or range(SOURCE_ROWS))
    plan: list[dict[str, Any]] = []

    for col_index in active_columns:
        for row_index in active_rows:
            value = current[row_index][col_index]
            craft_count = value // 3
            if craft_count <= 0:
                continue

            plan.append(
                {
                    "row_index": row_index,
                    "col_index": col_index,
                    "craft_count": craft_count,
                    "input_count": value,
                }
            )
            current[row_index][col_index] -= craft_count * 3
            current[row_index + 1][col_index] += craft_count

    return plan, current


def print_crafting_plan(plan: list[dict[str, Any]], resulting_counts: list[list[int]]) -> None:
    if not plan:
        print("No gem crafts are needed for the provided counts.")
        return

    print("Gem craft plan:")
    for step in plan:
        row_number = step["row_index"] + 1
        col_number = step["col_index"] + 1
        print(
            f"  Col {col_number}, row {row_number} -> {row_number + 1}: "
            f"{step['input_count']} input gems, {step['craft_count']} crafts"
        )

    print()
    print("Resulting counts by row:")
    for row_index in range(GRID_ROWS):
        print("  " + " ".join(str(resulting_counts[row_index][col]) for col in range(GRID_COLS)))


def execute_grid_crafting_plan(plan: list[dict[str, Any]], profile: dict[str, Any]) -> None:
    if not profile_is_complete_for_grid(profile):
        raise RuntimeError("Gem profile is incomplete for grid execution.")

    runtime_profile, _scale_info, mode_grids = prepare_runtime_state(profile)
    if not mode_grids:
        raise RuntimeError("Gem profile is missing grid anchors.")

    grid = mode_grids.get("interaction_grid") or []
    cube_slots = runtime_profile.get("cube_slots") or []
    cube_output_slot = runtime_profile.get("cube_output_slot") or (
        cube_slots[2] if len(cube_slots) >= 3 else None
    )
    transmute_btn = runtime_profile.get("transmute_btn")
    if cube_output_slot is None:
        raise RuntimeError("Gem profile has no cube output slot.")

    game_window_title = str(runtime_profile["game_window_title"])
    stop_key = str(runtime_profile["stop_key"])
    delay_min = float(runtime_profile["delay_min"])
    delay_max = float(runtime_profile["delay_max"])

    for step in plan:
        row_index = int(step["row_index"])
        col_index = int(step["col_index"])
        craft_count = int(step["craft_count"])
        source_pos = grid[row_index][col_index]
        target_pos = grid[row_index + 1][col_index]

        print(
            f"Executing col {col_index + 1}, row {row_index + 1} -> {row_index + 2}, "
            f"crafts: {craft_count}"
        )
        for craft_index in range(craft_count):
            check_stop(stop_key=stop_key)
            print(f"  Craft {craft_index + 1}/{craft_count}")
            safe_batch_transfer(
                source_pos,
                count=3,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            safe_click(
                transmute_btn,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            time.sleep(0.3)
            safe_move_item(
                cube_output_slot,
                target_pos,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            random_sleep(delay_min, delay_max, stop_key=stop_key)


def export_scan_json(path: Path, counts: list[list[int]], diagnostics: list[dict[str, Any]]) -> None:
    payload = {
        "counts": counts,
        "column_matrix": matrix_to_column_text(counts),
        "diagnostics": diagnostics,
    }
    write_json(path, payload)


def print_profile(profile: dict[str, Any]) -> None:
    print(json.dumps(profile, indent=2, ensure_ascii=False))
