export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total ? Math.round((current / total) * 100) : 0;
  return (
    <div aria-label={`Etapa ${current} de ${total}`}>
      <div className="mb-2 flex justify-between text-sm text-black/60">
        <span>Etapa {current} de {total}</span><span>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-[#80FFF6] transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
