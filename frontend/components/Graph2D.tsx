"use client";

import dynamic from "next/dynamic";
import type { Data } from "plotly.js";

import {
  InlineFormula,
  fractionToLatex,
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

type Graph2DProps = {
  graph: SimplexResult["graph_data"];
  optimalValue?: string;
};

export default function Graph2D({
  graph,
  optimalValue,
}: Graph2DProps) {
  const axisMax =
    graph.axis_max > 0
      ? graph.axis_max
      : 10;

  const optimalX =
    graph.optimal_point.x.decimal;

  const optimalY =
    graph.optimal_point.y.decimal;

  const isOptimalVertex = (
    x: number,
    y: number,
  ) =>
    Math.abs(x - optimalX) < 0.000001 &&
    Math.abs(y - optimalY) < 0.000001;

  const optimalVertex =
    graph.vertices.find((vertex) =>
      isOptimalVertex(
        vertex.x.decimal,
        vertex.y.decimal,
      ),
    );

  /*
   * Região viável.
   *
   * Repetimos o primeiro ponto ao final
   * para fechar visualmente o polígono.
   */
  const polygonX =
    graph.vertices.map(
      (vertex) => vertex.x.decimal,
    );

  const polygonY =
    graph.vertices.map(
      (vertex) => vertex.y.decimal,
    );

  if (polygonX.length > 0) {
    polygonX.push(polygonX[0]);
    polygonY.push(polygonY[0]);
  }

  /*
   * Mantém o mesmo padrão visual
   * utilizado na página Aprender.
   *
   * Caso existam três restrições,
   * a terceira usa um cinza ainda
   * mais discreto.
   */
  const constraintStyles = [
    {
      color: "#000000",
      dash: "solid",
    },
    {
      color: "#666666",
      dash: "dash",
    },
    {
      color: "#A3A3A3",
      dash: "dot",
    },
  ] as const;

  const traces: Data[] = [];

  /*
   * Região viável primeiro para
   * permanecer atrás das retas.
   */
  traces.push({
    x: polygonX,
    y: polygonY,

    type: "scatter",
    mode: "lines",

    fill: "toself",

    name: "Região viável",

    fillcolor:
      "rgba(128, 255, 246, 0.30)",

    line: {
      color: "#80FFF6",
      width: 2,
    },

    hoverinfo: "skip",

    legendrank: 20,
  });

  /*
   * Restrições.
   */
  graph.constraints.forEach(
    (constraint, index) => {
      const a =
        constraint.x1_coefficient
          .decimal;

      const b =
        constraint.x2_coefficient
          .decimal;

      const c =
        constraint.result.decimal;

      const style =
        constraintStyles[
          Math.min(
            index,
            constraintStyles.length -
              1,
          )
        ];

      /*
       * Restrição vertical:
       *
       * a*x1 = c
       */
      if (b === 0) {
        const x =
          a !== 0 ? c / a : 0;

        traces.push({
          x: [x, x],
          y: [0, axisMax],

          type: "scatter",
          mode: "lines",

          name:
            constraint.name,

          line: {
            color:
              style.color,
            width: 2.5,
            dash: style.dash,
          },

          hovertemplate:
            `<b>${constraint.name}</b>` +
            "<extra></extra>",

          legendrank:
            index + 1,
        });

        return;
      }

      /*
       * Forma:
       *
       * x2 = (c - a*x1) / b
       */
      traces.push({
        x: [0, axisMax],

        y: [
          c / b,
          (c -
            a * axisMax) /
            b,
        ],

        type: "scatter",
        mode: "lines",

        name:
          constraint.name,

        line: {
          color:
            style.color,
          width: 2.5,
          dash: style.dash,
        },

        hovertemplate:
          `<b>${constraint.name}</b>` +
          "<extra></extra>",

        legendrank:
          index + 1,
      });
    },
  );

  /*
   * Vértices viáveis.
   */
  traces.push({
    x: graph.vertices.map(
      (vertex) =>
        vertex.x.decimal,
    ),

    y: graph.vertices.map(
      (vertex) =>
        vertex.y.decimal,
    ),

    type: "scatter",
    mode: "markers",

    name: "Vértices viáveis",

    marker: {
      color: "#000000",
      size: 9,

      line: {
        color: "#FFFFFF",
        width: 1.5,
      },
    },

    text: graph.vertices.map(
      (vertex) =>
        `${vertex.label} = (${vertex.x.fraction}, ${vertex.y.fraction})`,
    ),

    hovertemplate:
      "<b>%{text}</b><extra></extra>",

    legendrank: 30,
  });

  /*
   * Solução ótima.
   */
  traces.push({
    x: [optimalX],
    y: [optimalY],

    type: "scatter",
    mode: "markers",

    name: "Solução ótima",

    marker: {
      color: "#000000",
      size: 17,

      line: {
        color: "#80FFF6",
        width: 4,
      },
    },

    text: [
      optimalValue
        ? `x₁ = ${graph.optimal_point.x.fraction}, x₂ = ${graph.optimal_point.y.fraction}, Z = ${optimalValue}`
        : `x₁ = ${graph.optimal_point.x.fraction}, x₂ = ${graph.optimal_point.y.fraction}`,
    ],

    hovertemplate:
      "<b>Solução ótima</b><br>" +
      "%{text}<extra></extra>",

    legendrank: 40,
  });

  /*
   * Pequenas anotações dos vértices.
   */
  const vertexAnnotations =
    graph.vertices.map(
      (vertex, index) => {
        const optimal =
          isOptimalVertex(
            vertex.x.decimal,
            vertex.y.decimal,
          );

        /*
         * Não repetimos o label comum
         * no ponto ótimo, pois ele recebe
         * uma anotação própria.
         */
        if (optimal) {
          return null;
        }

        const isOrigin =
          vertex.x.decimal === 0 &&
          vertex.y.decimal === 0;

        return {
          x: vertex.x.decimal,
          y: vertex.y.decimal,

          text:
            `${vertex.label} ` +
            `(${vertex.x.fraction}, ${vertex.y.fraction})`,

          showarrow: false,

          xshift:
            vertex.x.decimal ===
            0
              ? 36
              : index % 2 === 0
                ? 18
                : -18,

          yshift:
            isOrigin
              ? 18
              : 14,

          font: {
            size: 11,
            color: "#000000",
          },

          bgcolor:
            "rgba(255,255,255,0.78)",

          borderpad: 3,
        };
      },
    )
      .filter(
        (
          annotation,
        ): annotation is NonNullable<
          typeof annotation
        > =>
          annotation !== null,
      );

  const optimalAnnotation = {
    x: optimalX,
    y: optimalY,

    text:
      `<b>${
        optimalVertex
          ? `${optimalVertex.label} = `
          : ""
      }solução ótima</b>` +
      `<br>x₁ = ${graph.optimal_point.x.fraction}` +
      ` · x₂ = ${graph.optimal_point.y.fraction}` +
      (
        optimalValue
          ? `<br>Z = ${optimalValue}`
          : ""
      ),

    showarrow: true,

    arrowhead: 2,
    arrowsize: 1,
    arrowwidth: 1.5,
    arrowcolor: "#000000",

    ax: 90,
    ay: -65,

    bgcolor: "#FFFFFF",

    bordercolor: "#000000",
    borderwidth: 1,
    borderpad: 7,

    font: {
      size: 12,
      color: "#000000",
    },
  };

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white">
      {/* Cabeçalho */}
      <div className="border-b border-black/10 px-5 py-4">
        <p className="text-sm font-semibold">
          Representação gráfica do
          problema
        </p>

        <p className="mt-1 text-sm leading-6 text-black/55">
          A área em azul representa
          todas as combinações que
          respeitam simultaneamente
          as restrições do problema.
          As retas mostram os limites
          dos recursos e o ponto
          destacado representa a
          solução ótima.
        </p>
      </div>

      {/* Gráfico */}
      <div
        className="h-[520px] w-full md:h-[600px]"
        role="img"
        aria-label="Gráfico da região viável e da solução ótima"
      >
        <Plot
          data={traces}
          layout={{
            autosize: true,

            /*
             * Mantém o gráfico fixo,
             * conforme definido
             * anteriormente.
             */
            dragmode: false,

            margin: {
              l: 75,
              r: 40,
              t: 60,
              b: 110,
            },

            title: {
              text:
                "Região viável e solução ótima",

              x: 0.5,

              xanchor:
                "center",

              font: {
                size: 18,
                color: "#000000",
              },
            },

            xaxis: {
              title: {
                text:
                  "x₁ — variável de decisão",

                font: {
                  size: 14,
                  color: "#000000",
                },
              },

              range: [
                -0.15,
                axisMax,
              ],

              tick0: 0,

              dtick:
                axisMax <= 12
                  ? 1
                  : undefined,

              showgrid: true,

              gridcolor:
                "#EFEFEF",

              gridwidth: 1,

              zeroline: true,

              zerolinecolor:
                "#000000",

              zerolinewidth: 1.5,

              showline: true,

              linecolor:
                "#000000",

              linewidth: 1,

              ticks: "outside",

              tickcolor:
                "#000000",

              fixedrange: true,
            },

            yaxis: {
              title: {
                text:
                  "x₂ — variável de decisão",

                font: {
                  size: 14,
                  color: "#000000",
                },
              },

              range: [
                -0.15,
                axisMax,
              ],

              tick0: 0,

              dtick:
                axisMax <= 12
                  ? 1
                  : undefined,

              showgrid: true,

              gridcolor:
                "#EFEFEF",

              gridwidth: 1,

              zeroline: true,

              zerolinecolor:
                "#000000",

              zerolinewidth: 1.5,

              showline: true,

              linecolor:
                "#000000",

              linewidth: 1,

              ticks: "outside",

              tickcolor:
                "#000000",

              fixedrange: true,
            },

            legend: {
              orientation: "h",

              x: 0.5,
              xanchor: "center",

              y: -0.2,
              yanchor: "top",

              font: {
                size: 12,
                color: "#000000",
              },
            },

            annotations: [
              ...vertexAnnotations,
              optimalAnnotation,

              {
                x:
                  graph.vertices.length >
                  0
                    ? graph.vertices.reduce(
                        (
                          total,
                          vertex,
                        ) =>
                          total +
                          vertex.x
                            .decimal,
                        0,
                      ) /
                      graph.vertices
                        .length
                    : 0,

                y:
                  graph.vertices.length >
                  0
                    ? graph.vertices.reduce(
                        (
                          total,
                          vertex,
                        ) =>
                          total +
                          vertex.y
                            .decimal,
                        0,
                      ) /
                      graph.vertices
                        .length
                    : 0,

                text:
                  "<b>Região viável</b>",

                showarrow: false,

                font: {
                  size: 13,
                  color: "#000000",
                },

                bgcolor:
                  "rgba(255,255,255,0.82)",

                borderpad: 5,
              },
            ],

            paper_bgcolor:
              "#FFFFFF",

            plot_bgcolor:
              "#FFFFFF",

            font: {
              color: "#000000",
            },

            hoverlabel: {
              bgcolor: "#FFFFFF",

              bordercolor:
                "#000000",

              font: {
                color: "#000000",
              },
            },
          }}
          config={{
            responsive: true,

            displaylogo: false,

            /*
             * Nenhuma ferramenta
             * de zoom/reset/autoscale.
             */
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
      </div>

      {/* Vértices */}
      <div className="grid gap-px border-t border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
        {graph.vertices.map(
          (vertex) => {
            const optimal =
              isOptimalVertex(
                vertex.x.decimal,
                vertex.y.decimal,
              );

            return (
              <div
                key={
                  vertex.label
                }
                className="bg-white p-4 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/40">
                  {vertex.label}

                  {optimal
                    ? " — ótimo"
                    : ""}
                </p>

                <div
                  className={`mt-1 ${
                    optimal
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  <InlineFormula
                    math={`\\left(${fractionToLatex(
                      vertex.x
                        .fraction,
                    )}, ${fractionToLatex(
                      vertex.y
                        .fraction,
                    )}\\right)`}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}