from fractions import Fraction

from services.graph_service import build_graph_data
from services.simplex_service import solve_simplex


def f(payload):
    return Fraction(payload["fraction"])


def test_known_two_constraint_problem():
    objective = {"x1": 30, "x2": 40}
    constraints = [
        {"x1": 2, "x2": 1, "result": 8},
        {"x1": 1, "x2": 2, "result": 10},
    ]
    result = solve_simplex(objective, constraints)
    assert f(result["optimal_solution"]["x1"]) == Fraction(2)
    assert f(result["optimal_solution"]["x2"]) == Fraction(4)
    assert f(result["optimal_solution"]["z"]) == Fraction(220)
    assert len(result["iterations"]) >= 1


def test_fractional_solution_is_exact():
    objective = {"x1": 3, "x2": 2}
    constraints = [
        {"x1": 2, "x2": 1, "result": 4},
        {"x1": 1, "x2": 2, "result": 4},
    ]
    result = solve_simplex(objective, constraints)
    assert f(result["optimal_solution"]["x1"]) == Fraction(4, 3)
    assert f(result["optimal_solution"]["x2"]) == Fraction(4, 3)
    assert f(result["optimal_solution"]["z"]) == Fraction(20, 3)


def test_three_constraints():
    objective = {"x1": 5, "x2": 4}
    constraints = [
        {"x1": 6, "x2": 4, "result": 24},
        {"x1": 1, "x2": 2, "result": 6},
        {"x1": 1, "x2": 0, "result": 3},
    ]
    result = solve_simplex(objective, constraints)
    assert f(result["optimal_solution"]["x1"]) == Fraction(3)
    assert f(result["optimal_solution"]["x2"]) == Fraction(3, 2)
    assert f(result["optimal_solution"]["z"]) == Fraction(21)


def test_graph_optimum_matches_simplex():
    objective = {"x1": 3, "x2": 2}
    constraints = [
        {"x1": 2, "x2": 1, "result": 4},
        {"x1": 1, "x2": 2, "result": 4},
    ]
    simplex = solve_simplex(objective, constraints)
    graph = build_graph_data(objective, constraints)
    assert f(graph["optimal_point"]["x"]) == f(simplex["optimal_solution"]["x1"])
    assert f(graph["optimal_point"]["y"]) == f(simplex["optimal_solution"]["x2"])
    assert f(graph["optimal_point"]["z"]) == f(simplex["optimal_solution"]["z"])
