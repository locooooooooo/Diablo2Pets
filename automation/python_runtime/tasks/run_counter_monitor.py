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

RUNTIME_ROOT = Path(__file__).resolve().parents[1]
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from common.game_actions import (  # noqa: E402
    DEFAULT_GAME_WINDOW_TITLE,
    get_game_window,
    require_runtime_dependencies,
)


@dataclass(frozen=True)
class TemplateSpec:
    state_name: str
    name: str
    filename: str
    threshold: float
    stable_threshold: float
    stable_hits: int = 2
    scales: tuple[float, ...] = (1.0,)


@dataclass(frozen=True)
class RouteTemplateSpec:
    root_dir: Path
    route_name: str
    name: str
    filename: str
    threshold: float


@dataclass(frozen=True)
class SceneTemplateSpec:
    path: Path
    scene_name: str
    threshold: float
    scales: tuple[float, ...] = (0.88, 0.94, 1.0, 1.06, 1.12)


@dataclass(frozen=True)
class MatchScore:
    confidence: float
    scale: float


STATE_TEMPLATE_SPECS: tuple[TemplateSpec, ...] = (
    TemplateSpec(
        state_name="in-game-menu",
        name="exit_save_btn",
        filename="exit_save_btn.png",
        threshold=0.74,
        stable_threshold=0.67,
        stable_hits=2,
        scales=(0.92, 1.0, 1.08),
    ),
    TemplateSpec(
        state_name="in-game",
        name="game_ui_bottom_bar",
        filename="game_ui_bottom_bar.png",
        threshold=0.68,
        stable_threshold=0.61,
        stable_hits=2,
        scales=(0.96, 1.0, 1.04),
    ),
    TemplateSpec(
        state_name="lobby",
        name="lobby_create_btn",
        filename="lobby_create_btn.png",
        threshold=0.70,
        stable_threshold=0.62,
        stable_hits=2,
        scales=(0.90, 0.96, 1.0, 1.04, 1.10),
    ),
    TemplateSpec(
        state_name="lobby",
        name="difficulty_hell_btn",
        filename="difficulty_hell_btn.png",
        threshold=0.76,
        stable_threshold=0.66,
        stable_hits=2,
        scales=(0.90, 0.96, 1.0, 1.04, 1.10),
    ),
)


STATE_PRIORITY = {
    "route-marker": 0,
    "in-game-menu": 1,
    "in-game": 2,
    "lobby": 3,
    "unknown": 99,
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def emit(payload: dict[str, Any]) -> None:
    payload.setdefault("detectedAt", utc_now())
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Monitor Diablo II state and emit JSON transitions for run counting."
    )
    parser.add_argument(
        "--game-window-title",
        default=DEFAULT_GAME_WINDOW_TITLE,
        help="Target game window title.",
    )
    parser.add_argument(
        "--template-root",
        type=Path,
        default=RUNTIME_ROOT / "assets" / "run_counter",
        help="Directory containing built-in state detection templates.",
    )
    parser.add_argument(
        "--route-template-root",
        type=Path,
        default=None,
        help="Directory containing optional route templates.",
    )
    parser.add_argument(
        "--scene-template",
        type=Path,
        default=None,
        help="User-provided map name screenshot used as the 3C marker.",
    )
    parser.add_argument(
        "--scene-name",
        default="3C",
        help="Route name associated with the scene marker.",
    )
    parser.add_argument(
        "--scene-threshold",
        type=float,
        default=0.82,
        help="Confidence threshold for the scene marker template.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Polling interval in seconds.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Detect once and exit.",
    )
    return parser.parse_args()


def read_image_bgr(path: Path) -> np.ndarray | None:
    if not path.exists():
        return None

    try:
        data = np.fromfile(str(path), dtype=np.uint8)
    except OSError:
        return None

    if data.size == 0:
        return None

    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def build_template_variants(
    image: np.ndarray, scales: tuple[float, ...]
) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    seen_sizes: set[tuple[int, int]] = set()

    for scale in scales:
        target_width = max(1, int(round(image.shape[1] * scale)))
        target_height = max(1, int(round(image.shape[0] * scale)))
        size_key = (target_width, target_height)
        if size_key in seen_sizes:
            continue
        seen_sizes.add(size_key)

        if size_key == (image.shape[1], image.shape[0]):
            scaled = image
        else:
            interpolation = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LINEAR
            scaled = cv2.resize(image, size_key, interpolation=interpolation)

        variants.append(
            {
                "scale": round(scale, 4),
                "gray": cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY),
                "width": scaled.shape[1],
                "height": scaled.shape[0],
            }
        )

    return variants


def load_route_template_specs(template_root: Path | None) -> list[RouteTemplateSpec]:
    if template_root is None:
        return []

    manifest_path = template_root / "route_templates.json"
    if not manifest_path.exists():
        return []

    try:
        raw = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []

    specs: list[RouteTemplateSpec] = []
    if not isinstance(raw, dict):
        return specs

    for route_name, entries in raw.items():
        if not isinstance(route_name, str) or not isinstance(entries, list):
            continue

        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                continue

            filename = str(entry.get("filename", "")).strip()
            if not filename:
                continue

            threshold = float(entry.get("threshold", 0.74))
            name = str(entry.get("name", f"{route_name}_{index + 1}")).strip()
            specs.append(
                RouteTemplateSpec(
                    root_dir=template_root,
                    route_name=route_name.strip(),
                    name=name,
                    filename=filename,
                    threshold=threshold,
                )
            )

    return specs


def build_scene_template_spec(args: argparse.Namespace) -> SceneTemplateSpec | None:
    if args.scene_template is None:
        return None

    path = Path(args.scene_template)
    return SceneTemplateSpec(
        path=path,
        scene_name=str(args.scene_name or "3C").strip() or "3C",
        threshold=float(args.scene_threshold),
    )


def load_templates(
    template_root: Path,
    route_specs: list[RouteTemplateSpec],
    scene_spec: SceneTemplateSpec | None,
) -> dict[str, dict[str, Any]]:
    loaded: dict[str, dict[str, Any]] = {}
    missing: list[str] = []

    for spec in STATE_TEMPLATE_SPECS:
        template_path = template_root / spec.filename
        image = read_image_bgr(template_path)
        if image is None:
            missing.append(str(template_path))
            continue

        loaded[spec.name] = {
            "variants": build_template_variants(image, spec.scales),
        }

    for spec in route_specs:
        template_path = spec.root_dir / spec.filename
        image = read_image_bgr(template_path)
        if image is None:
            continue

        loaded[spec.name] = {
            "variants": build_template_variants(image, (1.0,)),
        }

    if scene_spec is not None:
        image = read_image_bgr(scene_spec.path)
        if image is None:
            missing.append(str(scene_spec.path))
        else:
            loaded[get_scene_template_key(scene_spec)] = {
                "variants": build_template_variants(image, scene_spec.scales),
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


def find_best_template_match(
    screen_gray: np.ndarray, template: dict[str, Any]
) -> MatchScore:
    best = MatchScore(confidence=0.0, scale=1.0)

    for variant in template["variants"]:
        if (
            screen_gray.shape[1] < variant["width"]
            or screen_gray.shape[0] < variant["height"]
        ):
            continue

        result = cv2.matchTemplate(
            screen_gray, variant["gray"], cv2.TM_CCOEFF_NORMED
        )
        _min_val, max_val, _min_loc, _max_loc = cv2.minMaxLoc(result)
        confidence = float(max_val)

        if confidence > best.confidence:
            best = MatchScore(confidence=confidence, scale=float(variant["scale"]))

    return best


def get_scene_template_key(scene_spec: SceneTemplateSpec) -> str:
    return f"scene:{scene_spec.scene_name}"


def default_route_result(detail: str) -> dict[str, Any]:
    return {
        "routeName": "",
        "routeSource": "default",
        "routeDetail": detail,
        "routeConfidence": 0.0,
        "routeTemplate": "",
        "routeRequiredConfidence": 0.0,
    }


def detect_route(
    screen_gray: np.ndarray,
    templates: dict[str, dict[str, Any]],
    route_specs: list[RouteTemplateSpec],
) -> dict[str, Any]:
    if not route_specs:
        return default_route_result(
            "No custom route templates are configured yet, fallback will use history or default route."
        )

    best_spec: RouteTemplateSpec | None = None
    best_match = MatchScore(confidence=0.0, scale=1.0)

    for spec in route_specs:
        template = templates.get(spec.name)
        if not template:
            continue

        match = find_best_template_match(screen_gray, template)
        if match.confidence > best_match.confidence:
            best_match = match
            best_spec = spec

    if best_spec is None:
        return default_route_result(
            "Route template manifest exists, but no route template image could be loaded."
        )

    if best_match.confidence >= best_spec.threshold:
        return {
            "routeName": best_spec.route_name,
            "routeSource": "template",
            "routeDetail": (
                f"Matched route template {best_spec.name} at {best_match.confidence:.3f} "
                f"(threshold {best_spec.threshold:.3f}, scale {best_match.scale:.2f})."
            ),
            "routeConfidence": round(best_match.confidence, 4),
            "routeTemplate": best_spec.name,
            "routeRequiredConfidence": best_spec.threshold,
        }

    return {
        "routeName": "",
        "routeSource": "default",
        "routeDetail": (
            f"Best route template is {best_spec.name} at {best_match.confidence:.3f}, "
            f"below threshold {best_spec.threshold:.3f}."
        ),
        "routeConfidence": round(best_match.confidence, 4),
        "routeTemplate": best_spec.name,
        "routeRequiredConfidence": best_spec.threshold,
    }


def build_state_key(spec: TemplateSpec) -> str:
    return f"{spec.state_name}:{spec.name}"


def build_non_match_result(
    state: str,
    detail: str,
    template: str = "",
    confidence: float = 0.0,
    required_confidence: float = 0.0,
) -> dict[str, Any]:
    return {
        "kind": state,
        "state": state,
        "detail": detail,
        "template": template,
        "confidence": round(confidence, 4),
        "requiredConfidence": round(required_confidence, 4),
        **default_route_result(
            "No route marker matched, fallback will use history or default route."
        ),
    }


def detect_scene_marker(
    screen_gray: np.ndarray,
    templates: dict[str, dict[str, Any]],
    scene_spec: SceneTemplateSpec | None,
) -> dict[str, Any] | None:
    if scene_spec is None:
        return None

    template = templates.get(get_scene_template_key(scene_spec))
    if not template:
        return None

    match = find_best_template_match(screen_gray, template)
    if match.confidence < scene_spec.threshold:
        return None

    template_name = scene_spec.path.name
    return {
        "kind": "hard",
        "state": "route-marker",
        "detail": (
            f"Matched scene marker {template_name} at {match.confidence:.3f} "
            f"(threshold {scene_spec.threshold:.3f}, scale {match.scale:.2f})."
        ),
        "template": template_name,
        "confidence": round(match.confidence, 4),
        "requiredConfidence": round(scene_spec.threshold, 4),
        "routeName": scene_spec.scene_name,
        "routeSource": "template",
        "routeDetail": (
            f"Scene marker screenshot matched for {scene_spec.scene_name}. "
            "Use this as the start of a new 3C run."
        ),
        "routeConfidence": round(match.confidence, 4),
        "routeTemplate": template_name,
        "routeRequiredConfidence": round(scene_spec.threshold, 4),
        "_signature": f"route-marker|{scene_spec.scene_name}|{template_name}",
    }


def detect_state(
    game_window_title: str,
    templates: dict[str, dict[str, Any]],
    route_specs: list[RouteTemplateSpec],
    scene_spec: SceneTemplateSpec | None,
) -> dict[str, Any]:
    window = get_game_window(game_window_title=game_window_title)
    if not window:
        return build_non_match_result(
            "window-missing",
            f"Game window was not found: {game_window_title}",
        )

    screen_bgr = capture_window_bgr(window)
    if screen_bgr is None:
        return build_non_match_result(
            "window-missing",
            "Game window was found, but screen capture failed.",
        )

    screen_gray = cv2.cvtColor(screen_bgr, cv2.COLOR_BGR2GRAY)

    scene_result = detect_scene_marker(screen_gray, templates, scene_spec)
    if scene_result is not None:
        return scene_result

    best_spec: TemplateSpec | None = None
    best_match = MatchScore(confidence=0.0, scale=1.0)
    best_kind = "unknown"

    for spec in sorted(
        STATE_TEMPLATE_SPECS, key=lambda item: STATE_PRIORITY.get(item.state_name, 99)
    ):
        template = templates.get(spec.name)
        if not template:
            continue

        match = find_best_template_match(screen_gray, template)
        if match.confidence <= 0:
            continue

        candidate_kind = "unknown"
        if match.confidence >= spec.threshold:
            candidate_kind = "hard"
        elif match.confidence >= spec.stable_threshold:
            candidate_kind = "soft"

        should_replace = False
        if best_spec is None:
            should_replace = True
        elif candidate_kind != best_kind:
            priority = {"hard": 2, "soft": 1, "unknown": 0}
            should_replace = priority[candidate_kind] > priority[best_kind]
        elif match.confidence > best_match.confidence:
            should_replace = True

        if should_replace:
            best_spec = spec
            best_match = match
            best_kind = candidate_kind

    if best_spec is None:
        return build_non_match_result(
            "unknown",
            "No lobby, in-game, or menu template matched strongly enough.",
        )

    if best_kind == "hard":
        route_result = detect_route(screen_gray, templates, route_specs)
        return {
            "kind": "hard",
            "state": best_spec.state_name,
            "detail": (
                f"Matched state template {best_spec.name} at {best_match.confidence:.3f} "
                f"(threshold {best_spec.threshold:.3f}, scale {best_match.scale:.2f})."
            ),
            "template": best_spec.name,
            "confidence": round(best_match.confidence, 4),
            "requiredConfidence": round(best_spec.threshold, 4),
            "candidateKey": build_state_key(best_spec),
            "stableHits": best_spec.stable_hits,
            "stableThreshold": round(best_spec.stable_threshold, 4),
            **route_result,
        }

    if best_kind == "soft":
        route_result = detect_route(screen_gray, templates, route_specs)
        return {
            "kind": "soft",
            "state": "unknown",
            "candidateState": best_spec.state_name,
            "detail": (
                f"State template {best_spec.name} scored {best_match.confidence:.3f}. "
                f"It passed the stable threshold {best_spec.stable_threshold:.3f}, "
                f"but not the direct threshold {best_spec.threshold:.3f} yet."
            ),
            "template": best_spec.name,
            "confidence": round(best_match.confidence, 4),
            "requiredConfidence": round(best_spec.stable_threshold, 4),
            "candidateKey": build_state_key(best_spec),
            "stableHits": best_spec.stable_hits,
            "stableThreshold": round(best_spec.stable_threshold, 4),
            "routeCandidate": route_result,
            **default_route_result(
                f"Waiting for stable confirmation of {best_spec.state_name}."
            ),
        }

    return build_non_match_result(
        "unknown",
        (
            f"Best state template is {best_spec.name} at {best_match.confidence:.3f}, "
            f"below the stable threshold {best_spec.stable_threshold:.3f}."
        ),
        template=best_spec.name,
        confidence=best_match.confidence,
        required_confidence=best_spec.stable_threshold,
    )


def build_soft_confirmed_result(
    raw: dict[str, Any], confirmed_hits: int
) -> dict[str, Any]:
    route_result = raw.get("routeCandidate") or default_route_result(
        "No route template matched yet, fallback will use history or default route."
    )
    candidate_state = str(raw.get("candidateState") or "unknown")
    template_name = str(raw.get("template", ""))
    confidence = float(raw.get("confidence", 0.0))
    stable_threshold = float(raw.get("stableThreshold", raw.get("requiredConfidence", 0.0)))
    direct_threshold = float(raw.get("requiredConfidence", 0.0))
    stable_hits = int(raw.get("stableHits", 2))

    return {
        "state": candidate_state,
        "detail": (
            f"State template {template_name} was confirmed {confirmed_hits}/{stable_hits} times, "
            f"with confidence {confidence:.3f}. Stable threshold is {stable_threshold:.3f}, "
            f"direct threshold is {direct_threshold:.3f}."
        ),
        "template": template_name,
        "confidence": round(confidence, 4),
        "requiredConfidence": round(stable_threshold, 4),
        "routeName": route_result.get("routeName", ""),
        "routeSource": route_result.get("routeSource", "default"),
        "routeDetail": route_result.get("routeDetail", ""),
        "routeConfidence": round(float(route_result.get("routeConfidence", 0.0)), 4),
        "routeTemplate": route_result.get("routeTemplate", ""),
        "routeRequiredConfidence": round(
            float(route_result.get("routeRequiredConfidence", 0.0)), 4
        ),
        "_signature": (
            f"stable|{candidate_state}|{template_name}|"
            f"{route_result.get('routeName', '')}|{route_result.get('routeTemplate', '')}"
        ),
    }


def build_soft_pending_result(raw: dict[str, Any], pending_hits: int) -> dict[str, Any]:
    template_name = str(raw.get("template", ""))
    confidence = float(raw.get("confidence", 0.0))
    stable_threshold = float(raw.get("stableThreshold", raw.get("requiredConfidence", 0.0)))
    direct_threshold = float(raw.get("requiredConfidence", 0.0))
    stable_hits = int(raw.get("stableHits", 2))
    candidate_state = str(raw.get("candidateState", "unknown"))

    return {
        "state": "unknown",
        "detail": (
            f"State template {template_name} is in the stable window with confidence {confidence:.3f}. "
            f"Waiting for stable confirmation {pending_hits}/{stable_hits}. "
            f"Stable threshold {stable_threshold:.3f}, direct threshold {direct_threshold:.3f}."
        ),
        "template": template_name,
        "confidence": round(confidence, 4),
        "requiredConfidence": round(stable_threshold, 4),
        **default_route_result(
            f"Waiting for stable confirmation of candidate state {candidate_state}."
        ),
        "_signature": f"soft|{candidate_state}|{template_name}|{pending_hits}/{stable_hits}",
    }


def build_emitted_result(raw: dict[str, Any]) -> dict[str, Any]:
    result = {
        "state": str(raw.get("state", "unknown")),
        "detail": str(raw.get("detail", "")),
        "template": str(raw.get("template", "")),
        "confidence": round(float(raw.get("confidence", 0.0)), 4),
        "requiredConfidence": round(float(raw.get("requiredConfidence", 0.0)), 4),
        "routeName": str(raw.get("routeName", "")),
        "routeSource": str(raw.get("routeSource", "default")),
        "routeDetail": str(raw.get("routeDetail", "")),
        "routeConfidence": round(float(raw.get("routeConfidence", 0.0)), 4),
        "routeTemplate": str(raw.get("routeTemplate", "")),
        "routeRequiredConfidence": round(
            float(raw.get("routeRequiredConfidence", 0.0)), 4
        ),
    }

    signature = raw.get("_signature")
    if signature:
        result["_signature"] = str(signature)
        return result

    result["_signature"] = (
        f"{result['state']}|{result['template']}|{result['routeName']}|"
        f"{result['routeTemplate']}|{result['requiredConfidence']:.4f}"
    )
    return result


def main() -> int:
    args = parse_args()
    require_runtime_dependencies("pyautogui", "pygetwindow")

    if pyautogui is None:
        raise RuntimeError("pyautogui is required for run counter monitor.")

    scene_spec = build_scene_template_spec(args)
    route_specs = load_route_template_specs(args.route_template_root)
    templates = load_templates(args.template_root, route_specs, scene_spec)
    last_signature: str | None = None
    pending_candidate_key: str | None = None
    pending_hits = 0
    confirmed_soft_key: str | None = None

    emit(
        {
            "type": "ready",
            "state": "booting",
            "detail": "Run counter monitor is ready.",
        }
    )

    while True:
        raw = detect_state(
            args.game_window_title,
            templates,
            route_specs,
            scene_spec,
        )
        kind = str(raw.get("kind", "unknown"))
        candidate_key = str(raw.get("candidateKey", "")) or None

        if kind == "hard":
            pending_candidate_key = None
            pending_hits = 0
            confirmed_soft_key = None
            result = build_emitted_result(raw)
        elif kind == "soft" and candidate_key:
            if confirmed_soft_key == candidate_key:
                pending_candidate_key = candidate_key
                pending_hits = int(raw.get("stableHits", 2))
                result = build_soft_confirmed_result(raw, pending_hits)
            else:
                if pending_candidate_key == candidate_key:
                    pending_hits += 1
                else:
                    pending_candidate_key = candidate_key
                    pending_hits = 1

                stable_hits = int(raw.get("stableHits", 2))
                if pending_hits >= stable_hits:
                    confirmed_soft_key = candidate_key
                    result = build_soft_confirmed_result(raw, pending_hits)
                else:
                    confirmed_soft_key = None
                    result = build_soft_pending_result(raw, pending_hits)
        else:
            pending_candidate_key = None
            pending_hits = 0
            confirmed_soft_key = None
            result = build_emitted_result(raw)

        signature = str(result.pop("_signature"))
        if signature != last_signature:
            emit({"type": "state", **result})
            last_signature = signature

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
                "detail": "Run counter monitor stopped.",
            }
        )
        raise
