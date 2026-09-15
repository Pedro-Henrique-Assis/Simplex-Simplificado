from fastapi import APIRouter, HTTPException
from controllers.simplex_controller import solve_problem, validate_step
from models.attempt import StepValidationRequest
from models.problem import SimplexRequest

router = APIRouter(prefix="/simplex", tags=["simplex"])


@router.post("/solve")
def solve(payload: SimplexRequest):
    try:
        return solve_problem(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/validate-step")
def check_step(payload: StepValidationRequest):
    return validate_step(payload)
