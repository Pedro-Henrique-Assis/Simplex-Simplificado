"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Data } from "plotly.js";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type MathTable = {
  headers: string[];
  rows: string[][];
};

type Topic = {
  title: string;
  definition: string;
  application: string;
  example: string;
  math?: string;
  table?: MathTable;
  graph?: boolean;
  steps: string[];
  takeaway: string;
};

function MathText({ children }: { children: string }) {
  const parts = children.split(/(\$.*?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          return (
            <InlineMath
              key={`${part}-${index}`}
              math={part.slice(1, -1)}
            />
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function MathExpression({ math }: { math: string }) {
  return (
    <div className="mt-5 overflow-x-auto border-l-4 border-[#80FFF6] bg-white p-4 text-center text-lg font-semibold md:p-5">
      <div className="[&_.katex-display]:m-0 [&_.katex-display]:text-center">
        <BlockMath math={math} />
      </div>
    </div>
  );
}

function LearningSimplexTable({ table }: { table: MathTable }) {
  return (
    <div className="mt-5 overflow-x-auto border-l-4 border-[#80FFF6] bg-white p-4 md:p-5">
      <table className="mx-auto w-full min-w-[560px] border-collapse text-center">
        <thead>
          <tr className="bg-black/[0.04]">
            {table.headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                scope="col"
                className="border border-black/10 px-4 py-4 text-center text-base font-semibold"
              >
                <InlineMath math={header} />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className="transition-colors hover:bg-black/[0.02]"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={`border border-black/10 px-4 py-4 text-center text-base ${
                    cellIndex === 0
                      ? "bg-black/[0.025] font-semibold"
                      : ""
                  }`}
                >
                  <InlineMath math={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LearningFeasibleRegionGraph() {
  const traces: Data[] = [
    {
      x: [0, 4],
      y: [8, 0],
      type: "scatter",
      mode: "lines",
      name: "R₁: 2x₁ + x₂ ≤ 8",
      line: {
        color: "#000000",
        width: 2.5,
      },
      hovertemplate:
        "<b>Restrição 1</b><br>2x₁ + x₂ ≤ 8<extra></extra>",
    },
    {
      x: [0, 10],
      y: [5, 0],
      type: "scatter",
      mode: "lines",
      name: "R₂: x₁ + 2x₂ ≤ 10",
      line: {
        color: "#666666",
        width: 2.5,
        dash: "dash",
      },
      hovertemplate:
        "<b>Restrição 2</b><br>x₁ + 2x₂ ≤ 10<extra></extra>",
    },
    {
      x: [0, 4, 2, 0, 0],
      y: [0, 0, 4, 5, 0],
      type: "scatter",
      mode: "lines",
      fill: "toself",
      name: "Região viável",
      fillcolor: "rgba(128, 255, 246, 0.35)",
      line: {
        color: "#80FFF6",
        width: 2,
      },
      hoverinfo: "skip",
    },
    {
      x: [0, 4, 2, 0],
      y: [0, 0, 4, 5],
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
      text: [
        "A = (0, 0)",
        "B = (4, 0)",
        "C = (2, 4)",
        "D = (0, 5)",
      ],
      hovertemplate: "<b>%{text}</b><extra></extra>",
    },
    {
      x: [2],
      y: [4],
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
      text: ["x₁ = 2, x₂ = 4, Z = 220"],
      hovertemplate:
        "<b>Solução ótima</b><br>%{text}<extra></extra>",
    },
  ];

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="border-b border-black/10 px-5 py-4">
        <p className="text-sm font-semibold">
          Representação gráfica do problema
        </p>

        <p className="mt-1 text-sm leading-6 text-black/55">
          A área em azul representa todas as combinações de produção que
          respeitam simultaneamente as restrições do problema.
        </p>
      </div>

      <div
        className="h-[520px] w-full md:h-[600px]"
        role="img"
        aria-label="Gráfico da região viável do problema de Programação Linear"
      >
        <Plot
          data={traces}
          layout={{
            autosize: true,
            margin: {
              l: 75,
              r: 35,
              t: 55,
              b: 105,
            },

            title: {
              text: "Região viável e solução ótima",
              x: 0.5,
              xanchor: "center",
              font: {
                size: 18,
                color: "#000000",
              },
            },

            xaxis: {
              title: {
                text: "x₁ — quantidade de peças A",
                font: {
                  size: 14,
                  color: "#000000",
                },
              },
              range: [-0.25, 10.5],
              tick0: 0,
              dtick: 1,
              showgrid: true,
              gridcolor: "#EFEFEF",
              gridwidth: 1,
              zeroline: true,
              zerolinecolor: "#000000",
              zerolinewidth: 1.5,
              showline: true,
              linecolor: "#000000",
              linewidth: 1,
              ticks: "outside",
              tickcolor: "#000000",
              fixedrange: true,
            },

            yaxis: {
              title: {
                text: "x₂ — quantidade de peças B",
                font: {
                  size: 14,
                  color: "#000000",
                },
              },
              range: [-0.25, 8.5],
              tick0: 0,
              dtick: 1,
              showgrid: true,
              gridcolor: "#EFEFEF",
              gridwidth: 1,
              zeroline: true,
              zerolinecolor: "#000000",
              zerolinewidth: 1.5,
              showline: true,
              linecolor: "#000000",
              linewidth: 1,
              ticks: "outside",
              tickcolor: "#000000",
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
              {
                x: 1.15,
                y: 1.7,
                text: "<b>Região viável</b>",
                showarrow: false,
                font: {
                  size: 13,
                  color: "#000000",
                },
                bgcolor: "rgba(255,255,255,0.82)",
                borderpad: 5,
              },
              {
                x: 2,
                y: 4,
                text: "<b>C = solução ótima</b><br>x₁ = 2 · x₂ = 4<br>Z = 220",
                showarrow: true,
                arrowhead: 2,
                arrowsize: 1,
                arrowwidth: 1.5,
                arrowcolor: "#000000",
                ax: 85,
                ay: -65,
                bgcolor: "#FFFFFF",
                bordercolor: "#000000",
                borderwidth: 1,
                borderpad: 7,
                font: {
                  size: 12,
                  color: "#000000",
                },
              },
              {
                x: 4,
                y: 0,
                text: "B (4, 0)",
                showarrow: false,
                xshift: 25,
                yshift: 18,
                font: {
                  size: 11,
                  color: "#000000",
                },
              },
              {
                x: 0,
                y: 5,
                text: "D (0, 5)",
                showarrow: false,
                xshift: 34,
                yshift: 10,
                font: {
                  size: 11,
                  color: "#000000",
                },
              },
              {
                x: 0,
                y: 0,
                text: "A (0, 0)",
                showarrow: false,
                xshift: 35,
                yshift: 18,
                font: {
                  size: 11,
                  color: "#000000",
                },
              },
            ],

            paper_bgcolor: "#FFFFFF",
            plot_bgcolor: "#FFFFFF",

            font: {
              color: "#000000",
            },

            hoverlabel: {
              bgcolor: "#FFFFFF",
              bordercolor: "#000000",
              font: {
                color: "#000000",
              },
            },
          }}
          config={{
            responsive: true,
            displaylogo: false,
            scrollZoom: false,
          }}
          useResizeHandler
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <div className="grid gap-px border-t border-black/10 bg-black/10 md:grid-cols-4">
        <div className="bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/40">
            A
          </p>
          <div className="mt-1">
            <InlineMath math="(0,0)" />
          </div>
        </div>

        <div className="bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/40">
            B
          </p>
          <div className="mt-1">
            <InlineMath math="(4,0)" />
          </div>
        </div>

        <div className="bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/40">
            C — ótimo
          </p>
          <div className="mt-1 font-semibold">
            <InlineMath math="(2,4)" />
          </div>
        </div>

        <div className="bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/40">
            D
          </p>
          <div className="mt-1">
            <InlineMath math="(0,5)" />
          </div>
        </div>
      </div>
    </div>
  );
}

const topics: Topic[] = [
  {
    title: "O que é Programação Linear?",
    definition:
      "Programação Linear é uma técnica matemática utilizada para encontrar a melhor decisão possível quando existem recursos limitados. Ela permite maximizar um resultado desejado, como lucro ou produção, ou minimizar algo, como custo, tempo ou desperdício, desde que o problema possa ser representado por relações lineares.",
    application:
      "Ela aparece em situações de produção, logística, planejamento de equipes, distribuição de recursos, agricultura, orçamento e diversas outras áreas. Sempre que precisamos decidir quanto realizar de cada atividade utilizando recursos limitados, existe a possibilidade de representar o problema por meio da Programação Linear.",
    example:
      "Imagine uma oficina que produz duas peças: A e B. Cada unidade da peça A gera 30 reais de lucro e cada unidade da peça B gera 40 reais. Porém, ambas utilizam horas limitadas de corte e acabamento. O objetivo da empresa é descobrir quantas unidades de cada peça devem ser produzidas para obter o maior lucro possível sem ultrapassar a capacidade disponível. Chamaremos as quantidades produzidas de $x_{1}$ e $x_{2}$.",
    math: String.raw`
      \max Z = 30x_{1} + 40x_{2}
    `,
    steps: [
      "$x_{1}$ representa a quantidade produzida da peça A.",
      "$x_{2}$ representa a quantidade produzida da peça B.",
      "Os coeficientes $30$ e $40$ representam os lucros obtidos por unidade.",
      "As limitações das máquinas serão representadas matematicamente por restrições.",
      "O método Simplex buscará a combinação de $x_{1}$ e $x_{2}$ que produz o maior valor possível para $Z$.",
    ],
    takeaway:
      "Programação Linear transforma um problema real de decisão em um modelo matemático que pode ser analisado objetivamente.",
  },

  {
    title: "Variáveis de decisão",
    definition:
      "Variáveis de decisão representam aquilo que ainda precisamos determinar no problema. Seus valores não são conhecidos inicialmente: eles serão encontrados durante a resolução do modelo matemático.",
    application:
      "Em uma fábrica, podem representar quantidades produzidas. Em logística, quantidades transportadas. Em agricultura, hectares destinados a cada cultura. Em planejamento de pessoas, horas destinadas a diferentes atividades.",
    example:
      "No problema da oficina, precisamos decidir quantas peças A e quantas peças B produzir. Por isso criamos duas variáveis: $x_{1}$ para representar a quantidade da peça A e $x_{2}$ para representar a quantidade da peça B.",
    math: String.raw`
      \begin{gathered}
        x_{1} = \text{quantidade de peças A} \\[10pt]
        x_{2} = \text{quantidade de peças B}
      \end{gathered}
    `,
    steps: [
      "Primeiro, identifique quais decisões precisam ser tomadas.",
      "Crie uma variável para representar cada decisão.",
      "Defina claramente o significado de $x_{1}$ e $x_{2}$.",
      "Não atribua valores às variáveis ainda: o método Simplex será responsável por encontrá-los.",
    ],
    takeaway:
      "Uma variável de decisão responde à pergunta: qual quantidade precisamos descobrir?",
  },

  {
    title: "Função objetivo",
    definition:
      "A função objetivo representa aquilo que queremos otimizar. Ela combina as variáveis de decisão com o benefício ou custo associado a cada unidade delas.",
    application:
      "A função objetivo pode representar lucro, faturamento, produtividade, quantidade produzida, custo, distância, tempo ou outro indicador que desejamos maximizar ou minimizar.",
    example:
      "Na oficina, cada peça A gera 30 reais de lucro e cada peça B gera 40 reais. Se forem produzidas $x_{1}$ unidades de A e $x_{2}$ unidades de B, o lucro total será formado pela soma de $30x_{1}$ com $40x_{2}$.",
    math: String.raw`
      \max Z = 30x_{1} + 40x_{2}
    `,
    steps: [
      "O coeficiente $30$ representa o lucro de cada peça A.",
      "O coeficiente $40$ representa o lucro de cada peça B.",
      "$30x_{1}$ representa o lucro total obtido com a produção da peça A.",
      "$40x_{2}$ representa o lucro total obtido com a produção da peça B.",
      "$Z$ representa o lucro total que desejamos maximizar.",
    ],
    takeaway:
      "A função objetivo informa ao método Simplex o que significa encontrar uma solução melhor.",
  },

  {
    title: "Restrições",
    definition:
      "Restrições representam os limites que impedem que as variáveis assumam qualquer valor. Elas traduzem matematicamente limitações reais, como horas disponíveis, matéria-prima, orçamento, mão de obra ou capacidade de equipamentos.",
    application:
      "Praticamente todo problema real possui recursos limitados. Mesmo que produzir mais aumente o lucro, uma empresa não dispõe de quantidade infinita de máquinas, materiais, tempo ou pessoas.",
    example:
      "Na oficina, uma peça A utiliza 2 horas de corte e uma peça B utiliza 1 hora. Existem apenas 8 horas de corte disponíveis. No acabamento, A utiliza 1 hora e B utiliza 2 horas, enquanto a oficina possui somente 10 horas disponíveis.",
    math: String.raw`
      \begin{gathered}
        2x_{1} + x_{2} \leq 8 \\[10pt]
        x_{1} + 2x_{2} \leq 10
      \end{gathered}
    `,
    steps: [
      "$2x_{1} + x_{2}$ representa o total de horas utilizadas no processo de corte.",
      String.raw`Esse consumo deve obedecer à condição $2x_{1} + x_{2} \leq 8$.`,
      "$x_{1} + 2x_{2}$ representa o total de horas utilizadas no acabamento.",
      String.raw`Esse consumo deve obedecer à condição $x_{1} + 2x_{2} \leq 10$.`,
    ],
    takeaway:
      "As restrições definem até onde podemos aumentar a produção sem ultrapassar os recursos disponíveis.",
  },

  {
    title: "Não negatividade",
    definition:
      "A condição de não negatividade determina que as variáveis de decisão não podem assumir valores menores que zero.",
    application:
      "Essa condição é necessária quando as variáveis representam quantidades físicas para as quais valores negativos não possuem significado, como produtos, horas, pessoas, toneladas ou quilômetros.",
    example:
      "Não faria sentido a solução indicar que a oficina deve produzir $-3$ peças A. A menor quantidade possível de produção é zero. Por isso exigimos que $x_{1}$ e $x_{2}$ sejam maiores ou iguais a zero.",
    math: String.raw`
      \begin{gathered}
        x_{1} \geq 0 \\[10pt]
        x_{2} \geq 0
      \end{gathered}
    `,
    steps: [
      "$x_{1} = 0$ significa que nenhuma peça A será produzida.",
      "$x_{1} > 0$ representa alguma quantidade produzida da peça A.",
      "O mesmo raciocínio é aplicado a $x_{2}$.",
      "Valores de $x_{1} < 0$ ou $x_{2} < 0$ são descartados das soluções possíveis.",
    ],
    takeaway:
      "A não negatividade garante que a resposta matemática continue fazendo sentido no problema real.",
  },

  {
    title: "Forma padrão",
    definition:
      "O método Simplex trabalha com equações. Por isso, antes de montar a tabela Simplex, transformamos as restrições escritas como desigualdades em igualdades.",
    application:
      "Essa conversão permite representar explicitamente tanto o recurso que foi utilizado quanto a parcela do recurso que permaneceu disponível.",
    example:
      "A oficina possui 8 horas de corte. Se uma determinada produção utilizar somente 6 horas, as 2 horas restantes também precisam aparecer matematicamente. Para representar essa capacidade não utilizada, adicionamos uma variável de folga.",
    math: String.raw`
      \begin{gathered}
        2x_{1} + x_{2} + f_{1} = 8 \\[10pt]
        x_{1} + 2x_{2} + f_{2} = 10
      \end{gathered}
    `,
    steps: [
      String.raw`Começamos com a restrição $2x_{1} + x_{2} \leq 8$.`,
      "Adicionamos $f_{1}$ para representar a capacidade de corte que não foi utilizada.",
      "$2x_{1} + x_{2} + f_{1} = 8$ passa a representar a primeira restrição na forma padrão.",
      "Na segunda restrição, adicionamos $f_{2}$ e obtemos $x_{1} + 2x_{2} + f_{2} = 10$.",
    ],
    takeaway:
      "A forma padrão prepara as restrições para que elas possam ser inseridas e manipuladas na tabela Simplex.",
  },

  {
    title: "Variáveis de folga",
    definition:
      "Variáveis de folga representam a quantidade de um recurso disponível que não está sendo utilizada. Elas são adicionadas às restrições do tipo menor ou igual para transformá-las em igualdades.",
    application:
      "Além de serem necessárias para o método Simplex, as folgas possuem interpretação prática: podem representar capacidade ociosa de máquinas, horas restantes, orçamento não utilizado ou matéria-prima disponível.",
    example:
      "Considere novamente a capacidade de corte. Se a oficina utilizar somente 6 das 8 horas disponíveis, haverá uma folga de 2 horas. Nesse caso, teremos $f_{1} = 2$.",
    math: String.raw`
      2x_{1} + x_{2} + f_{1} = 8
    `,
    steps: [
      "Se toda a capacidade de corte for utilizada, teremos $f_{1} = 0$.",
      "Se parte da capacidade permanecer disponível, teremos $f_{1} > 0$.",
      "Para a segunda restrição, $f_{2}$ representa a folga existente no acabamento.",
      "No início do método Simplex, $f_{1}$ e $f_{2}$ normalmente fazem parte da base inicial.",
    ],
    takeaway:
      "A variável de folga mostra matematicamente quanto de um recurso ainda resta depois da produção.",
  },

  {
    title: "Tabela Simplex",
    definition:
      "A tabela Simplex, também chamada de tableau, organiza em uma única estrutura todos os coeficientes necessários para executar o algoritmo. Cada linha representa uma equação e cada coluna representa uma variável.",
    application:
      "A tabela permite executar de maneira sistemática as operações matemáticas necessárias para sair de uma solução inicial e avançar progressivamente em direção a soluções melhores.",
    example:
      "Depois de transformar as duas restrições da oficina em equações, podemos organizar $x_{1}$, $x_{2}$, $f_{1}$, $f_{2}$, a função objetivo $Z$ e os valores disponíveis em uma única tabela.",
    table: {
      headers: [
        String.raw`\text{Base}`,
        String.raw`x_{1}`,
        String.raw`x_{2}`,
        String.raw`f_{1}`,
        String.raw`f_{2}`,
        String.raw`\mathrm{RHS}`,
      ],
      rows: [
        [
          String.raw`f_{1}`,
          String.raw`2`,
          String.raw`1`,
          String.raw`1`,
          String.raw`0`,
          String.raw`8`,
        ],
        [
          String.raw`f_{2}`,
          String.raw`1`,
          String.raw`2`,
          String.raw`0`,
          String.raw`1`,
          String.raw`10`,
        ],
        [
          String.raw`Z`,
          String.raw`-30`,
          String.raw`-40`,
          String.raw`0`,
          String.raw`0`,
          String.raw`0`,
        ],
      ],
    },
    steps: [
      "As linhas associadas a $f_{1}$ e $f_{2}$ representam as duas restrições.",
      "As colunas $x_{1}$ e $x_{2}$ representam as variáveis de decisão.",
      "As colunas $f_{1}$ e $f_{2}$ representam as variáveis de folga.",
      "A linha $Z$ representa a função objetivo.",
      "A coluna $\\mathrm{RHS}$ apresenta os resultados do lado direito das equações.",
    ],
    takeaway:
      "A tabela Simplex organiza o modelo para que cada decisão e cada operação do algoritmo possam ser executadas sistematicamente.",
  },

  {
    title: "Variável que entra na base",
    definition:
      "A variável que entra na base é aquela que possui potencial para melhorar o valor da função objetivo na próxima solução.",
    application:
      "No método Simplex de maximização utilizado neste sistema, observamos a linha $Z$ e procuramos o coeficiente mais negativo. Esse valor indica qual variável possui maior potencial imediato de melhorar a função objetivo.",
    example:
      "Na tabela inicial da oficina, $x_{1}$ possui coeficiente $-30$ e $x_{2}$ possui coeficiente $-40$ na linha $Z$. Como $-40$ é mais negativo que $-30$, escolhemos $x_{2}$ para entrar na base.",
    math: String.raw`
      \min(-30,-40)
      =
      -40
      \;\Rightarrow\;
      x_{2}\text{ entra na base}
    `,
    steps: [
      "Observe os coeficientes das variáveis de decisão na linha $Z$.",
      "Compare os valores $-30$ e $-40$.",
      "Como $-40 < -30$, o coeficiente de $x_{2}$ é o mais negativo.",
      "Portanto, $x_{2}$ entra na base.",
      "A coluna correspondente a $x_{2}$ passa a ser chamada de coluna pivô.",
    ],
    takeaway:
      "Escolher a variável que entra significa decidir qual variável será aumentada para tentar melhorar a solução atual.",
  },

  {
    title: "Variável que sai da base",
    definition:
      "Quando uma variável entra na base, outra precisa sair. Para descobrir qual variável deve deixar a base, aplicamos o teste da razão utilizando os valores do lado direito e os coeficientes positivos da coluna pivô.",
    application:
      "O teste da razão impede que o aumento da variável que está entrando faça alguma restrição ultrapassar sua capacidade disponível.",
    example: String.raw`
      Como $x_{2}$ entra na base, analisamos a coluna de $x_{2}$.
      Na primeira restrição calculamos $\dfrac{8}{1} = 8$ e,
      na segunda, $\dfrac{10}{2} = 5$.
      A menor razão positiva será responsável por determinar a linha que deixa a base.
    `,
    math: String.raw`
      \begin{gathered}
        \dfrac{8}{1} = 8 \\[10pt]
        \dfrac{10}{2} = 5 \\[10pt]
        \min(8,5) = 5
        \;\Rightarrow\;
        f_{2}\text{ sai da base}
      \end{gathered}
    `,
    steps: [
      "Pegue o valor $\\mathrm{RHS}$ de cada restrição.",
      "Divida cada $\\mathrm{RHS}$ pelo coeficiente positivo correspondente da coluna $x_{2}$.",
      String.raw`Na primeira linha, obtemos $\dfrac{8}{1} = 8$.`,
      String.raw`Na segunda linha, obtemos $\dfrac{10}{2} = 5$.`,
      "Como $5 < 8$, a segunda linha é a linha pivô e $f_{2}$ deixa a base.",
    ],
    takeaway:
      "A variável que sai é determinada pela restrição que atingiria seu limite primeiro quando aumentamos a variável que está entrando.",
  },

  {
    title: "Elemento pivô",
    definition:
      "O elemento pivô é o número localizado exatamente no encontro da coluna da variável que entra com a linha da variável que sai.",
    application:
      "Esse elemento será utilizado como referência para transformar a tabela e permitir que a variável escolhida passe a fazer parte da nova base.",
    example:
      "Escolhemos $x_{2}$ para entrar na base e $f_{2}$ para sair. A coluna pivô é, portanto, a coluna de $x_{2}$, e a linha pivô é a linha de $f_{2}$. Na interseção das duas encontramos o valor $2$.",
    math: String.raw`
      \text{Elemento pivô} = 2
    `,
    steps: [
      "A variável que entra é $x_{2}$.",
      "Logo, a coluna pivô é a coluna de $x_{2}$.",
      "A variável que sai é $f_{2}$.",
      "Logo, a segunda restrição é a linha pivô.",
      "Na interseção entre essa linha e essa coluna encontramos o elemento pivô $2$.",
    ],
    takeaway:
      "O elemento pivô é o ponto central da transformação utilizada para construir a próxima tabela.",
  },

  {
    title: "Pivoteamento",
    definition:
      "Pivoteamento é o conjunto de operações de linha utilizado para transformar a coluna pivô. O objetivo é fazer o elemento pivô se tornar igual a 1 e fazer os demais elementos da mesma coluna se tornarem iguais a 0.",
    application:
      "Esse processo realiza matematicamente a troca de uma variável básica por outra, preservando as equações do problema e permitindo avançar para uma nova solução.",
    example:
      "Como o elemento pivô é $2$, primeiro dividimos toda a segunda linha por $2$. Depois utilizamos essa nova linha para eliminar os demais valores existentes na coluna de $x_{2}$, inclusive o coeficiente presente na linha $Z$.",
    math: String.raw`
      \begin{gathered}
        L_{2}^{\prime} = \dfrac{L_{2}}{2} \\[10pt]
        L_{1}^{\prime} = L_{1} - L_{2}^{\prime} \\[10pt]
        Z^{\prime} = Z + 40L_{2}^{\prime}
      \end{gathered}
    `,
    steps: [
      String.raw`Primeiro calculamos $L_{2}^{\prime} = \dfrac{L_{2}}{2}$ para transformar o pivô em $1$.`,
      String.raw`Depois utilizamos $L_{2}^{\prime}$ para eliminar o valor de $x_{2}$ existente na primeira linha.`,
      String.raw`$L_{1}^{\prime}$ é obtida a partir da operação realizada com a linha pivô.`,
      "Também utilizamos a linha pivô para zerar o coeficiente de $x_{2}$ na linha $Z$.",
      "A nova tabela representa uma nova solução básica do problema.",
    ],
    takeaway:
      "O pivoteamento é a operação que efetivamente conduz o Simplex de uma solução básica para a próxima.",
  },

  {
    title: "Teste de otimalidade",
    definition:
      "Depois de cada pivoteamento precisamos verificar se ainda existe possibilidade de melhorar a função objetivo. Essa verificação recebe o nome de teste de otimalidade.",
    application:
      "O teste determina se o algoritmo pode encerrar a resolução ou se uma nova iteração do método Simplex ainda precisa ser executada.",
    example:
      "Depois da primeira iteração do problema da oficina, a linha $Z$ ainda apresenta um coeficiente negativo associado a $x_{1}$. Esse coeficiente é $-10$. Isso indica que aumentar $x_{1}$ ainda pode melhorar o lucro, portanto precisamos realizar uma nova iteração.",
    math: String.raw`
      \begin{gathered}
        x_{1}: -10 < 0
        \;\Rightarrow\;
        \text{continuar} \\[10pt]
        \text{Tabela final: nenhum coeficiente negativo}
        \;\Rightarrow\;
        \text{solução ótima}
      \end{gathered}
    `,
    steps: [
      "Depois do pivoteamento, observe novamente a linha $Z$.",
      "Se existir um coeficiente negativo relevante, ainda existe possibilidade de melhorar a solução.",
      "No exemplo, o coeficiente de $x_{1}$ ainda é $-10$.",
      "Portanto, uma nova variável deverá entrar na base.",
      "Quando não restarem coeficientes negativos na linha $Z$, a solução atual será ótima para este modelo.",
    ],
    takeaway:
      "O teste de otimalidade responde à pergunta: ainda podemos melhorar a solução ou já encontramos o melhor resultado?",
  },

  {
    title: "Solução ótima",
    definition:
      "A solução ótima é a combinação de valores das variáveis de decisão que respeita todas as restrições e fornece o melhor valor possível para a função objetivo.",
    application:
      "Ela representa a resposta quantitativa final do problema de otimização: quanto produzir, transportar, investir, distribuir ou alocar para atingir o melhor resultado possível.",
    example:
      "Depois das iterações do método Simplex, encontramos $x_{1} = 2$ e $x_{2} = 4$. Isso significa que a oficina deve produzir 2 unidades da peça A e 4 unidades da peça B. Em seguida substituímos esses valores na função objetivo para calcular o lucro máximo.",
    math: String.raw`
      \begin{gathered}
        x_{1} = 2 \\[10pt]
        x_{2} = 4 \\[10pt]
        Z = 30(2) + 40(4) \\[10pt]
        Z = 60 + 160 \\[10pt]
        Z = 220
      \end{gathered}
    `,
    steps: [
      "O método encontrou $x_{1} = 2$.",
      "Também encontrou $x_{2} = 4$.",
      "Substituímos os valores na função objetivo $Z = 30x_{1} + 40x_{2}$.",
      "Calculamos $Z = 30(2) + 40(4)$.",
      "Assim, obtemos $Z = 220$.",
    ],
    takeaway:
      "A solução ótima é a melhor solução viável encontrada para o modelo matemático definido.",
  },

  {
    title: "Interpretação",
    definition:
      "Resolver matematicamente o problema não é suficiente. A última etapa consiste em traduzir os números encontrados novamente para a situação real que originou o modelo.",
    application:
      "Essa interpretação é fundamental para apoiar decisões. O responsável pelo processo precisa compreender o significado empresarial, industrial ou operacional dos valores obtidos pelo método.",
    example:
      "A solução $x_{1} = 2$, $x_{2} = 4$ e $Z = 220$ significa que, considerando as capacidades de corte e acabamento informadas, a oficina deve produzir 2 unidades da peça A e 4 unidades da peça B para atingir o maior lucro possível, correspondente a 220 reais.",
    math: String.raw`
      \begin{gathered}
        x_{1} = 2\text{ peças A} \\[10pt]
        x_{2} = 4\text{ peças B} \\[10pt]
        Z_{\max} = \text{R\$ }220
      \end{gathered}
    `,
    steps: [
      "Identifique novamente o significado original de $x_{1}$ e $x_{2}$.",
      "Converta os valores das variáveis para a unidade real do problema.",
      "Interprete $Z$ de acordo com aquilo que a função objetivo representa.",
      "Verifique se a solução encontrada faz sentido do ponto de vista operacional.",
      "Utilize a solução matemática como informação para apoiar a tomada de decisão.",
    ],
    takeaway:
      "O Simplex realmente termina quando conseguimos transformar sua solução matemática em uma decisão compreensível no mundo real.",
  },

  {
    title: "Gráfico e região viável",
    definition:
      "A representação gráfica mostra visualmente todas as combinações possíveis entre as variáveis de decisão. Cada restrição aparece como uma reta que divide o plano em duas regiões. A região viável é a interseção das regiões que atendem simultaneamente a todas as restrições e às condições de não negatividade.",
    application:
      "Quando um problema possui duas variáveis de decisão, o gráfico é uma ferramenta especialmente útil para compreender geometricamente aquilo que o método Simplex faz de forma algébrica. Ele permite visualizar os limites dos recursos, identificar os vértices da região viável e perceber por que a solução ótima costuma ocorrer em um desses vértices.",
    example:
      "No problema da oficina, representamos $x_{1}$ no eixo horizontal e $x_{2}$ no eixo vertical. A primeira reta corresponde a $2x_{1} + x_{2} = 8$ e a segunda a $x_{1} + 2x_{2} = 10$. Como as duas restrições utilizam o operador menor ou igual, procuramos os pontos localizados do lado das retas que não ultrapassam os recursos disponíveis. Além disso, $x_{1}$ e $x_{2}$ não podem ser negativos. A interseção dessas quatro condições forma a região viável destacada no gráfico.",
    math: String.raw`
      \begin{gathered}
        2x_{1} + x_{2} \leq 8 \\[10pt]
        x_{1} + 2x_{2} \leq 10 \\[10pt]
        x_{1} \geq 0 \\[10pt]
        x_{2} \geq 0
      \end{gathered}
    `,
    graph: true,
    steps: [
      "O eixo horizontal representa $x_{1}$, isto é, a quantidade de peças A.",
      "O eixo vertical representa $x_{2}$, isto é, a quantidade de peças B.",
      "Cada reta representa o limite máximo permitido por um recurso. Os pontos localizados além desse limite consomem mais recurso do que está disponível.",
      "A área azul é viável porque qualquer ponto dentro dela satisfaz simultaneamente $2x_{1} + x_{2} \\leq 8$, $x_{1} + 2x_{2} \\leq 10$, $x_{1} \\geq 0$ e $x_{2} \\geq 0$.",
      "Por exemplo, o ponto $(1,2)$ é viável: na primeira restrição obtemos $2(1)+2=4 \\leq 8$ e, na segunda, $1+2(2)=5 \\leq 10$.",
      "Já pontos mais afastados não pertencem à região quando violam pelo menos uma restrição. O ponto $(5,0)$ produz $2(5)+0=10>8$, portanto ultrapassa a capacidade da primeira restrição.",
      "Da mesma forma, $(0,6)$ não é viável porque $0+2(6)=12>10$, e $(5,5)$ viola as duas restrições ao mesmo tempo.",
      "As linhas de fronteira pertencem à região viável porque as restrições utilizam o símbolo $\\leq$. Portanto, consumir exatamente toda a capacidade disponível ainda é permitido.",
      "Os pontos A, B, C e D são os vértices, também chamados pontos extremos, da região viável. Eles pertencem à região e são importantes porque, em Programação Linear, uma solução ótima finita pode ser encontrada em pelo menos um vértice.",
      "Neste exemplo, avaliando a função objetivo nos vértices, o ponto $C=(2,4)$ fornece o maior valor: $Z=30(2)+40(4)=220$.",
    ],
    takeaway:
      "A região viável não é apenas a área desenhada entre duas retas: ela representa exatamente o conjunto de todas as decisões que respeitam simultaneamente todos os limites do problema. Os vértices pertencem a essa região; o que fica de fora são os pontos que violam pelo menos uma das restrições.",
  },
];

export default function AprenderPage() {
  const [index, setIndex] = useState(0);

  const topic = topics[index];

  const goToPreviousTopic = () => {
    setIndex((current) => Math.max(0, current - 1));
  };

  const goToNextTopic = () => {
    setIndex((current) =>
      Math.min(topics.length - 1, current + 1)
    );
  };

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-black/45">
            Trilha de aprendizado
          </p>

          <ol className="mt-5 space-y-1">
            {topics.map((item, i) => (
              <li key={item.title}>
                <button
                  type="button"
                  className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition ${
                    i === index
                      ? "bg-black text-white"
                      : "hover:bg-black/[0.04]"
                  }`}
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "step" : undefined}
                >
                  {i + 1}. {item.title}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="max-w-4xl py-2">
          <p className="text-sm text-black/45">
            Tópico {index + 1} de {topics.length}
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {topic.title}
          </h1>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              O que é?
            </h2>

            <p className="mt-2 text-base leading-7 text-black/70 md:text-lg md:leading-8">
              <MathText>{topic.definition}</MathText>
            </p>
          </div>

          <div className="mt-7">
            <h2 className="text-lg font-semibold">
              Onde isso aparece na prática?
            </h2>

            <p className="mt-2 text-base leading-7 text-black/70 md:text-lg md:leading-8">
              <MathText>{topic.application}</MathText>
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-black/10 bg-[#F7F7F7] p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-black/45">
              Exemplo prático
            </p>

            <p
              className={`mt-3 text-black/75 ${
                index === 9 ? "leading-10" : "leading-7"
              }`}
            >
              <MathText>{topic.example}</MathText>
            </p>

            {topic.math ? (
              <MathExpression math={topic.math} />
            ) : null}

            {topic.table ? (
              <LearningSimplexTable table={topic.table} />
            ) : null}

            {topic.graph ? (
              <LearningFeasibleRegionGraph />
            ) : null}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Como interpretar e aplicar?
            </h2>

            <ol className="mt-4 space-y-3">
              {topic.steps.map((step, i) => (
                <li
                  key={`${topic.title}-${i}`}
                  className="flex items-start gap-3 text-black/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black text-xs font-semibold text-white">
                    {i + 1}
                  </span>

                  <span className="pt-0.5 leading-6">
                    <MathText>{step}</MathText>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 border-l-4 border-[#80FFF6] pl-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-black/45">
              Para lembrar
            </p>

            <p className="mt-2 font-medium leading-7">
              <MathText>{topic.takeaway}</MathText>
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-black/10 pt-8">
            <button
              type="button"
              className="btn-secondary cursor-pointer disabled:cursor-not-allowed"
              disabled={index === 0}
              onClick={goToPreviousTopic}
            >
              Anterior
            </button>

            <button
              type="button"
              className="btn-primary cursor-pointer disabled:cursor-not-allowed"
              disabled={index === topics.length - 1}
              onClick={goToNextTopic}
            >
              Próximo tópico
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}