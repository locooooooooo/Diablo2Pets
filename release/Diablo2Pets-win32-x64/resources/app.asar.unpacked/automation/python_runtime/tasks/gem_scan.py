from __future__ import annotations

import argparse
from pathlib import Path

from gem_runtime import (  # noqa: E402
    DEFAULT_LEGACY_CONFIG_PATH,
    DEFAULT_PROFILE_PATH,
    export_scan_json,
    import_legacy_config,
    load_profile,
    print_profile,
    print_scan_report,
    record_profile,
    save_profile,
    scan_grid_counts,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Scan gem stack counts from the screen or an image."
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
    parser.add_argument("--image", help="Scan from a saved screenshot instead of the current screen.")
    parser.add_argument("--save-json", help="Write the scan result to a JSON file.")
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
        if not args.image and not args.save_json:
            return 0

    if not args.image and not args.save_json and not args.record_profile and not args.import_legacy_config:
        counts, diagnostics = scan_grid_counts(profile)
    elif args.image:
        counts, diagnostics = scan_grid_counts(profile, image_path=args.image)
    elif args.save_json:
        counts, diagnostics = scan_grid_counts(profile)
    else:
        return 0

    print_scan_report(counts, diagnostics)

    if args.save_json:
        output_path = Path(args.save_json).expanduser().resolve()
        export_scan_json(output_path, counts, diagnostics)
        print(f"Saved scan JSON to {output_path}")

    save_profile(profile_path, profile)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
