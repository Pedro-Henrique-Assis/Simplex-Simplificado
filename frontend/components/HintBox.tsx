"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  MathText,
} from "@/components/MathNotation";

export default function HintBox({
  hints,
  resetKey,
}: {
  hints: string[];
  resetKey: string;
}) {
  const [shown, setShown] = useState(0);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    setShown(0);
    setIdle(false);

    let timer = window.setTimeout(
      () => setIdle(true),
      60000,
    );

    const resetIdleTimer = () => {
      setIdle(false);
      window.clearTimeout(timer);

      timer = window.setTimeout(
        () => setIdle(true),
        60000,
      );
    };

    window.addEventListener(
      "pointerdown",
      resetIdleTimer,
    );

    window.addEventListener(
      "keydown",
      resetIdleTimer,
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "pointerdown",
        resetIdleTimer,
      );

      window.removeEventListener(
        "keydown",
        resetIdleTimer,
      );
    };
  }, [resetKey]);

  if (!hints.length) {
    return null;
  }

  return (
    <div className="border-l-4 border-[#80FFF6] bg-black/[0.03] p-4">
      {idle && shown === 0 && (
        <p className="mb-3 text-sm text-black/60">
          Está com dúvida? Posso mostrar uma
          dica.
        </p>
      )}

      {shown > 0 && (
        <div className="space-y-2 text-sm">
          {hints
            .slice(0, shown)
            .map((hint, index) => (
              <p key={index}>
                <strong>
                  Dica {index + 1}:
                </strong>{" "}
                <MathText>
                  {hint}
                </MathText>
              </p>
            ))}
        </div>
      )}

      {shown < hints.length && (
        <button
          type="button"
          className="mt-3 cursor-pointer text-sm font-semibold underline decoration-[#80FFF6] decoration-4 underline-offset-4"
          onClick={() =>
            setShown(
              (value) => value + 1,
            )
          }
        >
          Preciso de uma dica
        </button>
      )}
    </div>
  );
}
