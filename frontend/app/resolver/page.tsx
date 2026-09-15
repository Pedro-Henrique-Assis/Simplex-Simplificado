"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Graph2D from "@/components/Graph2D";
import HintBox from "@/components/HintBox";
import ProgressBar from "@/components/ProgressBar";
import SimplexTable from "@/components/SimplexTable";
import StepCard from "@/components/StepCard";
import { getProblem, solveSimplex, validateStep } from "@/services/api";
import type { ConstraintInput, Problem, SimplexPayload, SimplexResult } from "@/types/simplex";

type FormConstraint = { x1: string; x2: string; result: string };
type LessonStep =
  | { kind: "intro" }
  | { kind: "standard" }
  | { kind: "initial" }
  | { kind: "pivot-column"; iteration: number }
  | { kind: "pivot-row"; iteration: number }
  | { kind: "operations"; iteration: number }
  | { kind: "new-table"; iteration: number }
  | { kind: "result" }
  | { kind: "graph" };

const blankConstraint = (): FormConstraint => ({ x1: "", x2: "", result: "" });
const columnHints = [
  "Observe os coeficientes da linha Z.",
  "Na maximização, procure o coeficiente mais negativo.",
  "A variável associada a esse coeficiente entra na base.",
];
const rowHints = [
  "Divida o RHS pelo coeficiente positivo da coluna pivô.",
  "Ignore linhas cujo coeficiente na coluna pivô seja zero ou negativo.",
  "A menor razão não negativa define a linha que sai da base.",
];

function ResolverContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("problem");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [objective, setObjective] = useState({ x1: "", x2: "" });
  const [constraints, setConstraints] = useState<FormConstraint[]>([blankConstraint(), blankConstraint()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimplexResult | null>(null);

  useEffect(() => {
    if (!problemId) return;
    setLoading(true);
    getProblem(Number(problemId))
      .then((item) => {
        setProblem(item);
        setObjective({ x1: String(item.x1_coefficient), x2: String(item.x2_coefficient) });
        const loaded: FormConstraint[] = [
          { x1: String(item.constraint_1_x1), x2: String(item.constraint_1_x2), result: String(item.constraint_1_result) },
          { x1: String(item.constraint_2_x1), x2: String(item.constraint_2_x2), result: String(item.constraint_2_result) },
        ];
        if (item.constraint_3_result != null && item.constraint_3_x1 != null && item.constraint_3_x2 != null) {
          loaded.push({ x1: String(item.constraint_3_x1), x2: String(item.constraint_3_x2), result: String(item.constraint_3_result) });
        }
        setConstraints(loaded);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [problemId]);

  function updateConstraint(index: number, field: keyof FormConstraint, value: string) {
    setConstraints((current) => current.map((constraint, i) => i === index ? { ...constraint, [field]: value } : constraint));
  }

  function buildPayload(): SimplexPayload | null {
    setError("");
    if (objective.x1.trim() === "" || objective.x2.trim() === "") {
      setError("Informe os dois coeficientes da função objetivo."); return null;
    }
    const objectiveNumbers = { x1: Number(objective.x1), x2: Number(objective.x2) };
    if (!Number.isFinite(objectiveNumbers.x1) || !Number.isFinite(objectiveNumbers.x2) || (objectiveNumbers.x1 <= 0 && objectiveNumbers.x2 <= 0)) {
      setError("A função objetivo precisa ter pelo menos um coeficiente positivo."); return null;
    }
    const parsed: ConstraintInput[] = [];
    for (let i = 0; i < constraints.length; i++) {
      const constraint = constraints[i];
      if ([constraint.x1, constraint.x2, constraint.result].some((value) => value.trim() === "")) {
        setError(`Preencha todos os campos da ${i + 1}ª restrição.`); return null;
      }
      const x1 = Number(constraint.x1), x2 = Number(constraint.x2), resultValue = Number(constraint.result);
      if (![x1, x2, resultValue].every(Number.isFinite)) {
        setError(`Use apenas valores numéricos na ${i + 1}ª restrição.`); return null;
      }
      if (x1 < 0 || x2 < 0 || (x1 === 0 && x2 === 0) || resultValue <= 0) {
        setError(`Revise a ${i + 1}ª restrição: coeficientes devem ser não negativos e o limite deve ser positivo.`); return null;
      }
      parsed.push({ x1, x2, operator: "<=", result: resultValue });
    }
    return { objective: objectiveNumbers, constraints: parsed };
  }

  async function startResolution() {
    const payload = buildPayload();
    if (!payload) return;
    setLoading(true); setResult(null);
    try { setResult(await solveSimplex(payload)); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível resolver o problema."); }
    finally { setLoading(false); }
  }

  if (result) {
    return <GuidedResolution result={result} problem={problem} onEdit={() => setResult(null)} />;
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-black/45">Resolver</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Monte o problema sem escrever fórmulas.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-black/65">Preencha apenas os coeficientes. O SimplexLab transforma a modelagem em uma resolução guiada.</p>
          {problem && <div className="mt-8 border-l-4 border-[#80FFF6] bg-[#F7F7F7] p-5"><p className="text-xs font-bold uppercase tracking-wide text-black/45">Problema da biblioteca</p><h2 className="mt-1 text-xl font-bold">{problem.title}</h2><p className="mt-2 text-sm leading-6 text-black/65">{problem.description}</p></div>}

          <div className="mt-10 space-y-9">
            <fieldset>
              <legend className="mb-4 text-lg font-bold">Função objetivo</legend>
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-black p-5 text-white">
                <span className="font-semibold">Max Z =</span>
                <label><span className="sr-only">Coeficiente de x1</span><input className="w-24 rounded-lg bg-white px-3 py-2 text-black" type="number" step="any" value={objective.x1} onChange={(e) => setObjective((v) => ({ ...v, x1: e.target.value }))} aria-label="Coeficiente de x1 na função objetivo" /></label><span>x1 +</span>
                <label><span className="sr-only">Coeficiente de x2</span><input className="w-24 rounded-lg bg-white px-3 py-2 text-black" type="number" step="any" value={objective.x2} onChange={(e) => setObjective((v) => ({ ...v, x2: e.target.value }))} aria-label="Coeficiente de x2 na função objetivo" /></label><span>x2</span>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-lg font-bold">Restrições</legend>
              <div className="space-y-3">
                {constraints.map((constraint, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4">
                    <span className="w-20 text-sm font-semibold text-black/55">Restrição {index + 1}</span>
                    <input className="field !w-24" type="number" step="any" min="0" value={constraint.x1} onChange={(e) => updateConstraint(index, "x1", e.target.value)} aria-label={`Coeficiente de x1 na restrição ${index + 1}`} /><span>x1 +</span>
                    <input className="field !w-24" type="number" step="any" min="0" value={constraint.x2} onChange={(e) => updateConstraint(index, "x2", e.target.value)} aria-label={`Coeficiente de x2 na restrição ${index + 1}`} /><span>x2 ≤</span>
                    <input className="field !w-28" type="number" step="any" min="0" value={constraint.result} onChange={(e) => updateConstraint(index, "result", e.target.value)} aria-label={`Resultado da restrição ${index + 1}`} />
                    {constraints.length === 3 && index === 2 && <button className="ml-auto text-sm font-semibold underline" onClick={() => setConstraints((v) => v.slice(0, 2))}>Remover</button>}
                  </div>
                ))}
              </div>
              {constraints.length < 3 && <button className="mt-4 text-sm font-semibold underline decoration-[#80FFF6] decoration-4 underline-offset-4" onClick={() => setConstraints((v) => [...v, blankConstraint()])}>+ Adicionar terceira restrição</button>}
            </fieldset>
          </div>

          {error && <div className="mt-6 border-l-4 border-red-600 bg-red-50 p-4 text-sm" role="alert"><strong>Revise antes de continuar:</strong> {error}</div>}
          <button className="btn-primary mt-8" onClick={startResolution} disabled={loading}>{loading ? "Preparando resolução..." : "Iniciar resolução guiada"}</button>
        </section>

        <aside className="h-fit border-t-2 border-black pt-5 lg:sticky lg:top-24">
          <h2 className="font-bold">Limites deste MVP</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-black/65"><li>• Maximização</li><li>• Duas variáveis: x1 e x2</li><li>• Duas ou três restrições</li><li>• Restrições do tipo ≤</li><li>• x1 e x2 ≥ 0</li></ul>
          <p className="mt-6 text-sm text-black/55">O foco é aprender o Simplex clássico com variáveis de folga, sem Big M ou método das duas fases.</p>
        </aside>
      </div>
    </div>
  );
}

function GuidedResolution({ result, problem, onEdit }: { result: SimplexResult; problem: Problem | null; onEdit: () => void }) {
  const steps = useMemo<LessonStep[]>(() => {
    const list: LessonStep[] = [{ kind: "intro" }, { kind: "standard" }, { kind: "initial" }];
    result.iterations.forEach((_, iteration) => list.push(
      { kind: "pivot-column", iteration },
      { kind: "pivot-row", iteration },
      { kind: "operations", iteration },
      { kind: "new-table", iteration },
    ));
    list.push({ kind: "result" }, { kind: "graph" });
    return list;
  }, [result]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const step = steps[index];

  useEffect(() => { setSelected(null); setFeedback(null); }, [index]);

  const interactive = step.kind === "pivot-column" || step.kind === "pivot-row";
  const isCompleted = !interactive || completed.has(index);

  async function confirmChoice() {
    if (!selected || !interactive) return;
    const iteration = result.iterations[step.iteration];
    const expected = step.kind === "pivot-column" ? iteration.entering_variable : iteration.leaving_variable;
    const validation = await validateStep(step.kind === "pivot-column" ? "choose_pivot_column" : "choose_pivot_row", selected, expected);
    if (validation.correct) {
      setCompleted((current) => new Set(current).add(index));
      const explanation = step.kind === "pivot-column" ? iteration.explanations.pivot_column : iteration.explanations.pivot_row;
      setFeedback({ correct: true, message: `Correto! ${explanation}` });
    } else {
      setFeedback({ correct: false, message: validation.message });
    }
  }

  function next() { if (index < steps.length - 1 && isCompleted) setIndex((value) => value + 1); }
  function previous() { if (index > 0) setIndex((value) => value - 1); }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end">
        <div><p className="text-sm text-black/45">{problem ? problem.title : "Problema personalizado"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Resolução guiada</h1></div>
        <div className="w-full md:max-w-sm"><ProgressBar current={index + 1} total={steps.length} /></div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">Mapa da resolução</p>
          <ol className="mt-4 space-y-2 text-sm">
            {steps.map((item, i) => <li key={i}><button onClick={() => i <= index || completed.has(i) ? setIndex(i) : undefined} className={`w-full rounded-lg px-3 py-2 text-left ${i === index ? "bg-black text-white" : i < index ? "text-black" : "text-black/35"}`}>{i < index ? "✓" : i === index ? "→" : "○"} {stepLabel(item)}</button></li>)}
          </ol>
        </aside>

        <div className="min-w-0">
          <CurrentStep step={step} result={result} selected={selected} setSelected={setSelected} feedback={feedback} confirmChoice={confirmChoice} stepKey={`${index}-${step.kind}`} />
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
            <button className="btn-secondary" onClick={previous} disabled={index === 0}>Anterior</button>
            {index < steps.length - 1 && <button className="btn-primary" onClick={next} disabled={!isCompleted}>{interactive && !isCompleted ? "Confirme a resposta para avançar" : "Próxima etapa"}</button>}
            <button className="ml-auto text-sm font-semibold underline" onClick={onEdit}>Editar problema</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function stepLabel(step: LessonStep) {
  const names: Record<LessonStep["kind"], string> = {
    intro: "Modelagem", standard: "Forma padrão", initial: "Tabela inicial", "pivot-column": "Coluna pivô",
    "pivot-row": "Linha pivô", operations: "Pivoteamento", "new-table": "Nova tabela", result: "Resultado", graph: "Gráfico",
  };
  return step.kind.includes("pivot") || step.kind === "operations" || step.kind === "new-table" ? `${names[step.kind]} · it. ${"iteration" in step ? step.iteration + 1 : ""}` : names[step.kind];
}

function CurrentStep({ step, result, selected, setSelected, feedback, confirmChoice, stepKey }: {
  step: LessonStep; result: SimplexResult; selected: string | null; setSelected: (value: string) => void;
  feedback: { correct: boolean; message: string } | null; confirmChoice: () => void; stepKey: string;
}) {
  if (step.kind === "intro") return <StepCard eyebrow="1. O que aconteceu?" title="Do problema para o modelo matemático"><p>O Simplex começa identificando as <strong>variáveis de decisão</strong>, a <strong>função objetivo</strong> e os limites de recurso. Neste MVP, x1 e x2 são não negativas e queremos maximizar Z.</p><div className="math mt-6 bg-black p-5 text-lg font-semibold text-white">{result.standard_form.objective}</div><p className="mt-5">Próximo passo: converter as desigualdades em equações para montar a tabela.</p></StepCard>;
  if (step.kind === "standard") return <StepCard eyebrow="2. Por que aconteceu?" title="Incluímos variáveis de folga"><p>{result.standard_form.explanation}</p><div className="math mt-6 space-y-2 border-l-4 border-[#80FFF6] bg-[#F7F7F7] p-5">{result.standard_form.equations.map((equation) => <p key={equation} className="font-semibold">{equation}</p>)}</div><p className="mt-5">Agora todas as restrições estão em forma de igualdade e podem entrar na tabela inicial.</p></StepCard>;
  if (step.kind === "initial") return <StepCard eyebrow="3. Qual conta foi realizada?" title="Montamos a tabela inicial"><p className="mb-5">Os coeficientes de cada equação ocupam suas colunas. As variáveis de folga começam formando a base.</p><SimplexTable tableau={result.initial_tableau} /><p className="mt-5">O próximo passo é observar a linha Z para escolher qual variável pode melhorar o valor da função objetivo.</p></StepCard>;

  if (step.kind === "pivot-column") {
    const iteration = result.iterations[step.iteration];
    const options = iteration.before_tableau.headers.filter((header) => header !== "RHS");
    return <StepCard eyebrow={`Iteração ${step.iteration + 1}`} title="Qual variável deve entrar na base?"><p className="mb-5">Na convenção usada aqui, procure o coeficiente mais negativo da linha Z.</p><SimplexTable tableau={iteration.before_tableau} pivotColumn={feedback?.correct ? iteration.pivot_column_index : undefined} />
      <div className="mt-6 flex flex-wrap gap-2">{options.map((option) => <button key={option} onClick={() => setSelected(option)} className={`rounded-lg border px-4 py-2 font-semibold ${selected === option ? "border-black bg-black text-white" : "border-black/20"}`}>{option}</button>)}</div>
      <button className="btn-primary mt-4" onClick={confirmChoice} disabled={!selected}>Confirmar</button>
      {feedback && <div className={`mt-4 border-l-4 p-4 text-sm ${feedback.correct ? "border-[#80FFF6] bg-[#F7F7F7]" : "border-red-600 bg-red-50"}`} role="status">{feedback.message}</div>}
      <div className="mt-5"><HintBox hints={columnHints} resetKey={stepKey} /></div>
    </StepCard>;
  }

  if (step.kind === "pivot-row") {
    const iteration = result.iterations[step.iteration];
    return <StepCard eyebrow={`Iteração ${step.iteration + 1}`} title="Qual linha deve sair da base?"><p>Agora aplicamos o <strong>teste da razão</strong>. A menor razão não negativa entre RHS e o coeficiente positivo da coluna pivô define a saída.</p>
      <div className="mt-5 grid gap-3">{iteration.ratios.map((ratio) => <div key={ratio.row} className="flex flex-col justify-between gap-2 border-b border-black/10 pb-3 sm:flex-row"><span className="font-semibold">Linha de {ratio.basis}</span><span className="math text-black/65">{ratio.calculation}</span></div>)}</div>
      <div className="mt-6 flex flex-wrap gap-2">{iteration.ratios.map((ratio) => <button key={ratio.basis} onClick={() => setSelected(ratio.basis)} className={`rounded-lg border px-4 py-2 font-semibold ${selected === ratio.basis ? "border-black bg-black text-white" : "border-black/20"}`}>Linha {ratio.basis}</button>)}</div>
      <button className="btn-primary mt-4" onClick={confirmChoice} disabled={!selected}>Confirmar</button>
      {feedback && <div className={`mt-4 border-l-4 p-4 text-sm ${feedback.correct ? "border-[#80FFF6] bg-[#F7F7F7]" : "border-red-600 bg-red-50"}`} role="status">{feedback.message}</div>}
      <div className="mt-5"><HintBox hints={rowHints} resetKey={stepKey} /></div>
    </StepCard>;
  }

  if (step.kind === "operations") {
    const iteration = result.iterations[step.iteration];
    return <StepCard eyebrow={`Iteração ${step.iteration + 1}`} title="Pivoteamento: normalizar e zerar a coluna"><p>{iteration.explanations.pivot}</p><div className="mt-5"><SimplexTable tableau={iteration.before_tableau} pivotColumn={iteration.pivot_column_index} pivotRow={iteration.pivot_row_index} /></div><div className="math mt-6 space-y-3">{iteration.operations.map((operation, i) => <div key={i} className="border-l-4 border-[#80FFF6] bg-[#F7F7F7] p-4"><strong>{operation.expression}</strong></div>)}</div><p className="mt-5">Primeiro fazemos o pivô valer 1. Depois usamos essa linha para transformar os demais valores da coluna pivô em zero.</p></StepCard>;
  }

  if (step.kind === "new-table") {
    const iteration = result.iterations[step.iteration];
    return <StepCard eyebrow={`Iteração ${step.iteration + 1}`} title="Esta é a nova tabela"><p className="mb-5">A base foi atualizada: <strong>{iteration.entering_variable}</strong> entrou e <strong>{iteration.leaving_variable}</strong> saiu.</p><SimplexTable tableau={iteration.after_tableau} /><p className="mt-5">Verificamos novamente a linha Z. Se ainda houver coeficiente negativo que possa melhorar a solução, iniciamos outra iteração.</p></StepCard>;
  }

  if (step.kind === "result") {
    const solution = result.optimal_solution;
    return <StepCard eyebrow="Solução ótima" title="O teste de otimalidade foi satisfeito"><p>Não há mais uma entrada que melhore Z dentro da regra desta formulação. Lemos então os valores das variáveis na tabela final.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["x1", solution.x1], ["x2", solution.x2], ["Z", solution.z]].map(([label, value]) => { const v = value as typeof solution.x1; return <div key={label as string} className="border-t-2 border-black pt-4"><p className="text-sm text-black/45">{label as string}</p><p className="math mt-1 text-3xl font-bold">{v.fraction}</p>{v.fraction !== String(v.decimal) && <p className="text-sm text-black/45">≈ {v.decimal}</p>}</div>; })}</div><div className="mt-8"><SimplexTable tableau={result.final_tableau} /></div><p className="mt-5">Foram necessárias <strong>{solution.iterations}</strong> iteração(ões). No contexto do problema, a combinação x1 = {solution.x1.fraction} e x2 = {solution.x2.fraction} maximiza o resultado em Z = {solution.z.fraction}.</p></StepCard>;
  }

  return <StepCard eyebrow="Visualização 2D" title="A solução também aparece geometricamente"><p className="mb-5">As retas representam as restrições; a área preenchida é a região viável. Seus vértices são pontos candidatos, e o ponto destacado corresponde à solução ótima encontrada pelo Simplex.</p><Graph2D graph={result.graph_data} /><div className="mt-7 grid gap-2 sm:grid-cols-2">{result.graph_data.vertices.map((vertex) => <p key={vertex.label} className="math border-b border-black/10 pb-2"><strong>{vertex.label}</strong> = ({vertex.x.fraction}, {vertex.y.fraction})</p>)}</div></StepCard>;
}

export default function ResolverPage() {
  return <Suspense fallback={<div className="container-page py-16">Carregando resolvedor...</div>}><ResolverContent /></Suspense>;
}
