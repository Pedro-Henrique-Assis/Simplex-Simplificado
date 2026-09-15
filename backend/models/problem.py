from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class ConstraintInput(BaseModel):
    x1: float
    x2: float
    operator: Literal["<="] = "<="
    result: float = Field(gt=0)

    @model_validator(mode="after")
    def validate_coefficients(self):
        if self.x1 < 0 or self.x2 < 0:
            raise ValueError("Os coeficientes das restrições devem ser não negativos neste MVP.")
        if self.x1 == 0 and self.x2 == 0:
            raise ValueError("Uma restrição precisa possuir pelo menos um coeficiente diferente de zero.")
        return self


class ObjectiveInput(BaseModel):
    x1: float
    x2: float

    @model_validator(mode="after")
    def validate_objective(self):
        if self.x1 <= 0 and self.x2 <= 0:
            raise ValueError("Informe pelo menos um coeficiente positivo na função objetivo.")
        return self


class SimplexRequest(BaseModel):
    objective: ObjectiveInput
    constraints: list[ConstraintInput] = Field(min_length=2, max_length=3)


class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: Literal["easy", "intermediate", "hard"]
    status: Literal["available"]
    objective_type: Literal["maximize"]
    x1_coefficient: float
    x2_coefficient: float
    constraint_1_x1: float
    constraint_1_x2: float
    constraint_1_operator: str
    constraint_1_result: float
    constraint_2_x1: float
    constraint_2_x2: float
    constraint_2_operator: str
    constraint_2_result: float
    constraint_3_x1: float | None = None
    constraint_3_x2: float | None = None
    constraint_3_operator: str | None = None
    constraint_3_result: float | None = None
    created_at: str
