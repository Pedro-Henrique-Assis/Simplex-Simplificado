from fractions import Fraction
from typing import Any

EPSILON = Fraction(0, 1)


def as_fraction(value: int | float | str | Fraction) -> Fraction:
    if isinstance(value, Fraction):
        return value
    if isinstance(value, float):
        return Fraction(str(value))
    return Fraction(value)


def fraction_text(value: Fraction) -> str:
    return str(value.numerator) if value.denominator == 1 else f"{value.numerator}/{value.denominator}"


def fraction_payload(value: Fraction) -> dict[str, Any]:
    return {
        "fraction": fraction_text(value),
        "decimal": round(float(value), 6),
    }


def serialize_tableau(tableau: list[list[Fraction]], headers: list[str], basis: list[str]) -> dict[str, Any]:
    rows = []
    for index, row in enumerate(tableau):
        label = basis[index] if index < len(basis) else "Z"
        rows.append({
            "label": label,
            "values": [fraction_payload(value) for value in row],
        })
    return {"headers": headers, "rows": rows}


def build_standard_form(objective: dict[str, float], constraints: list[dict[str, float]]) -> dict[str, Any]:
    slack_terms = [f"f{i + 1}" for i in range(len(constraints))]
    equations = []
    for i, constraint in enumerate(constraints):
        terms = [f"{constraint['x1']}x1", f"{constraint['x2']}x2"]
        terms.extend("1" + slack if j == i else "0" + slack for j, slack in enumerate(slack_terms))
        equations.append(f" + ".join(terms) + f" = {constraint['result']}")
    return {
        "objective": f"Max Z = {objective['x1']}x1 + {objective['x2']}x2",
        "equations": equations,
        "slack_variables": slack_terms,
        "explanation": "As variáveis de folga transformam cada desigualdade <= em igualdade e representam recurso não utilizado.",
    }


def solve_simplex(objective: dict[str, float], constraints: list[dict[str, float]]) -> dict[str, Any]:
    m = len(constraints)
    variable_names = ["x1", "x2"] + [f"f{i + 1}" for i in range(m)]
    headers = variable_names + ["RHS"]
    basis = [f"f{i + 1}" for i in range(m)]

    tableau: list[list[Fraction]] = []
    for i, constraint in enumerate(constraints):
        row = [as_fraction(constraint["x1"]), as_fraction(constraint["x2"])]
        row.extend(Fraction(1 if i == j else 0) for j in range(m))
        row.append(as_fraction(constraint["result"]))
        tableau.append(row)

    z_row = [-as_fraction(objective["x1"]), -as_fraction(objective["x2"])]
    z_row.extend(Fraction(0) for _ in range(m))
    z_row.append(Fraction(0))
    tableau.append(z_row)

    initial_tableau = serialize_tableau(tableau, headers, basis)
    iterations: list[dict[str, Any]] = []
    max_iterations = 50

    for iteration_number in range(1, max_iterations + 1):
        z_coefficients = tableau[-1][:-1]
        min_value = min(z_coefficients)
        if min_value >= 0:
            break

        pivot_col = z_coefficients.index(min_value)
        entering_variable = variable_names[pivot_col]
        ratios: list[dict[str, Any]] = []
        valid_ratios: list[tuple[Fraction, int]] = []

        for row_index in range(m):
            coefficient = tableau[row_index][pivot_col]
            rhs = tableau[row_index][-1]
            if coefficient > 0:
                ratio = rhs / coefficient
                valid_ratios.append((ratio, row_index))
                ratios.append({
                    "row": row_index,
                    "basis": basis[row_index],
                    "rhs": fraction_payload(rhs),
                    "coefficient": fraction_payload(coefficient),
                    "ratio": fraction_payload(ratio),
                    "calculation": f"{fraction_text(rhs)} ÷ {fraction_text(coefficient)} = {fraction_text(ratio)}",
                    "eligible": True,
                })
            else:
                ratios.append({
                    "row": row_index,
                    "basis": basis[row_index],
                    "rhs": fraction_payload(rhs),
                    "coefficient": fraction_payload(coefficient),
                    "ratio": None,
                    "calculation": "Razão não calculada: o coeficiente deve ser positivo.",
                    "eligible": False,
                })

        if not valid_ratios:
            raise ValueError("O problema é ilimitado para a formulação informada.")

        _, pivot_row = min(valid_ratios, key=lambda item: (item[0], item[1]))
        leaving_variable = basis[pivot_row]
        pivot = tableau[pivot_row][pivot_col]
        before_tableau = serialize_tableau(tableau, headers, basis)

        normalized_row = [value / pivot for value in tableau[pivot_row]]
        operations = [
            {
                "target": f"L{pivot_row + 1}",
                "expression": f"L{pivot_row + 1} nova = L{pivot_row + 1} ÷ {fraction_text(pivot)}",
                "result": [fraction_payload(v) for v in normalized_row],
            }
        ]
        tableau[pivot_row] = normalized_row

        for row_index in range(m + 1):
            if row_index == pivot_row:
                continue
            factor = tableau[row_index][pivot_col]
            old_row = tableau[row_index][:]
            tableau[row_index] = [
                old_row[col] - factor * normalized_row[col]
                for col in range(len(headers))
            ]
            target = "Z" if row_index == m else f"L{row_index + 1}"
            sign = "-" if factor >= 0 else "+"
            factor_abs = abs(factor)
            operations.append({
                "target": target,
                "expression": f"{target} nova = {target} {sign} {fraction_text(factor_abs)} × L{pivot_row + 1} nova",
                "result": [fraction_payload(v) for v in tableau[row_index]],
            })

        basis[pivot_row] = entering_variable
        after_tableau = serialize_tableau(tableau, headers, basis)
        iterations.append({
            "number": iteration_number,
            "entering_variable": entering_variable,
            "leaving_variable": leaving_variable,
            "pivot_column_index": pivot_col,
            "pivot_row_index": pivot_row,
            "pivot": fraction_payload(pivot),
            "ratios": ratios,
            "before_tableau": before_tableau,
            "operations": operations,
            "after_tableau": after_tableau,
            "explanations": {
                "pivot_column": f"{entering_variable} entra na base porque possui o coeficiente mais negativo na linha Z ({fraction_text(min_value)}).",
                "pivot_row": f"{leaving_variable} sai da base porque sua linha possui a menor razão não negativa.",
                "pivot": f"O elemento pivô é {fraction_text(pivot)}, na interseção da coluna {entering_variable} com a linha de {leaving_variable}.",
            },
        })
    else:
        raise ValueError("O limite de iterações foi excedido.")

    solution = {name: Fraction(0) for name in variable_names}
    for row_index, basic_variable in enumerate(basis):
        solution[basic_variable] = tableau[row_index][-1]
    z_value = tableau[-1][-1]

    return {
        "standard_form": build_standard_form(objective, constraints),
        "initial_tableau": initial_tableau,
        "iterations": iterations,
        "final_tableau": serialize_tableau(tableau, headers, basis),
        "optimal_solution": {
            "x1": fraction_payload(solution["x1"]),
            "x2": fraction_payload(solution["x2"]),
            "z": fraction_payload(z_value),
            "iterations": len(iterations),
        },
    }
