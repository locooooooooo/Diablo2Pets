from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any


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
    is_game_active,
    random_sleep,
    record_coords,
    safe_batch_transfer,
    safe_click,
    safe_move_item,
)
from common.grid_layout import build_mode_grids  # noqa: E402
from common.layout_profiles import (  # noqa: E402
    get_runtime_profile_meta,
    get_runtime_profile_name,
    resolve_runtime_profile,
    store_runtime_profile,
)
from common.profile_store import read_json, write_json  # noqa: E402
from common.window_scaling import (  # noqa: E402
    build_scaled_config,
    get_game_window_metrics,
    get_mode_coordinate_keys,
)


GRID_ROWS = 4
GRID_COLS = 9
LAST_CRAFTABLE_COL = 6
DEFAULT_PROFILE_PATH = RUNTIME_ROOT / "config" / "rune_profile.json"
DEFAULT_LEGACY_CONFIG_PATH = Path(r"E:\Diablo2Tools\rune_cubing\rune_config.json")


def create_default_profile() -> dict[str, Any]:
    return {
        "profile_version": 1,
        "name": "Default Rune Cubing Profile",
        "game_window_title": DEFAULT_GAME_WINDOW_TITLE,
        "stop_key": DEFAULT_STOP_KEY,
        "delay_min": DEFAULT_DELAY_MIN,
        "delay_max": DEFAULT_DELAY_MAX,
        "grid_anchor_type": None,
        "cube_output_slot": None,
        "transmute_btn": None,
        "grid_anchors": None,
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


def profile_is_complete(profile: dict[str, Any]) -> bool:
    return all(
        (
            profile.get("cube_output_slot"),
            profile.get("transmute_btn"),
            profile.get("grid_anchors"),
        )
    )


def import_legacy_config(
    legacy_path: Path,
    output_path: Path,
) -> dict[str, Any]:
    if not legacy_path.exists():
        raise FileNotFoundError(f"Legacy config not found: {legacy_path}")

    legacy = read_json(legacy_path, default={}) or {}
    profile = create_default_profile()
    profile["cube_output_slot"] = legacy.get("cube_output_slot")
    profile["transmute_btn"] = legacy.get("transmute_btn")
    profile["grid_anchors"] = legacy.get("grid_anchors")
    profile["grid_anchor_type"] = legacy.get("grid_anchor_type")
    profile["imported_from"] = str(legacy_path)
    save_profile(output_path, profile)
    return load_profile(output_path)


def record_profile(
    path: Path,
    *,
    profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    current = create_default_profile()
    if profile:
        current.update(profile)

    game_window_title = str(current["game_window_title"])
    stop_key = str(current["stop_key"])

    print("Recording rune cubing profile.")
    print("Make sure the Diablo II inventory and cube UI are visible before capturing.")

    current["cube_output_slot"] = record_coords(
        "Capture the cube output slot (usually the bottom-right slot inside the cube).",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )
    current["transmute_btn"] = record_coords(
        "Capture the Transmute button.",
        stop_key=stop_key,
        game_window_title=game_window_title,
    )

    print()
    print("Now capture the rune grid anchors.")
    current["grid_anchors"] = {
        "p1": record_coords(
            "Capture the top-left rune slot (row 1, col 1).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
        "p2": record_coords(
            "Capture the top-right rune slot (row 1, col 9).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
        "p3": record_coords(
            "Capture the bottom-left rune slot (row 4, col 1).",
            stop_key=stop_key,
            game_window_title=game_window_title,
        ),
    }

    save_profile(path, current)
    return load_profile(path)


def prepare_runtime_state(profile: dict[str, Any], current_metrics=None):
    runtime_profile = create_default_profile()
    runtime_profile.update(profile or {})

    scaled_profile, scale_info = build_scaled_config(
        runtime_profile,
        coordinate_keys=get_mode_coordinate_keys("Rune"),
        current_metrics=current_metrics,
    )

    mode_grids = None
    anchors = scaled_profile.get("grid_anchors")
    if anchors:
        mode_grids = build_mode_grids(
            anchors,
            rows=GRID_ROWS,
            cols=GRID_COLS,
            mode="Rune",
            anchor_type=scaled_profile.get("grid_anchor_type"),
        )

    _print_runtime_hints(profile, scale_info)
    return scaled_profile, scale_info, mode_grids


def parse_counts_text(counts_text: str) -> list[int]:
    return [int(part) for part in counts_text.strip().split() if part.strip()]


def parse_matrix_text(matrix_text: str) -> list[int]:
    counts: list[int] = []
    for row_text in matrix_text.strip().split(";"):
        row_text = row_text.strip()
        if not row_text:
            continue
        counts.extend(parse_counts_text(row_text))
    return counts


def normalize_counts(counts: list[int]) -> list[int]:
    max_slots = GRID_ROWS * GRID_COLS
    trimmed = counts[:max_slots]
    if len(trimmed) < max_slots:
        trimmed.extend([0] * (max_slots - len(trimmed)))
    return trimmed


def build_crafting_plan(counts: list[int]) -> tuple[list[dict[str, Any]], list[int]]:
    current_counts = normalize_counts(list(counts))
    plan: list[dict[str, Any]] = []

    for row_index in range(GRID_ROWS):
        for col_index in range(LAST_CRAFTABLE_COL + 1):
            current_index = row_index * GRID_COLS + col_index
            next_index = current_index + 1
            rune_count = current_counts[current_index]
            craft_count = rune_count // 3

            if craft_count <= 0:
                continue

            plan.append(
                {
                    "row_index": row_index,
                    "col_index": col_index,
                    "craft_count": craft_count,
                    "input_count": rune_count,
                    "output_index": next_index,
                }
            )

            current_counts[current_index] -= craft_count * 3
            current_counts[next_index] += craft_count

    return plan, current_counts


def print_plan(plan: list[dict[str, Any]], resulting_counts: list[int]) -> None:
    if not plan:
        print("No rune crafts are needed for the provided counts.")
        return

    print("Craft plan:")
    for step in plan:
        row_number = step["row_index"] + 1
        source_col = step["col_index"] + 1
        target_col = source_col + 1
        craft_count = step["craft_count"]
        input_count = step["input_count"]
        print(
            f"  Row {row_number}, col {source_col} -> {target_col}: "
            f"{input_count} input runes, {craft_count} crafts"
        )

    print()
    print("Resulting counts:")
    for row_index in range(GRID_ROWS):
        row_counts = resulting_counts[row_index * GRID_COLS : (row_index + 1) * GRID_COLS]
        print("  " + " ".join(str(value) for value in row_counts))


def execute_crafting_plan(
    plan: list[dict[str, Any]],
    profile: dict[str, Any],
) -> None:
    if not profile_is_complete(profile):
        raise RuntimeError("Rune profile is incomplete. Record or import it first.")

    runtime_profile, _scale_info, mode_grids = prepare_runtime_state(profile)
    if not mode_grids:
        raise RuntimeError("Rune profile is missing grid anchors.")

    grid = mode_grids.get("interaction_grid") or []
    game_window_title = str(runtime_profile["game_window_title"])
    stop_key = str(runtime_profile["stop_key"])
    delay_min = float(runtime_profile["delay_min"])
    delay_max = float(runtime_profile["delay_max"])
    cube_output_slot = runtime_profile["cube_output_slot"]
    transmute_btn = runtime_profile["transmute_btn"]

    for step in plan:
        row_index = int(step["row_index"])
        col_index = int(step["col_index"])
        craft_count = int(step["craft_count"])
        source_slot = grid[row_index][col_index]
        target_slot = grid[row_index][col_index + 1]

        print(
            f"Executing row {row_index + 1}, col {col_index + 1} -> "
            f"{col_index + 2}, crafts: {craft_count}"
        )

        for craft_index in range(craft_count):
            check_stop(stop_key=stop_key)
            print(f"  Craft {craft_index + 1}/{craft_count}")
            safe_batch_transfer(
                source_slot,
                count=3,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            safe_click(
                transmute_btn,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            time.sleep(0.05)
            safe_move_item(
                cube_output_slot,
                target_slot,
                game_window_title=game_window_title,
                stop_key=stop_key,
            )
            random_sleep(delay_min, delay_max, stop_key=stop_key)


def resolve_counts(args: argparse.Namespace) -> list[int]:
    if args.matrix:
        return parse_matrix_text(args.matrix)
    if args.counts:
        return parse_counts_text(args.counts)
    raise ValueError("Provide either --counts or --matrix.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Rune cubing task for the Diablo II desktop pet runtime."
    )
    parser.add_argument(
        "--profile",
        default=str(DEFAULT_PROFILE_PATH),
        help="Path to the rune cubing profile JSON.",
    )
    parser.add_argument(
        "--counts",
        help="Flat rune count list separated by spaces.",
    )
    parser.add_argument(
        "--matrix",
        help="Rune count matrix, rows separated by ';' and values by spaces.",
    )
    parser.add_argument(
        "--record-profile",
        action="store_true",
        help="Interactively record the cube output slot, Transmute button, and grid anchors.",
    )
    parser.add_argument(
        "--import-legacy-config",
        default=None,
        nargs="?",
        const=str(DEFAULT_LEGACY_CONFIG_PATH),
        help="Import the legacy rune_config.json into the new profile format.",
    )
    parser.add_argument(
        "--print-profile",
        action="store_true",
        help="Print the currently loaded profile and exit.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the craft plan only, without clicking the game window.",
    )
    parser.add_argument(
        "--wait-seconds",
        type=float,
        default=3.0,
        help="Delay before executing the real task so you can focus the game window.",
    )
    parser.add_argument(
        "--allow-inactive-window",
        action="store_true",
        help="Skip the foreground-window safety check before clicking.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    profile_path = Path(args.profile).expanduser().resolve()
    profile = load_profile(profile_path)

    if args.import_legacy_config:
        legacy_path = Path(args.import_legacy_config).expanduser().resolve()
        profile = import_legacy_config(legacy_path, profile_path)
        print(f"Imported legacy rune config into {profile_path}")

    if args.record_profile:
        profile = record_profile(profile_path, profile=profile)
        print(f"Saved recorded rune profile to {profile_path}")

    if args.print_profile:
        print(json.dumps(profile, indent=2, ensure_ascii=False))
        return 0

    if not args.counts and not args.matrix:
        if args.record_profile or args.import_legacy_config:
            return 0

        parser.print_help()
        return 0

    counts = resolve_counts(args)
    plan, resulting_counts = build_crafting_plan(counts)
    print_plan(plan, resulting_counts)

    if args.dry_run:
        return 0

    if not profile_is_complete(profile):
        raise RuntimeError(
            f"Rune profile is incomplete: {profile_path}. "
            "Use --record-profile or --import-legacy-config first."
        )

    game_window_title = str(profile["game_window_title"])
    if not args.allow_inactive_window and not is_game_active(
        game_window_title=game_window_title
    ):
        raise RuntimeError(
            f"Game window '{game_window_title}' is not active. "
            "Focus the game window or pass --allow-inactive-window."
        )

    wait_seconds = max(0.0, float(args.wait_seconds))
    if wait_seconds > 0:
        print(f"Execution starts in {wait_seconds:.1f} seconds.")
        time.sleep(wait_seconds)

    execute_crafting_plan(plan, profile)
    print("Rune cubing finished.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
