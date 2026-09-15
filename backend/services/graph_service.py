from fractions import Fraction
from itertools import combinations
from typing import Any

from services.simplex_service import as_fraction, fraction_payload


def _is_feasible(x: Fraction, y: Fraction, constraints: list[dict[str, float]]) -> bool:
    if x < 0 or y < 0:
        return False
    return all(
        as_fraction(c["x1"]) * x + as_fraction(c["x2"]) * y <= as_fraction(c["result"])
        for c in constraints
    )


def _intersection(a: tuple[Fraction, Fraction, Fraction], b: tuple[Fraction, Fraction, Fraction]):
    a1, b1, c1 = a
    a2, b2, c2 = b
    determinant = a1 * b2 - a2 * b1
    if determinant == 0:
        return None
    x = (c1 * b2 - c2 * b1) / determinant
    y = (a1 * c2 - a2 * c1) / determinant
    return x, y


def build_graph_data(objective: dict[str, float], constraints: list[dict[str, float]]) -> dict[str, Any]:
    lines = [
        (as_fraction(c["x1"]), as_fraction(c["x2"]), as_fraction(c["result"]))
        for c in constraints
    ]
    axes = [(Fraction(1), Fraction(0), Fraction(0)), (Fraction(0), Fraction(1), Fraction(0))]
    candidates = {(Fraction(0), Fraction(0))}

    for line in lines:
        a, b, c = line
        if a > 0:
            candidates.add((c / a, Fraction(0)))
        if b > 0:
            candidates.add((Fraction(0), c / b))

    for first, second in combinations(lines + axes, 2):
        point = _intersection(first, second)
        if point:
            candidates.add(point)

    feasible = [point for point in candidates if _is_feasible(point[0], point[1], constraints)]
    feasible = sorted(feasible, key=lambda point: (float(point[0]), float(point[1])))

    if not feasible:
        raise ValueError("Não foi possível identificar uma região viável.")

    centroid_x = sum((p[0] for p in feasible), Fraction(0)) / len(feasible)
    centroid_y = sum((p[1] for p in feasible), Fraction(0)) / len(feasible)
    import math
    polygon = sorted(
        feasible,
        key=lambda p: math.atan2(float(p[1] - centroid_y), float(p[0] - centroid_x)),
    )

    c1 = as_fraction(objective["x1"])
    c2 = as_fraction(objective["x2"])
    evaluated = [(c1 * x + c2 * y, x, y) for x, y in feasible]
    best_z, best_x, best_y = max(evaluated, key=lambda item: item[0])

    max_coordinate = max([float(x) for x, _ in feasible] + [float(y) for _, y in feasible] + [1.0])
    margin = max_coordinate * 0.15 + 0.5

    line_payload = []
    for index, (a, b, c) in enumerate(lines):
        x_intercept = c / a if a else None
        y_intercept = c / b if b else None
        line_payload.append({
            "name": f"Restrição {index + 1}",
            "x1_coefficient": fraction_payload(a),
            "x2_coefficient": fraction_payload(b),
            "result": fraction_payload(c),
            "x_intercept": fraction_payload(x_intercept) if x_intercept is not None else None,
            "y_intercept": fraction_payload(y_intercept) if y_intercept is not None else None,
        })

    return {
        "constraints": line_payload,
        "vertices": [
            {"label": chr(65 + i), "x": fraction_payload(x), "y": fraction_payload(y)}
            for i, (x, y) in enumerate(polygon)
        ],
        "optimal_point": {
            "x": fraction_payload(best_x),
            "y": fraction_payload(best_y),
            "z": fraction_payload(best_z),
        },
        "axis_max": round(max_coordinate + margin, 4),
    }
