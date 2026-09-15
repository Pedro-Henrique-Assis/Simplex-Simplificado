import type { Tableau } from "@/types/simplex";

export default function SimplexTable({ tableau, pivotColumn, pivotRow }: { tableau: Tableau; pivotColumn?: number; pivotRow?: number }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-black/15">
      <table className="w-full min-w-[560px] border-collapse text-center text-sm">
        <thead className="bg-black text-white">
          <tr><th className="px-3 py-3 text-left">Base</th>{tableau.headers.map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr>
        </thead>
        <tbody>
          {tableau.rows.map((row, rowIndex) => (
            <tr key={`${row.label}-${rowIndex}`} className="border-t border-black/10">
              <th className={`px-3 py-3 text-left ${pivotRow === rowIndex ? "bg-[#80FFF6]/45" : "bg-black/[0.03]"}`}>{row.label}</th>
              {row.values.map((value, colIndex) => {
                const isPivot = pivotRow === rowIndex && pivotColumn === colIndex;
                const highlighted = pivotRow === rowIndex || pivotColumn === colIndex;
                return <td key={colIndex} className={`px-3 py-3 math ${isPivot ? "bg-[#80FFF6] font-bold ring-2 ring-inset ring-black" : highlighted ? "bg-[#80FFF6]/20" : ""}`} title={`≈ ${value.decimal}`}>{value.fraction}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
