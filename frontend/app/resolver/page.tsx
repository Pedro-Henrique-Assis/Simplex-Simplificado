"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import "katex/dist/katex.min.css";

import Graph2D from "@/components/Graph2D";
import HintBox from "@/components/HintBox";

import {
  InlineFormula,
  MathBlock,
  MathText,
  VariableText,
  divisionToLatex,
  expressionToLatex,
  fractionToLatex,
  operationToLatex,
  symbolToLatex,
} from "@/components/MathNotation";

import ProgressBar from "@/components/ProgressBar";
import SimplexTable from "@/components/SimplexTable";
import StepCard from "@/components/StepCard";

import {
  getProblem,
  solveSimplex,
  validateStep,
} from "@/services/api";

import type {
  ConstraintInput,
  Problem,
  SimplexPayload,
  SimplexResult,
} from "@/types/simplex";

type FormConstraint = {
  x1: string;
  x2: string;
  result: string;
};

type LessonStep =
  | { kind: "intro" }
  | { kind: "standard" }
  | { kind: "initial" }
  | {
      kind: "pivot-column";
      iteration: number;
    }
  | {
      kind: "pivot-row";
      iteration: number;
    }
  | {
      kind: "operations";
      iteration: number;
    }
  | {
      kind: "new-table";
      iteration: number;
    }
  | { kind: "result" }
  | { kind: "graph" };

const blankConstraint =
  (): FormConstraint => ({
    x1: "",
    x2: "",
    result: "",
  });

const columnHints = [
  "Observe os coeficientes da linha $Z$.",
  "Na maximização, procure o coeficiente mais negativo na linha $Z$.",
  "A variável associada a esse coeficiente entra na base.",
];

const rowHints = [
  "Divida o $\\mathrm{RHS}$ pelo coeficiente positivo da coluna pivô.",
  "Ignore linhas cujo coeficiente na coluna pivô seja zero ou negativo.",
  "A menor razão não negativa define a linha que sai da base.",
];

function mathToken(
  symbol: string,
): string {
  return `$${symbolToLatex(symbol)}$`;
}

function normalizeNumericInput(
  rawValue: string,
  allowNegative = false,
): string | null {

  const normalized = rawValue
    .replace(/\s+/g, "")
    .replace(/,/g, ".");


  if (normalized === "") {
    return "";
  }

  const pattern = allowNegative
    ? /^-?\d*(?:\.\d*)?$/
    : /^\d*(?:\.\d*)?$/;

  if (!pattern.test(normalized)) {
    return null;
  }

  return normalized;
}

function finalizeNumericInput(
  rawValue: string,
  allowNegative = false,
): string {
  const normalized = normalizeNumericInput(
    rawValue,
    allowNegative,
  );

  if (
    normalized === null ||
    normalized === "" ||
    normalized === "." ||
    normalized === "-" ||
    normalized === "-."
  ) {
    return "";
  }

  let result = normalized;

  if (result.startsWith(".")) {
    result = `0${result}`;
  }

  if (result.startsWith("-.")) {
    result = `-0${result.slice(1)}`;
  }

  if (result.endsWith(".")) {
    result = result.slice(0, -1);
  }

  return result;
}



function ResolverContent() {
  const searchParams =
    useSearchParams();

  const problemId =
    searchParams.get("problem");

  const isLibraryProblem = 
    problemId !== null;

  const lockedFieldClass =
    isLibraryProblem
      ? "cursor-not-allowed bg-black/[0.05] text-black/50 opacity-70"
      : "cursor-text";

  const [
    problem,
    setProblem,
  ] = useState<Problem | null>(
    null,
  );

  const [
    objective,
    setObjective,
  ] = useState({
    x1: "",
    x2: "",
  });

  const [
    constraints,
    setConstraints,
  ] = useState<FormConstraint[]>([
    blankConstraint(),
    blankConstraint(),
  ]);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    result,
    setResult,
  ] =
    useState<SimplexResult | null>(
      null,
    );

  useEffect(() => {
    if (!problemId) {
      return;
    }

    setLoading(true);

    getProblem(Number(problemId))
      .then((item) => {
        setProblem(item);

        setObjective({
          x1: String(
            item.x1_coefficient,
          ),
          x2: String(
            item.x2_coefficient,
          ),
        });

        const loaded:
          FormConstraint[] = [
          {
            x1: String(
              item.constraint_1_x1,
            ),
            x2: String(
              item.constraint_1_x2,
            ),
            result: String(
              item.constraint_1_result,
            ),
          },

          {
            x1: String(
              item.constraint_2_x1,
            ),
            x2: String(
              item.constraint_2_x2,
            ),
            result: String(
              item.constraint_2_result,
            ),
          },
        ];

        if (
          item.constraint_3_result !=
            null &&
          item.constraint_3_x1 != null &&
          item.constraint_3_x2 != null
        ) {
          loaded.push({
            x1: String(
              item.constraint_3_x1,
            ),
            x2: String(
              item.constraint_3_x2,
            ),
            result: String(
              item.constraint_3_result,
            ),
          });
        }

        setConstraints(loaded);
      })
      .catch((err: Error) =>
        setError(err.message),
      )
      .finally(() =>
        setLoading(false),
      );
  }, [problemId]);

  function updateConstraint(
    index: number,
    field: keyof FormConstraint,
    value: string,
  ) {
    setConstraints(
      (current) =>
        current.map(
          (constraint, i) =>
            i === index
              ? {
                  ...constraint,
                  [field]: value,
                }
              : constraint,
        ),
    );
  }

  function updateObjective(
    field: "x1" | "x2",
    rawValue: string,
  ) {
    if (isLibraryProblem) {
      return;
    }

    const normalized = normalizeNumericInput(
      rawValue,
      true,
    );

    if (normalized === null) {
      return;
    }

    setObjective((current) => ({
      ...current,
      [field]: normalized,
    }));
  }

  function finishObjective(
    field: "x1" | "x2",
  ) {
    if (isLibraryProblem) {
      return;
    }

    setObjective((current) => ({
      ...current,
      [field]: finalizeNumericInput(
        current[field],
        true,
      ),
    }));
  }

  function updateNumericConstraint(
    index: number,
    field: keyof FormConstraint,
    rawValue: string,
  ) {
    if (isLibraryProblem) {
      return;
    }

    const normalized =
      normalizeNumericInput(
        rawValue,
        false,
      );

    if (normalized === null) {
      return;
    }

    updateConstraint(
      index,
      field,
      normalized,
    );
  }

  function finishConstraint(
    index: number,
    field: keyof FormConstraint,
  ) {
    if (isLibraryProblem) {
      return;
    }

    setConstraints((current) =>
      current.map((constraint, i) => {
        if (i !== index) {
          return constraint;
        }

        return {
          ...constraint,
          [field]: finalizeNumericInput(
            constraint[field],
            false,
          ),
        };
      }),
    );
  }

  function buildPayload():
    SimplexPayload | null {
    setError("");

    const objectiveValues = [
      objective.x1,
      objective.x2,
    ];

    if (
      objectiveValues.some(
        (value) =>
          value == null ||
          value.trim() === "",
      )
    ) {
      setError(
        "Preencha todos os coeficientes da função objetivo.",
      );

      return null;
    }

    const normalizedObjectiveX1 =
      normalizeNumericInput(
        objective.x1,
        true,
      );

    const normalizedObjectiveX2 =
      normalizeNumericInput(
        objective.x2,
        true,
      );

    if (
      normalizedObjectiveX1 === null ||
      normalizedObjectiveX2 === null ||
      normalizedObjectiveX1 === "" ||
      normalizedObjectiveX2 === "" ||
      normalizedObjectiveX1 === "." ||
      normalizedObjectiveX2 === "." ||
      normalizedObjectiveX1 === "-" ||
      normalizedObjectiveX2 === "-" ||
      normalizedObjectiveX1 === "-." ||
      normalizedObjectiveX2 === "-."
    ) {
      setError(
        "A função objetivo deve conter apenas valores numéricos válidos.",
      );

      return null;
    }

    const objectiveNumbers = {
      x1: Number(
        normalizedObjectiveX1,
      ),
      x2: Number(
        normalizedObjectiveX2,
      ),
    };

    if (
      !Number.isFinite(
        objectiveNumbers.x1,
      ) ||
      !Number.isFinite(
        objectiveNumbers.x2,
      )
    ) {
      setError(
        "A função objetivo deve conter apenas valores numéricos.",
      );

      return null;
    }

    if (
      objectiveNumbers.x1 <= 0 &&
      objectiveNumbers.x2 <= 0
    ) {
      setError(
        "A função objetivo precisa ter pelo menos um coeficiente positivo.",
      );

      return null;
    }

    const parsed:
      ConstraintInput[] = [];

    for (
      let i = 0;
      i < constraints.length;
      i++
    ) {
      const constraint =
        constraints[i];

      const values = [
        constraint.x1,
        constraint.x2,
        constraint.result,
      ];

      if (
        values.some(
          (value) =>
            value == null ||
            value.trim() === "",
        )
      ) {
        setError(
          `Preencha todos os campos da ${
            i + 1
          }ª restrição.`,
        );

        return null;
      }

      const normalizedX1 =
        normalizeNumericInput(
          constraint.x1,
          false,
        );

      const normalizedX2 =
        normalizeNumericInput(
          constraint.x2,
          false,
        );

      const normalizedResult =
        normalizeNumericInput(
          constraint.result,
          false,
        );

      if (
        normalizedX1 === null ||
        normalizedX2 === null ||
        normalizedResult === null ||
        normalizedX1 === "" ||
        normalizedX2 === "" ||
        normalizedResult === "" ||
        normalizedX1 === "." ||
        normalizedX2 === "." ||
        normalizedResult === "."
      ) {
        setError(
          `Use apenas valores numéricos válidos na ${
            i + 1
          }ª restrição.`,
        );

        return null;
      }

      const x1 =
        Number(normalizedX1);

      const x2 =
        Number(normalizedX2);

      const resultValue =
        Number(
          normalizedResult,
        );

      if (
        ![
          x1,
          x2,
          resultValue,
        ].every(
          Number.isFinite,
        )
      ) {
        setError(
          `Use apenas valores numéricos na ${
            i + 1
          }ª restrição.`,
        );

        return null;
      }

      if (
        x1 < 0 ||
        x2 < 0
      ) {
        setError(
          `Os coeficientes da ${
            i + 1
          }ª restrição não podem ser negativos.`,
        );

        return null;
      }

      if (
        x1 === 0 &&
        x2 === 0
      ) {
        setError(
          `A ${
            i + 1
          }ª restrição precisa possuir pelo menos um coeficiente maior que zero.`,
        );

        return null;
      }

      if (
        resultValue <= 0
      ) {
        setError(
          `O limite da ${
            i + 1
          }ª restrição deve ser maior que zero.`,
        );

        return null;
      }

      parsed.push({
        x1,
        x2,
        operator: "<=",
        result: resultValue,
      });
    }

    return {
      objective:
        objectiveNumbers,

      constraints:
        parsed,
    };
  }

  async function startResolution() {
    const payload =
      buildPayload();

    if (!payload) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      setResult(
        await solveSimplex(
          payload,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível resolver o problema.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <GuidedResolution
        result={result}
        problem={problem}
        onEdit={() =>
          setResult(null)
        }
      />
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-black/45">
            Resolver
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Monte o problema sem
            escrever fórmulas.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-black/65">
            Preencha apenas os
            coeficientes. O SimplexLab
            transforma a modelagem em
            uma resolução guiada.
          </p>

          {problem && (
            <div className="mt-8 border-l-4 border-[#80FFF6] bg-[#F7F7F7] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-black/45">
                Problema da biblioteca
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {problem.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/65">
                <VariableText>
                  {problem.description}
                </VariableText>
              </p>
            </div>
          )}

          <div className="mt-10 space-y-9">
            <fieldset>
              <legend className="mb-4 text-lg font-bold">
                Função objetivo
              </legend>

              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-black p-5 text-white">
                <InlineFormula
                  math="\max Z ="
                  className="font-semibold"
                />

                <label>
                  <span className="sr-only">
                    Coeficiente de x1
                  </span>

                  <input
                    className={`w-24 rounded-lg px-3 py-2 text-black outline-none transition ${
                      isLibraryProblem
                        ? "cursor-not-allowed bg-white/80 text-black/50"
                        : "cursor-text bg-white focus:ring-2 focus:ring-[#80FFF6]"
                    }`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    disabled={isLibraryProblem}
                    value={objective.x1}
                    onChange={(e) =>
                      updateObjective(
                        "x1",
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      finishObjective("x1")
                    }
                    aria-label="Coeficiente de x1 na função objetivo"
                    title={
                      isLibraryProblem
                        ? "Campo bloqueado para problemas da biblioteca"
                        : "Informe um valor numérico"
                    }
                  />
                </label>

                <InlineFormula
                  math="x_{1} +"
                />

                <label>
                  <span className="sr-only">
                    Coeficiente de x2
                  </span>

                  <input
                    className={`w-24 rounded-lg px-3 py-2 text-black outline-none transition ${
                      isLibraryProblem
                        ? "cursor-not-allowed bg-white/80 text-black/50"
                        : "cursor-text bg-white focus:ring-2 focus:ring-[#80FFF6]"
                    }`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    disabled={isLibraryProblem}
                    value={objective.x2}
                    onChange={(e) =>
                      updateObjective(
                        "x2",
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      finishObjective("x2")
                    }
                    aria-label="Coeficiente de x2 na função objetivo"
                    title={
                      isLibraryProblem
                        ? "Campo bloqueado para problemas da biblioteca"
                        : "Informe um valor numérico"
                    }
                  />
                </label>

                <InlineFormula
                  math="x_{2}"
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-lg font-bold">
                Restrições
              </legend>

              <div className="space-y-3">
                {constraints.map(
                  (
                    constraint,
                    index,
                  ) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4"
                    >
                      <span className="w-20 text-sm font-semibold text-black/55">
                        Restrição{" "}
                        {index + 1}
                      </span>

                      <input
                        className={`field !w-24 ${lockedFieldClass}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        disabled={isLibraryProblem}
                        value={constraint.x1}
                        onChange={(e) =>
                          updateNumericConstraint(
                            index,
                            "x1",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          finishConstraint(
                            index,
                            "x1",
                          )
                        }
                        aria-label={`Coeficiente de x1 na restrição ${
                          index + 1
                        }`}
                        title={
                          isLibraryProblem
                            ? "Campo bloqueado para problemas da biblioteca"
                            : "Informe um valor numérico não negativo"
                        }
                      />

                      <InlineFormula
                        math="x_{1} +"
                      />

                      <input
                        className={`field !w-24 ${lockedFieldClass}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        disabled={isLibraryProblem}
                        value={constraint.x2}
                        onChange={(e) =>
                          updateNumericConstraint(
                            index,
                            "x2",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          finishConstraint(
                            index,
                            "x2",
                          )
                        }
                        aria-label={`Coeficiente de x2 na restrição ${
                          index + 1
                        }`}
                        title={
                          isLibraryProblem
                            ? "Campo bloqueado para problemas da biblioteca"
                            : "Informe um valor numérico não negativo"
                        }
                      />

                      <InlineFormula
                        math="x_{2} \leq"
                      />

                      <input
                        className={`field !w-28 ${lockedFieldClass}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        disabled={isLibraryProblem}
                        value={constraint.result}
                        onChange={(e) =>
                          updateNumericConstraint(
                            index,
                            "result",
                            e.target.value,
                          )
                        }
                        onBlur={() =>
                          finishConstraint(
                            index,
                            "result",
                          )
                        }
                        aria-label={`Resultado da restrição ${
                          index + 1
                        }`}
                        title={
                          isLibraryProblem
                            ? "Campo bloqueado para problemas da biblioteca"
                            : "Informe um valor numérico positivo"
                        }
                      />

                      {!isLibraryProblem &&
                        constraints.length === 3 &&
                        index === 2 && (
                          <button
                            type="button"
                            className="ml-auto cursor-pointer text-sm font-semibold underline"
                            onClick={() =>
                              setConstraints((value) =>
                                value.slice(0, 2)
                              )
                            }
                          >
                            Remover
                          </button>
                        )}
                    </div>
                  ),
                )}
              </div>

              {!isLibraryProblem && constraints.length < 3 && (
                <button
                  type="button"
                  className="mt-4 cursor-pointer text-sm font-semibold underline decoration-[#80FFF6] decoration-4 underline-offset-4"
                  onClick={() =>
                    setConstraints((value) => [
                      ...value,
                      blankConstraint(),
                    ])
                  }
                >
                  + Adicionar terceira restrição
                </button>
              )}
            </fieldset>
          </div>

          {error && (
            <div
              className="mt-6 border-l-4 border-red-600 bg-red-50 p-4 text-sm"
              role="alert"
            >
              <strong>
                Revise antes de
                continuar:
              </strong>{" "}
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn-primary mt-8 cursor-pointer disabled:cursor-not-allowed"
            onClick={
              startResolution
            }
            disabled={loading}
          >
            {loading
              ? "Preparando resolução..."
              : "Iniciar resolução guiada"}
          </button>
        </section>

        <aside className="h-fit border-t-2 border-black pt-5 lg:sticky lg:top-24">
          <h2 className="font-bold">
            Limites deste MVP
          </h2>

          <ul className="mt-4 space-y-2 text-sm leading-6 text-black/65">
            <li>
              • Maximização
            </li>

            <li>
              • Duas variáveis:{" "}
              <InlineFormula
                math="x_{1}"
              />{" "}
              e{" "}
              <InlineFormula
                math="x_{2}"
              />
            </li>

            <li>
              • Duas ou três
              restrições
            </li>

            <li>
              • Restrições do tipo{" "}
              <InlineFormula
                math="\leq"
              />
            </li>

            <li>
              •{" "}
              <InlineFormula
                math="x_{1}, x_{2} \geq 0"
              />
            </li>
          </ul>

          <p className="mt-6 text-sm text-black/55">
            O foco é aprender o
            Simplex clássico com
            variáveis de folga, sem
            Big M ou método das duas
            fases.
          </p>
        </aside>
      </div>
    </div>
  );
}

function GuidedResolution({
  result,
  problem,
  onEdit,
}: {
  result: SimplexResult;
  problem: Problem | null;
  onEdit: () => void;
}) {
  const steps =
    useMemo<LessonStep[]>(
      () => {
        const list:
          LessonStep[] = [
          { kind: "intro" },
          { kind: "standard" },
          { kind: "initial" },
        ];

        result.iterations.forEach(
          (_, iteration) =>
            list.push(
              {
                kind:
                  "pivot-column",
                iteration,
              },
              {
                kind: "pivot-row",
                iteration,
              },
              {
                kind: "operations",
                iteration,
              },
              {
                kind: "new-table",
                iteration,
              },
            ),
        );

        list.push(
          { kind: "result" },
          { kind: "graph" },
        );

        return list;
      },
      [result],
    );

  const [
    index,
    setIndex,
  ] = useState(0);

  const [
    selected,
    setSelected,
  ] = useState<
    string | null
  >(null);

  const [
    feedback,
    setFeedback,
  ] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const [
    completed,
    setCompleted,
  ] = useState<Set<number>>(
    new Set(),
  );

  const step = steps[index];

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [index]);

  const interactive =
    step.kind ===
      "pivot-column" ||
    step.kind === "pivot-row";

  const isCompleted =
    !interactive ||
    completed.has(index);

  async function confirmChoice() {
    if (
      !selected ||
      !interactive
    ) {
      return;
    }

    const iteration =
      result.iterations[
        step.iteration
      ];

    const expected =
      step.kind ===
      "pivot-column"
        ? iteration.entering_variable
        : iteration.leaving_variable;

    const validation =
      await validateStep(
        step.kind ===
          "pivot-column"
          ? "choose_pivot_column"
          : "choose_pivot_row",
        selected,
        expected,
      );

    if (validation.correct) {
      setCompleted(
        (current) =>
          new Set(
            current,
          ).add(index),
      );

      if (
        step.kind ===
        "pivot-column"
      ) {
        const zRow =
          iteration.before_tableau.rows.at(
            -1,
          );

        const coefficient =
          zRow?.values[
            iteration
              .pivot_column_index
          ]?.fraction ?? "";

        setFeedback({
          correct: true,
          message:
            `Correto! ${mathToken(
              iteration.entering_variable,
            )} entra na base porque possui o coeficiente mais negativo da linha $Z$ (` +
            `$${fractionToLatex(
              coefficient,
            )}$).`,
        });
      } else {
        setFeedback({
          correct: true,
          message: `Correto! ${mathToken(
            iteration.leaving_variable,
          )} sai da base porque sua linha possui a menor razão não negativa.`,
        });
      }
    } else {
      setFeedback({
        correct: false,
        message:
          validation.message,
      });
    }
  }

  function next() {
    if (
      index <
        steps.length - 1 &&
      isCompleted
    ) {
      setIndex(
        (value) => value + 1,
      );
    }
  }

  function previous() {
    if (index > 0) {
      setIndex(
        (value) => value - 1,
      );
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-black/45">
            {problem
              ? problem.title
              : "Problema personalizado"}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            Resolução guiada
          </h1>
        </div>

        <div className="w-full md:max-w-sm">
          <ProgressBar
            current={index + 1}
            total={steps.length}
          />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
            Mapa da resolução
          </p>

          <ol className="mt-4 space-y-2 text-sm">
            {steps.map(
              (item, i) => {
                const canVisit =
                  i <= index ||
                  completed.has(i);

                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={
                        !canVisit
                      }
                      onClick={() =>
                        canVisit &&
                        setIndex(i)
                      }
                      className={`w-full rounded-lg px-3 py-2 text-left transition ${
                        canVisit
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      } ${
                        i === index
                          ? "bg-black text-white"
                          : i < index
                            ? "text-black hover:bg-black/[0.04]"
                            : "text-black/35"
                      }`}
                    >
                      {i < index
                        ? "✓"
                        : i ===
                            index
                          ? "→"
                          : "○"}{" "}
                      {stepLabel(
                        item,
                      )}
                    </button>
                  </li>
                );
              },
            )}
          </ol>
        </aside>

        <div className="min-w-0">
          <CurrentStep
            step={step}
            result={result}
            selected={selected}
            setSelected={
              setSelected
            }
            feedback={feedback}
            confirmChoice={
              confirmChoice
            }
            stepKey={`${index}-${step.kind}`}
          />

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
            <button
              type="button"
              className="btn-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              onClick={previous}
              disabled={index === 0}
            >
              Anterior
            </button>

            {index <
              steps.length - 1 && (
              <button
                type="button"
                className="btn-primary cursor-pointer disabled:cursor-not-allowed"
                onClick={next}
                disabled={
                  !isCompleted
                }
              >
                {interactive &&
                !isCompleted
                  ? "Confirme a resposta para avançar"
                  : "Próxima etapa"}
              </button>
            )}

            <button
              type="button"
              className="ml-auto cursor-pointer text-sm font-semibold underline"
              onClick={onEdit}
            >
              Editar problema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function stepLabel(
  step: LessonStep,
) {
  const names: Record<
    LessonStep["kind"],
    string
  > = {
    intro: "Modelagem",
    standard: "Forma padrão",
    initial: "Tabela inicial",
    "pivot-column":
      "Coluna pivô",
    "pivot-row": "Linha pivô",
    operations: "Pivoteamento",
    "new-table": "Nova tabela",
    result: "Resultado",
    graph: "Gráfico",
  };

  const iterativeStep =
    step.kind.includes(
      "pivot",
    ) ||
    step.kind ===
      "operations" ||
    step.kind ===
      "new-table";

  if (!iterativeStep) {
    return names[step.kind];
  }

  return `${
    names[step.kind]
  } · it. ${
    "iteration" in step
      ? step.iteration + 1
      : ""
  }`;
}

function CurrentStep({
  step,
  result,
  selected,
  setSelected,
  feedback,
  confirmChoice,
  stepKey,
}: {
  step: LessonStep;
  result: SimplexResult;
  selected: string | null;
  setSelected:
    (value: string) => void;
  feedback: {
    correct: boolean;
    message: string;
  } | null;
  confirmChoice: () => void;
  stepKey: string;
}) {
  if (step.kind === "intro") {
    return (
      <StepCard
        eyebrow="1. O que aconteceu?"
        title="Do problema para o modelo matemático"
      >
        <p>
          <MathText>
            {
              "O Simplex começa identificando as variáveis de decisão, a função objetivo e os limites de recurso. Neste MVP, $x_{1}$ e $x_{2}$ são não negativas e queremos maximizar $Z$."
            }
          </MathText>
        </p>

        <MathBlock
          math={expressionToLatex(
            result.standard_form
              .objective,
          )}
          dark
        />

        <p className="mt-5">
          Próximo passo:
          converter as
          desigualdades em
          equações para montar a
          tabela.
        </p>
      </StepCard>
    );
  }

  if (
    step.kind === "standard"
  ) {
    const equationsLatex =
      String.raw`\begin{gathered}${result.standard_form.equations
        .map((equation) =>
          expressionToLatex(
            equation,
          ),
        )
        .join(
          String.raw` \\[10pt] `,
        )}\end{gathered}`;

    const slackVariables =
      result.standard_form.slack_variables
        .map((variable) =>
          mathToken(variable),
        )
        .join(", ");

    return (
      <StepCard
        eyebrow="2. Por que aconteceu?"
        title="Incluímos variáveis de folga"
      >
        <p>
          <MathText>
            {`As variáveis de folga ${slackVariables} transformam cada restrição do tipo $\\leq$ em uma igualdade e representam a parcela de recurso que não foi utilizada.`}
          </MathText>
        </p>

        <MathBlock
          math={
            equationsLatex
          }
        />

        <p className="mt-5">
          Agora todas as
          restrições estão em
          forma de igualdade e
          podem entrar na tabela
          inicial.
        </p>
      </StepCard>
    );
  }

  if (
    step.kind === "initial"
  ) {
    return (
      <StepCard
        eyebrow="3. Qual conta foi realizada?"
        title="Montamos a tabela inicial"
      >
        <p className="mb-5">
          <MathText>
            {
              "Os coeficientes de cada equação ocupam suas respectivas colunas. As variáveis de folga começam formando a base e a última linha representa a função objetivo $Z$."
            }
          </MathText>
        </p>

        <SimplexTable
          tableau={
            result.initial_tableau
          }
        />

        <p className="mt-5">
          <MathText>
            {
              "O próximo passo é observar a linha $Z$ para escolher qual variável pode melhorar o valor da função objetivo."
            }
          </MathText>
        </p>
      </StepCard>
    );
  }

  if (
    step.kind ===
    "pivot-column"
  ) {
    const iteration =
      result.iterations[
        step.iteration
      ];

    const options =
      iteration.before_tableau.headers.filter(
        (header) =>
          header !== "RHS",
      );

    return (
      <StepCard
        eyebrow={`Iteração ${
          step.iteration + 1
        }`}
        title="Qual variável deve entrar na base?"
      >
        <p className="mb-5">
          <MathText>
            {
              "Na convenção usada aqui, observamos a linha $Z$ e procuramos o coeficiente mais negativo. A variável associada a esse coeficiente entra na base."
            }
          </MathText>
        </p>

        <SimplexTable
          tableau={
            iteration.before_tableau
          }
          pivotColumn={
            feedback?.correct
              ? iteration
                  .pivot_column_index
              : undefined
          }
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {options.map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSelected(
                    option,
                  )
                }
                className={`cursor-pointer rounded-lg border px-4 py-2 font-semibold transition ${
                  selected ===
                  option
                    ? "border-black bg-black text-white"
                    : "border-black/20 hover:bg-black/[0.04]"
                }`}
              >
                <InlineFormula
                  math={symbolToLatex(
                    option,
                  )}
                />
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="btn-primary mt-4 cursor-pointer disabled:cursor-not-allowed"
          onClick={
            confirmChoice
          }
          disabled={!selected}
        >
          Confirmar
        </button>

        {feedback && (
          <div
            className={`mt-4 border-l-4 p-4 text-sm ${
              feedback.correct
                ? "border-[#80FFF6] bg-[#F7F7F7]"
                : "border-red-600 bg-red-50"
            }`}
            role="status"
          >
            <MathText>
              {
                feedback.message
              }
            </MathText>
          </div>
        )}

        <div className="mt-5">
          <HintBox
            hints={columnHints}
            resetKey={stepKey}
          />
        </div>
      </StepCard>
    );
  }

  if (
    step.kind ===
    "pivot-row"
  ) {
    const iteration =
      result.iterations[
        step.iteration
      ];

    return (
      <StepCard
        eyebrow={`Iteração ${
          step.iteration + 1
        }`}
        title="Qual linha deve sair da base?"
      >
        <p>
          <MathText>
            {
              "Agora aplicamos o teste da razão. Para cada coeficiente positivo da coluna pivô, calculamos $\\dfrac{\\mathrm{RHS}}{\\text{coeficiente da coluna pivô}}$. A menor razão não negativa define a variável que sai da base."
            }
          </MathText>
        </p>

        <div className="mt-5 grid gap-3">
          {iteration.ratios.map(
            (ratio) => (
              <div
                key={
                  ratio.row
                }
                className="flex flex-col justify-between gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center"
              >
                <span className="font-semibold">
                  Linha de{" "}
                  <InlineFormula
                    math={symbolToLatex(
                      ratio.basis,
                    )}
                  />
                </span>

                {ratio.eligible && ratio.ratio ? (
                  <div className="rounded-md px-2 py-2 text-lg leading-none text-black/75">
                    <InlineFormula
                      math={`\\displaystyle ${divisionToLatex(
                        ratio.rhs.fraction,
                        ratio.coefficient.fraction,
                        ratio.ratio.fraction,
                      )}`}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-black/55">
                    Razão não
                    calculada: o
                    coeficiente
                    deve ser
                    positivo.
                  </span>
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {iteration.ratios.map(
            (ratio) => (
              <button
                key={
                  ratio.basis
                }
                type="button"
                onClick={() =>
                  setSelected(
                    ratio.basis,
                  )
                }
                className={`cursor-pointer rounded-lg border px-4 py-2 font-semibold transition ${
                  selected ===
                  ratio.basis
                    ? "border-black bg-black text-white"
                    : "border-black/20 hover:bg-black/[0.04]"
                }`}
              >
                Linha{" "}
                <InlineFormula
                  math={symbolToLatex(
                    ratio.basis,
                  )}
                />
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="btn-primary mt-4 cursor-pointer disabled:cursor-not-allowed"
          onClick={
            confirmChoice
          }
          disabled={!selected}
        >
          Confirmar
        </button>

        {feedback && (
          <div
            className={`mt-4 border-l-4 p-4 text-sm ${
              feedback.correct
                ? "border-[#80FFF6] bg-[#F7F7F7]"
                : "border-red-600 bg-red-50"
            }`}
            role="status"
          >
            <MathText>
              {
                feedback.message
              }
            </MathText>
          </div>
        )}

        <div className="mt-5">
          <HintBox
            hints={rowHints}
            resetKey={stepKey}
          />
        </div>
      </StepCard>
    );
  }

  if (
    step.kind ===
    "operations"
  ) {
    const iteration =
      result.iterations[
        step.iteration
      ];

    const operationsLatex =
      String.raw`\begin{gathered}${iteration.operations
        .map((operation) =>
          operationToLatex(
            operation.expression,
          ),
        )
        .join(
          String.raw` \\[10pt] `,
        )}\end{gathered}`;

    return (
      <StepCard
        eyebrow={`Iteração ${
          step.iteration + 1
        }`}
        title="Pivoteamento: normalizar e zerar a coluna"
      >
        <p className="leading-8">
          O elemento pivô é{" "}
          <InlineFormula
            math={fractionToLatex(
              iteration.pivot.fraction,
              true,
            )}
            className="mx-1 inline-flex items-center text-[1.05em]"
          />
          , localizado no encontro da coluna de{" "}
          <InlineFormula
            math={symbolToLatex(
              iteration.entering_variable,
            )}
          />{" "}
          com a linha de{" "}
          <InlineFormula
            math={symbolToLatex(
              iteration.leaving_variable,
            )}
          />
          .
        </p>

        <div className="mt-5">
          <SimplexTable
            tableau={
              iteration.before_tableau
            }
            pivotColumn={
              iteration
                .pivot_column_index
            }
            pivotRow={
              iteration
                .pivot_row_index
            }
          />
        </div>

        <MathBlock
          math={
            operationsLatex
          }
        />

        <p className="mt-5">
          Primeiro dividimos a
          linha pivô pelo próprio
          elemento pivô,
          fazendo-o valer 1.
          Depois usamos essa nova
          linha para transformar
          os demais valores da
          coluna pivô em zero.
        </p>
      </StepCard>
    );
  }

  if (
    step.kind ===
    "new-table"
  ) {
    const iteration =
      result.iterations[
        step.iteration
      ];

    return (
      <StepCard
        eyebrow={`Iteração ${
          step.iteration + 1
        }`}
        title="Esta é a nova tabela"
      >
        <p className="mb-5">
          A base foi atualizada:{" "}
          <InlineFormula
            math={symbolToLatex(
              iteration
                .entering_variable,
            )}
            className="font-semibold"
          />{" "}
          entrou e{" "}
          <InlineFormula
            math={symbolToLatex(
              iteration
                .leaving_variable,
            )}
            className="font-semibold"
          />{" "}
          saiu.
        </p>

        <SimplexTable
          tableau={
            iteration.after_tableau
          }
        />

        <p className="mt-5">
          <MathText>
            {
              "Verificamos novamente a linha $Z$. Se ainda houver um coeficiente negativo que possa melhorar a solução, iniciamos outra iteração."
            }
          </MathText>
        </p>
      </StepCard>
    );
  }

  if (
    step.kind === "result"
  ) {
    const solution =
      result.optimal_solution;

    const solutionValues = [
      {
        label: "x1",
        value: solution.x1,
      },
      {
        label: "x2",
        value: solution.x2,
      },
      {
        label: "Z",
        value: solution.z,
      },
    ];

    return (
      <StepCard
        eyebrow="Solução ótima"
        title="O teste de otimalidade foi satisfeito"
      >
        <p>
          <MathText>
            {
              "Não há mais um coeficiente na linha $Z$ que permita melhorar a função objetivo dentro da regra desta formulação. Lemos então os valores das variáveis na tabela final."
            }
          </MathText>
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {solutionValues.map(
            ({
              label,
              value,
            }) => (
              <div
                key={label}
                className="border-t-2 border-black pt-4"
              >
                <p className="text-sm text-black/45">
                  <InlineFormula
                    math={symbolToLatex(
                      label,
                    )}
                  />
                </p>

                <div className="mt-1 text-3xl font-bold">
                  <InlineFormula
                    math={fractionToLatex(
                      value.fraction,
                      true,
                    )}
                  />
                </div>

                {value.fraction !==
                  String(
                    value.decimal,
                  ) && (
                  <p className="mt-1 text-sm text-black/45">
                    <InlineFormula
                      math={`\\approx ${value.decimal}`}
                    />
                  </p>
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-8">
          <SimplexTable
            tableau={
              result.final_tableau
            }
          />
        </div>

        <p className="mt-5">
          <MathText>
            {`Foram necessárias ${
              solution.iterations
            } iteração(ões). No contexto do problema, a combinação $x_{1} = ${fractionToLatex(
              solution.x1
                .fraction,
            )}$ e $x_{2} = ${fractionToLatex(
              solution.x2
                .fraction,
            )}$ maximiza o resultado em $Z = ${fractionToLatex(
              solution.z
                .fraction,
            )}$.`}
          </MathText>
        </p>
      </StepCard>
    );
  }

  return (
    <StepCard
      eyebrow="Visualização 2D"
      title="A solução também aparece geometricamente"
    >
      <p className="mb-5 leading-7 text-black/70">
        <MathText>
          {
            "As retas representam os limites impostos pelas restrições. A área destacada corresponde à região viável, isto é, ao conjunto de combinações de $x_{1}$ e $x_{2}$ que respeitam simultaneamente todas as restrições do problema. Os vértices dessa região são os principais pontos candidatos à solução ótima, e o ponto destacado mostra a solução encontrada pelo método Simplex."
          }
        </MathText>
      </p>

      <Graph2D
        graph={result.graph_data}
        optimalValue={
          result.optimal_solution.z.fraction
        }
      />
    </StepCard>
  );
}

export default function ResolverPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          Carregando
          resolvedor...
        </div>
      }
    >
      <ResolverContent />
    </Suspense>
  );
}
