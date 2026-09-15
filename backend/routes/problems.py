from fastapi import APIRouter, HTTPException, Query
from controllers.problem_controller import get_problem, list_problems

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("")
def problems(difficulty: str | None = Query(default=None, pattern="^(easy|intermediate|hard)$")):
    return list_problems(difficulty)


@router.get("/{problem_id}")
def problem(problem_id: int):
    item = get_problem(problem_id)
    if not item:
        raise HTTPException(status_code=404, detail="Exercício não encontrado.")
    return item
