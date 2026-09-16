"use client";
import { useEffect, useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import { getProblems } from "@/services/api";
import type { Difficulty, Problem } from "@/types/simplex";

const filters: Array<[string, Difficulty | ""]> = [["Todos", ""], ["Fácil", "easy"], ["Intermediário", "intermediate"], ["Difícil", "hard"]];

export default function ProblemsPage() {
  const [filter, setFilter] = useState<Difficulty | "">("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    setState("loading");
    getProblems(filter || undefined).then((data) => { setProblems(data); setState("ready"); }).catch(() => setState("error"));
  }, [filter]);
  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-black/45">Biblioteca</p><h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Problemas para praticar</h1><p className="mt-4 max-w-2xl text-black/65">Escolha um contexto e avance pelo mesmo fluxo guiado usado nos problemas manuais.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por dificuldade">{filters.map(([label, value]) => <button key={label} onClick={() => setFilter(value)} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${filter === value ? "border-black bg-black text-white" : "border-black/20 hover:bg-black/[0.04]"}`}>{label}</button>)}</div>
      </div>
      <div className="mt-10 grid gap-x-10 lg:grid-cols-2">
        {state === "loading" && <p className="py-10 text-black/55">Carregando problemas...</p>}
        {state === "error" && <div className="py-10"><h2 className="font-bold">Não foi possível acessar a biblioteca.</h2><p className="mt-2 text-black/60">Verifique se o backend FastAPI está executando em http://localhost:8000.</p></div>}
        {state === "ready" && problems.length === 0 && <p className="py-10 text-black/55">Nenhum problema encontrado para este filtro.</p>}
        {problems.map((problem) => <ProblemCard key={problem.id} problem={problem} />)}
      </div>
    </div>
  );
}
