from __future__ import annotations

from typing import Dict, List, Tuple

from common.game_actions import calculate_grid_coords


Grid = List[List[Tuple[int, int]]]
Vector = Tuple[float, float]

GEM_ANCHOR_TYPE_CENTER = "center"
GEM_ANCHOR_TYPE_LEGACY_OCR = "legacy_ocr_anchor"

GEM_LEGACY_COL_SHIFT_RATIO = 0.42
GEM_LEGACY_ROW_SHIFT_RATIO = 0.45


def get_grid_anchor_type(config: Dict, mode: str) -> str:
    anchor_type = (config or {}).get("grid_anchor_type")
    if anchor_type:
        return anchor_type
    return GEM_ANCHOR_TYPE_LEGACY_OCR if mode == "Gem" else GEM_ANCHOR_TYPE_CENTER


def _average_grid_vectors(grid: Grid) -> Tuple[Vector, Vector]:
    col_vectors: List[Vector] = []
    row_vectors: List[Vector] = []

    for row in grid:
        for index in range(len(row) - 1):
            x1, y1 = row[index]
            x2, y2 = row[index + 1]
            col_vectors.append((x2 - x1, y2 - y1))

    for row_index in range(len(grid) - 1):
        for col_index in range(len(grid[row_index])):
            x1, y1 = grid[row_index][col_index]
            x2, y2 = grid[row_index + 1][col_index]
            row_vectors.append((x2 - x1, y2 - y1))

    col_dx = sum(vector[0] for vector in col_vectors) / len(col_vectors) if col_vectors else 0.0
    col_dy = sum(vector[1] for vector in col_vectors) / len(col_vectors) if col_vectors else 0.0
    row_dx = sum(vector[0] for vector in row_vectors) / len(row_vectors) if row_vectors else 0.0
    row_dy = sum(vector[1] for vector in row_vectors) / len(row_vectors) if row_vectors else 0.0
    return (col_dx, col_dy), (row_dx, row_dy)


def _shift_grid(grid: Grid, col_vector: Vector, row_vector: Vector, col_ratio: float, row_ratio: float) -> Grid:
    shift_x = col_vector[0] * col_ratio + row_vector[0] * row_ratio
    shift_y = col_vector[1] * col_ratio + row_vector[1] * row_ratio

    shifted: Grid = []
    for row in grid:
        shifted.append(
            [
                (int(round(x + shift_x)), int(round(y + shift_y)))
                for x, y in row
            ]
        )
    return shifted


def build_mode_grids(anchors: Dict, rows: int, cols: int, mode: str, anchor_type: str | None = None):
    raw_grid = calculate_grid_coords(anchors, rows, cols)
    resolved_anchor_type = anchor_type or get_grid_anchor_type({}, mode)

    scan_grid = raw_grid
    interaction_grid = raw_grid

    if mode == "Gem":
        col_vector, row_vector = _average_grid_vectors(raw_grid)
        if resolved_anchor_type == GEM_ANCHOR_TYPE_LEGACY_OCR:
            interaction_grid = _shift_grid(
                raw_grid,
                col_vector,
                row_vector,
                -GEM_LEGACY_COL_SHIFT_RATIO,
                -GEM_LEGACY_ROW_SHIFT_RATIO,
            )
        elif resolved_anchor_type == GEM_ANCHOR_TYPE_CENTER:
            scan_grid = _shift_grid(
                raw_grid,
                col_vector,
                row_vector,
                GEM_LEGACY_COL_SHIFT_RATIO,
                GEM_LEGACY_ROW_SHIFT_RATIO,
            )

    return {
        "anchor_type": resolved_anchor_type,
        "raw_grid": raw_grid,
        "scan_grid": scan_grid,
        "interaction_grid": interaction_grid,
        "display_grid": interaction_grid,
    }
