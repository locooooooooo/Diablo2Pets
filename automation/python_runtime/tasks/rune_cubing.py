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
    calculate_grid_coords,
    check_stop,
    is_game_active,
    random_sleep,
    record_coords,
    safe_batch_transfer,
    safe_click,
    safe_move_item,
)
from common.profile_store import read_json, write_json  # noqa: E402


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
        "cube_output_slot": None,
        "transmute_btn": None,
        "grid_anchors": None,
        "imported_from": None,
    }


def load_profile(path: Path) -> dict[str, Any]:
    profile = create_default_profile()
    loaded = read_json(path, default={}) or {}
    profile.update(loaded)
    return profile


def save_profile(path: Path, profile: dict[str, Any]) -> None:
    write_json(path, profile)


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
    profile["imported_from"] = str(legacy_path)
    save_profile(output_path, profile)
    return profile


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
    return current


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
    game_window_title = str(profile["game_window_title"])
    stop_key = str(profile["stop_key"])
    delay_min = float(profile["delay_min"])
    delay_max = float(profile["delay_max"])
    cube_output_slot = profile["cube_output_slot"]
    transmute_btn = profile["transmute_btn"]
    grid_anchors = profile["grid_anchors"]

    if not profile_is_complete(profile):
        raise RuntimeError("Rune profile is incomplete. Record or import it first.")

    grid = calculate_grid_coords(grid_anchors, GRID_ROWS, GRID_COLS)

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
