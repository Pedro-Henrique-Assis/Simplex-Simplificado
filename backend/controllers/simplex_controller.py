from services.graph_service import build_graph_data
from services.hint_service import hints_for
from services.simplex_service import solve_simplex


def solve_problem(payload):
    objective = payload.objective.model_dump()
    constraints = [constraint.model_dump() for constraint in payload.constraints]
    result = solve_simplex(objective, constraints)
    result["graph_data"] = build_graph_data(objective, constraints)
    return result


def validate_step(payload):
    correct = str(payload.selected) == str(payload.expected)
    if correct:
        return {
            "correct": True,
            "message": "Correto!",
            "explanation": "Sua escolha segue a regra matemática desta etapa.",
            "hints": [],
        }
    return {
        "correct": False,
        "message": "Essa ainda não é a escolha correta.",
        "explanation": "Revise a regra antes de tentar novamente.",
        "hints": hints_for(payload.step_type),
    }
