"use client";

import dynamic from "next/dynamic";
import type { Data } from "plotly.js";
import type { SimplexResult } from "@/types/simplex";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Graph2D({ graph }: { graph: SimplexResult["graph_data"] }) {
  const axisMax = graph.axis_max;
  const polygonX = graph.vertices.map((v) => v.x.decimal);
  const polygonY = graph.vertices.map((v) => v.y.decimal);
  if (polygonX.length) { polygonX.push(polygonX[0]); polygonY.push(polygonY[0]); }

  const traces: Data[] = graph.constraints.map((constraint) => {
    const a = constraint.x1_coefficient.decimal;
    const b = constraint.x2_coefficient.decimal;
    const c = constraint.result.decimal;
    if (b === 0) {
      const x = c / a;
      return { x: [x, x], y: [0, axisMax], type: "scatter", mode: "lines", name: constraint.name, line: { width: 2 } };
    }
    return {
      x: [0, axisMax],
      y: [c / b, (c - a * axisMax) / b],
      type: "scatter", mode: "lines", name: constraint.name, line: { width: 2 },
    };
  });

  traces.push({
    x: polygonX, y: polygonY, type: "scatter", mode: "lines", fill: "toself",
    name: "Região viável", fillcolor: "rgba(128,255,246,0.24)", line: { color: "#000000", width: 1 },
  });
  traces.push({
    x: graph.vertices.map((v) => v.x.decimal), y: graph.vertices.map((v) => v.y.decimal),
    text: graph.vertices.map((v) => `${v.label} = (${v.x.fraction}, ${v.y.fraction})`),
    type: "scatter", mode: "markers+text", textposition: "top center", name: "Vértices",
    marker: { color: "#000000", size: 8 },
  });
  traces.push({
    x: [graph.optimal_point.x.decimal], y: [graph.optimal_point.y.decimal],
    text: [`Ótimo (${graph.optimal_point.x.fraction}, ${graph.optimal_point.y.fraction})`],
    type: "scatter", mode: "markers+text", textposition: "bottom center", name: "Solução ótima",
    marker: { color: "#80FFF6", size: 15, line: { color: "#000000", width: 2 } },
  });

  return (
    <div className="w-full overflow-hidden rounded-lg border border-black/15 bg-white">
      <Plot
        data={traces}
        layout={{
          autosize: true, height: 520, margin: { l: 55, r: 20, t: 30, b: 55 },
          xaxis: { title: { text: "x1" }, range: [0, axisMax], gridcolor: "#EFEFEF", zerolinecolor: "#000000" },
          yaxis: { title: { text: "x2" }, range: [0, axisMax], gridcolor: "#EFEFEF", zerolinecolor: "#000000" },
          legend: { orientation: "h", y: -0.18 }, paper_bgcolor: "#FFFFFF", plot_bgcolor: "#FFFFFF",
          font: { color: "#000000" },
        }}
        config={{ responsive: true, displaylogo: false, scrollZoom: false }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
