import Link from "next/link";
import type { Problem } from "@/types/simplex";

const labels = { easy: "Fácil", intermediate: "Intermediário", hard: "Difícil" };

export default function ProblemCard({ problem }: { problem: Problem }) {
  const restrictions = problem.constraint_3_result == null ? 2 : 3;
  return (
    <article className="flex h-full flex-col justify-between border-t border-black/20 py-5">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black/55">
          <span>{labels[problem.difficulty]}</span><span>•</span><span>Disponível</span><span>•</span><span>2 variáveis</span><span>•</span><span>{restrictions} restrições</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">{problem.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">{problem.description}</p>
      </div>
      <Link href={`/resolver?problem=${problem.id}`} className="btn-secondary mt-5 w-fit">Resolver</Link>
    </article>
  );
}
