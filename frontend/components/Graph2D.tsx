"use client";

import dynamic from "next/dynamic";
import type { Data } from "plotly.js";

import {
  InlineFormula,
} from "@/components/MathNotation";

import type {
  SimplexResult,
} from "@/types/simplex";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  },
);

export default function Graph2D({
  graph,
}: {
  graph: SimplexResult["graph_data"];
}) {
  const axisMax = graph.axis_max;

  const polygonX = graph.vertices.map(
    (vertex) => vertex.x.decimal,
  );

  const polygonY = graph.vertices.map(
    (vertex) => vertex.y.decimal,
  );

  if (polygonX.length) {
    polygonX.push(polygonX[0]);
    polygonY.push(polygonY[0]);
  }

  const traces: Data[] =
    graph.constraints.map(
      (constraint) => {
        const a =
          constraint.x1_coefficient.decimal;

        const b =
          constraint.x2_coefficient.decimal;

        const c =
          constraint.result.decimal;

        if (b === 0) {
          const x = c / a;

          return {
            x: [x, x],
            y: [0, axisMax],
            type: "scatter",
            mode: "lines",
            name: constraint.name,
            line: {
              width: 2,
            },
          };
        }

        return {
          x: [0, axisMax],
          y: [
            c / b,
            (c - a * axisMax) / b,
          ],
          type: "scatter",
          mode: "lines",
          name: constraint.name,
          line: {
            width: 2,
          },
        };
      },
    );

  traces.push({
    x: polygonX,
    y: polygonY,
    type: "scatter",
    mode: "lines",
    fill: "toself",
    name: "Região viável",
    fillcolor:
      "rgba(128,255,246,0.24)",
    line: {
      color: "#000000",
      width: 1,
    },
    hoverinfo: "skip",
  });

  traces.push({
    x: graph.vertices.map(
      (vertex) => vertex.x.decimal,
    ),
    y: graph.vertices.map(
      (vertex) => vertex.y.decimal,
    ),
    text: graph.vertices.map(
      (vertex) =>
        `${vertex.label} = (${vertex.x.fraction}, ${vertex.y.fraction})`,
    ),
    type: "scatter",
    mode: "markers+text",
    textposition: "top center",
    name: "Vértices",
    marker: {
      color: "#000000",
      size: 8,
    },
    hovertemplate:
      "%{text}<extra></extra>",
  });

  traces.push({
    x: [
      graph.optimal_point.x.decimal,
    ],
    y: [
      graph.optimal_point.y.decimal,
    ],
    text: [
      `Ótimo (${graph.optimal_point.x.fraction}, ${graph.optimal_point.y.fraction})`,
    ],
    type: "scatter",
    mode: "markers+text",
    textposition: "bottom center",
    name: "Solução ótima",
    marker: {
      color: "#80FFF6",
      size: 15,
      line: {
        color: "#000000",
        width: 2,
      },
    },
    hovertemplate:
      "%{text}<extra></extra>",
  });

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-black/15 bg-white pb-9 pl-8">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 520,

          // Impede arrastar/zoom.
          dragmode: false,

          margin: {
            l: 55,
            r: 20,
            t: 30,
            b: 55,
          },

          xaxis: {
            range: [0, axisMax],
            gridcolor: "#EFEFEF",
            zerolinecolor: "#000000",
            fixedrange: true,
          },

          yaxis: {
            range: [0, axisMax],
            gridcolor: "#EFEFEF",
            zerolinecolor: "#000000",
            fixedrange: true,
          },

          legend: {
            orientation: "h",
            y: -0.18,
          },

          paper_bgcolor: "#FFFFFF",
          plot_bgcolor: "#FFFFFF",

          font: {
            color: "#000000",
          },
        }}
        config={{
          responsive: true,
          displaylogo: false,
          displayModeBar: false,
          scrollZoom: false,
          doubleClick: false,
        }}
        useResizeHandler
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Eixo X em KaTeX */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-semibold">
        <InlineFormula math="x_{1}" />
      </div>

      {/* Eixo Y em KaTeX */}
      <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 font-semibold">
        <InlineFormula math="x_{2}" />
      </div>
    </div>
  );
}
