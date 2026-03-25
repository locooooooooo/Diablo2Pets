from __future__ import annotations

import argparse
import time
from pathlib import Path

from gem_runtime import (  # noqa: E402
    DEFAULT_LEGACY_CONFIG_PATH,
    DEFAULT_PROFILE_PATH,
    build_grid_crafting_plan,
    execute_grid_crafting_plan,
    import_legacy_config,
    load_profile,
    matrix_to_column_text,
    parse_column_matrix,
    print_crafting_plan,
    print_profile,
    print_scan_report,
    record_profile,
    scan_grid_counts,
)
from common.game_actions import is_game_active  # noqa: E402


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Gem cubing task for the Diablo II desktop pet runtime."
    )
    parser.add_argument("--profile", default=str(DEFAULT_PROFILE_PATH))
    parser.add_argument(
        "--import-legacy-config",
        default=None,
        nargs="?",
        const=str(DEFAULT_LEGACY_CONFIG_PATH),
    )
    parser.add_argument("--record-profile", action="store_true")
    parser.add_argument("--print-profile", action="store_true")
    parser.add_argument(
        "--matrix",
        help="Column-oriented gem counts. Example: \"10 5 2 0 0; 8 4 1 0 0\"",
    )
    parser.add_argument(
        "--scan-image",
        help="Scan counts from a screenshot and use them as the input matrix.",
    )
    parser.add_argument(
        "--scan-screen",
        action="store_true",
        help="Scan counts directly from the game window.",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--wait-seconds", type=float, default=3.0)
    parser.add_argument("--allow-inactive-window", action="store_true")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    profile_path = Path(args.profile).expanduser().resolve()
    profile = load_profile(profile_path)

    if args.import_legacy_config:
        profile = import_legacy_config(
            Path(args.import_legacy_config).expanduser().resolve(),
            profile_path,
        )
        print(f"Imported legacy gem config into {profile_path}")

    if args.record_profile:
        profile = record_profile(profile_path, profile=profile)
        print(f"Saved recorded gem profile to {profile_path}")

    if args.print_profile:
        print_profile(profile)
        if not any((args.matrix, args.scan_image, args.scan_screen)):
            return 0

    counts = None
    diagnostics = None
    if args.matrix:
        counts = parse_column_matrix(args.matrix)
    elif args.scan_image:
        counts, diagnostics = scan_grid_counts(profile, image_path=args.scan_image)
    elif args.scan_screen:
        counts, diagnostics = scan_grid_counts(profile)
    else:
        if args.record_profile or args.import_legacy_config:
            return 0
        parser.print_help()
        return 0

    if diagnostics is not None:
        print_scan_report(counts, diagnostics)

    print()
    print("Input matrix:")
    print("  " + matrix_to_column_text(counts))
    plan, resulting_counts = build_grid_crafting_plan(counts)
    print_crafting_plan(plan, resulting_counts)

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

    execute_grid_crafting_plan(plan, profile)
    print("Gem cubing finished.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
