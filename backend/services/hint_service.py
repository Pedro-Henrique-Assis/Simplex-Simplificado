HINTS: dict[str, list[str]] = {
    "choose_pivot_column": [
        "Observe os coeficientes da linha Z.",
        "Na maximização, procure o coeficiente mais negativo na linha Z.",
        "Compare somente os coeficientes associados às variáveis que podem entrar na base.",
    ],
    "choose_pivot_row": [
        "Calcule RHS ÷ coeficiente positivo da coluna pivô.",
        "Ignore razões com divisor zero ou negativo.",
        "A menor razão não negativa determina a linha que sai da base.",
    ],
}


def hints_for(step_type: str) -> list[str]:
    return HINTS.get(step_type, ["Revise os valores destacados e a regra apresentada nesta etapa."])
