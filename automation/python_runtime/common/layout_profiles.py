from __future__ import annotations

import copy
from typing import Any, Dict, Tuple

from common.window_scaling import get_game_window_metrics


LAYOUT_PROFILES_KEY = "layout_profiles"
ACTIVE_LAYOUT_PROFILE_KEY = "active_layout_profile"

_RUNTIME_PROFILE_NAME_KEY = "_layout_profile_name"
_RUNTIME_PROFILE_META_KEY = "_layout_profile_meta"


def _sanitize_profile_name(name: str | None) -> str | None:
    text = str(name or "").strip()
    return text or None


def _clone_config(value: Dict[str, Any] | None) -> Dict[str, Any]:
    return copy.deepcopy(value or {})


def _get_profile_reference_metrics(profile: Dict[str, Any] | None) -> Dict[str, int] | None:
    reference = (profile or {}).get("reference_window")
    if not isinstance(reference, dict):
        return None

    try:
        width = int(reference.get("width", 0) or 0)
        height = int(reference.get("height", 0) or 0)
    except Exception:
        return None

    if width <= 0 or height <= 0:
        return None

    return {"width": width, "height": height}


def infer_profile_name(metrics: Dict[str, Any] | None = None, fallback: str = "default") -> str:
    if not isinstance(metrics, dict):
        return fallback

    try:
        width = int(metrics.get("width", 0) or 0)
        height = int(metrics.get("height", 0) or 0)
    except Exception:
        return fallback

    if width <= 0 or height <= 0:
        return fallback

    return f"{width}x{height}"


def _extract_profile_payload(config: Dict[str, Any] | None) -> Dict[str, Any]:
    payload = _clone_config(config)
    payload.pop(LAYOUT_PROFILES_KEY, None)
    payload.pop(ACTIVE_LAYOUT_PROFILE_KEY, None)
    payload.pop(_RUNTIME_PROFILE_NAME_KEY, None)
    payload.pop(_RUNTIME_PROFILE_META_KEY, None)
    return payload


def normalize_layout_profiles(config: Dict[str, Any] | None, current_metrics=None) -> Dict[str, Any]:
    normalized = _clone_config(config)
    profiles = normalized.get(LAYOUT_PROFILES_KEY)

    if isinstance(profiles, dict) and profiles:
        active_name = _sanitize_profile_name(normalized.get(ACTIVE_LAYOUT_PROFILE_KEY))
        if not active_name or active_name not in profiles:
            normalized[ACTIVE_LAYOUT_PROFILE_KEY] = next(iter(profiles))
        return normalized

    payload = _extract_profile_payload(normalized)
    if not payload:
        return {
            ACTIVE_LAYOUT_PROFILE_KEY: None,
            LAYOUT_PROFILES_KEY: {},
        }

    metrics = _get_profile_reference_metrics(payload) or current_metrics
    profile_name = infer_profile_name(metrics)
    return {
        ACTIVE_LAYOUT_PROFILE_KEY: profile_name,
        LAYOUT_PROFILES_KEY: {
            profile_name: payload,
        },
    }


def _metrics_distance(left: Dict[str, int] | None, right: Dict[str, int] | None) -> float:
    if not left or not right:
        return float("inf")

    try:
        delta_width = abs(int(left["width"]) - int(right["width"]))
        delta_height = abs(int(left["height"]) - int(right["height"]))
    except Exception:
        return float("inf")

    base_width = max(1, int(right["width"]))
    base_height = max(1, int(right["height"]))
    return (delta_width / base_width) + (delta_height / base_height)


def resolve_layout_profile(config: Dict[str, Any] | None, current_metrics=None, requested_profile=None) -> Tuple[str | None, Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    normalized = normalize_layout_profiles(config, current_metrics=current_metrics)
    profiles = normalized.get(LAYOUT_PROFILES_KEY) or {}
    available_profiles = list(profiles.keys())
    active_name = _sanitize_profile_name(normalized.get(ACTIVE_LAYOUT_PROFILE_KEY))
    requested_name = _sanitize_profile_name(requested_profile)

    if not profiles:
        meta = {
            "profile_name": None,
            "selection_reason": "empty",
            "available_profiles": [],
            "current_window": current_metrics,
            "reference_window": None,
        }
        return None, {}, normalized, meta

    selection_reason = "active"
    selected_name = None

    if requested_name and requested_name in profiles:
        selected_name = requested_name
        selection_reason = "requested"
    elif current_metrics:
        current_signature = infer_profile_name(current_metrics, fallback="")
        for name, profile in profiles.items():
            reference = _get_profile_reference_metrics(profile)
            if reference and infer_profile_name(reference, fallback="") == current_signature:
                selected_name = name
                selection_reason = "exact_window"
                break

        if not selected_name:
            ranked_profiles = []
            for name, profile in profiles.items():
                ranked_profiles.append(
                    (
                        _metrics_distance(_get_profile_reference_metrics(profile), current_metrics),
                        name,
                    )
                )
            ranked_profiles.sort(key=lambda item: (item[0], item[1]))
            if ranked_profiles:
                selected_name = ranked_profiles[0][1]
                selection_reason = "nearest_window"

    if not selected_name and active_name in profiles:
        selected_name = active_name
        selection_reason = "active"

    if not selected_name:
        selected_name = available_profiles[0]
        selection_reason = "first_available"

    selected_profile = _clone_config(profiles.get(selected_name))
    reference_window = _get_profile_reference_metrics(selected_profile)
    meta = {
        "profile_name": selected_name,
        "selection_reason": selection_reason,
        "available_profiles": available_profiles,
        "current_window": current_metrics,
        "reference_window": reference_window,
    }
    return selected_name, selected_profile, normalized, meta


def strip_runtime_profile_keys(config: Dict[str, Any] | None) -> Dict[str, Any]:
    payload = _clone_config(config)
    payload.pop(_RUNTIME_PROFILE_NAME_KEY, None)
    payload.pop(_RUNTIME_PROFILE_META_KEY, None)
    return payload


def attach_runtime_profile_metadata(profile_config: Dict[str, Any] | None, profile_name=None, profile_meta=None) -> Dict[str, Any]:
    config = strip_runtime_profile_keys(profile_config)
    config[_RUNTIME_PROFILE_NAME_KEY] = profile_name
    config[_RUNTIME_PROFILE_META_KEY] = _clone_config(profile_meta)
    return config


def resolve_runtime_profile(config: Dict[str, Any] | None, current_metrics=None, requested_profile=None) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    profile_name, profile_config, normalized, meta = resolve_layout_profile(
        config,
        current_metrics=current_metrics,
        requested_profile=requested_profile,
    )
    runtime_profile = attach_runtime_profile_metadata(
        profile_config,
        profile_name=profile_name,
        profile_meta=meta,
    )
    return runtime_profile, normalized, meta


def get_runtime_profile_name(config: Dict[str, Any] | None) -> str | None:
    return _sanitize_profile_name((config or {}).get(_RUNTIME_PROFILE_NAME_KEY))


def get_runtime_profile_meta(config: Dict[str, Any] | None) -> Dict[str, Any]:
    meta = (config or {}).get(_RUNTIME_PROFILE_META_KEY)
    return _clone_config(meta if isinstance(meta, dict) else {})


def store_runtime_profile(config: Dict[str, Any] | None, profile_config: Dict[str, Any] | None, current_metrics=None, profile_name=None) -> Tuple[Dict[str, Any], str]:
    current_metrics = current_metrics or get_game_window_metrics()
    normalized = normalize_layout_profiles(config, current_metrics=current_metrics)
    profiles = normalized.setdefault(LAYOUT_PROFILES_KEY, {})

    selected_name = _sanitize_profile_name(profile_name) or get_runtime_profile_name(profile_config)
    if not selected_name:
        if current_metrics:
            selected_name = infer_profile_name(current_metrics)
        else:
            selected_name = normalized.get(ACTIVE_LAYOUT_PROFILE_KEY) or "default"

    stored_profile = strip_runtime_profile_keys(profile_config)
    if current_metrics:
        stored_profile["reference_window"] = {
            "width": int(current_metrics.get("width", 0) or 0),
            "height": int(current_metrics.get("height", 0) or 0),
        }
        selected_name = infer_profile_name(stored_profile["reference_window"], fallback=selected_name)

    profiles[selected_name] = stored_profile
    normalized[ACTIVE_LAYOUT_PROFILE_KEY] = selected_name
    return normalized, selected_name
