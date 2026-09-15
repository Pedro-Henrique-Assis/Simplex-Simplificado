import type { Problem, SimplexPayload, SimplexResult } from "@/types/simplex";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Não foi possível concluir a solicitação.");
  }
  return response.json() as Promise<T>;
}

export function getProblems(difficulty?: string) {
  const query = difficulty ? `?difficulty=${difficulty}` : "";
  return request<Problem[]>(`/problems${query}`);
}

export function getProblem(id: number) {
  return request<Problem>(`/problems/${id}`);
}

export function solveSimplex(payload: SimplexPayload) {
  return request<SimplexResult>("/simplex/solve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function validateStep(stepType: string, selected: string | number, expected: string | number) {
  return request<{ correct: boolean; message: string; explanation: string; hints: string[] }>(
    "/simplex/validate-step",
    { method: "POST", body: JSON.stringify({ step_type: stepType, selected, expected }) },
  );
}
