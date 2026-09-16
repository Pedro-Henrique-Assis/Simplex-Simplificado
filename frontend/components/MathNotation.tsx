"use client";

import { BlockMath, InlineMath } from "react-katex";

export function symbolToLatex(symbol: string): string {
  const trimmed = symbol.trim();

  if (/^x\d+$/.test(trimmed)) {
    return `x_{${trimmed.slice(1)}}`;
  }

  if (/^f\d+$/.test(trimmed)) {
    return `f_{${trimmed.slice(1)}}`;
  }

  if (/^L\d+$/.test(trimmed)) {
    return `L_{${trimmed.slice(1)}}`;
  }

  if (trimmed === "RHS") {
    return "\\mathrm{RHS}";
  }

  return trimmed;
}

export function fractionToLatex(
  value: string,
  displayStyle = false,
): string {
  const trimmed = value.trim();
  const fraction = trimmed.match(/^(-?)(\d+)\/(\d+)$/);

  if (fraction) {
    const [, sign, numerator, denominator] = fraction;
    const command = displayStyle ? "\\dfrac" : "\\frac";

    return `${sign}${command}{${numerator}}{${denominator}}`;
  }

  const numeric = Number(trimmed);

  if (Number.isFinite(numeric)) {
    return String(numeric);
  }

  return trimmed;
}

export function expressionToLatex(expression: string): string {
  let result = expression.trim();

  // Remove ".0" de valores inteiros.
  result = result.replace(/(-?\d+)\.0+\b/g, "$1");

  // Corrige casos como "+ -2x".
  result = result.replace(/\+\s*-/g, "- ");

  // Remove termos de folga com coeficiente zero.
  result = result.replace(/\s*\+\s*0(?=[xf]\d+\b)/g, "");

  // Omite coeficiente 1.
  result = result.replace(
    /(^|[=+\-]\s*)1(?=[xf]\d+\b)/g,
    "$1",
  );

  result = result.replace(
    /(^|[=+\-]\s*)-1(?=[xf]\d+\b)/g,
    "$1-",
  );

  // Operadores e palavras matemáticas.
  result = result.replace(/\bMax\b/gi, "\\max");
  result = result.replace(/<=|≤/g, "\\leq");
  result = result.replace(/>=|≥/g, "\\geq");
  result = result.replace(/→/g, "\\rightarrow");
  result = result.replace(/×/g, "\\cdot");
  result = result.replace(/÷/g, "\\div");

  // Linhas de pivoteamento.
  result = result.replace(
    /\bL(\d+)\s+nova\b/g,
    (_, index: string) => `L_{${index}}^{\\prime}`,
  );

  result = result.replace(
    /\bZ\s+nova\b/g,
    "Z^{\\prime}",
  );

  // Variáveis.
  result = result.replace(
    /\bx(\d+)\b/g,
    (_, index: string) => `x_{${index}}`,
  );

  result = result.replace(
    /\bf(\d+)\b/g,
    (_, index: string) => `f_{${index}}`,
  );

  result = result.replace(
    /\bL(\d+)\b/g,
    (_, index: string) => `L_{${index}}`,
  );

  result = result.replace(
    /\bRHS\b/g,
    "\\mathrm{RHS}",
  );

  // Frações como 4/3.
  result = result.replace(
    /(-?\d+)\/(\d+)/g,
    (_, numerator: string, denominator: string) => {
      const sign = numerator.startsWith("-") ? "-" : "";
      const absoluteNumerator = numerator.replace("-", "");

      return `${sign}\\frac{${absoluteNumerator}}{${denominator}}`;
    },
  );

  return result.replace(/\s+/g, " ").trim();
}

export function operationToLatex(
  expression: string,
): string {
  const normalized = expression.trim();

  const division = normalized.match(
    /^(L\d+|Z) nova = (L\d+|Z) ÷ (.+)$/,
  );

  if (division) {
    const [, target, source, divisor] = division;

    const targetLatex =
        target === "Z"
        ? "Z^{\\prime}"
        : `${symbolToLatex(target)}^{\\prime}`;

    const divisorIsFraction =
        /^-?\d+\/\d+$/.test(divisor.trim());

    if (divisorIsFraction) {
        return `${targetLatex} = ${symbolToLatex(
        source,
        )} \\div ${fractionToLatex(divisor, true)}`;
    }

    return `${targetLatex} = \\dfrac{${symbolToLatex(
        source,
    )}}{${fractionToLatex(divisor)}}`;
}

  const elimination = normalized.match(
    /^(L\d+|Z) nova = (L\d+|Z) ([+-]) (.+) × (L\d+) nova$/,
  );

  if (elimination) {
    const [
      ,
      target,
      source,
      sign,
      factor,
      pivotLine,
    ] = elimination;

    const targetLatex =
      target === "Z"
        ? "Z^{\\prime}"
        : `${symbolToLatex(target)}^{\\prime}`;

    const pivotLatex =
      `${symbolToLatex(pivotLine)}^{\\prime}`;

    return `${targetLatex} = ${symbolToLatex(
      source,
    )} ${sign} ${fractionToLatex(
      factor,
    )} \\cdot ${pivotLatex}`;
  }

  return expressionToLatex(normalized);
}

export function MathText({
  children,
}: {
  children: string;
}) {
  const parts = children.split(/(\$.*?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("$") &&
          part.endsWith("$")
        ) {
          return (
            <InlineMath
              key={`${part}-${index}`}
              math={part.slice(1, -1)}
            />
          );
        }

        return (
          <span key={`${part}-${index}`}>
            {part}
          </span>
        );
      })}
    </>
  );
}

export function InlineFormula({
  math,
  className = "",
}: {
  math: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <InlineMath math={math} />
    </span>
  );
}

export function MathBlock({
  math,
  dark = false,
}: {
  math: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`mt-6 overflow-x-auto border-l-4 border-[#80FFF6] p-5 text-center text-lg font-semibold ${
        dark
          ? "bg-black text-white"
          : "bg-[#F7F7F7] text-black"
      }`}
    >
      <div className="[&_.katex-display]:m-0 [&_.katex-display]:text-center">
        <BlockMath math={math} />
      </div>
    </div>
  );
}
