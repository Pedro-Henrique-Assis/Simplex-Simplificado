from pydantic import BaseModel


class StepValidationRequest(BaseModel):
    step_type: str
    selected: str | int
    expected: str | int


class StepValidationResponse(BaseModel):
    correct: bool
    message: str
    explanation: str
    hints: list[str]
