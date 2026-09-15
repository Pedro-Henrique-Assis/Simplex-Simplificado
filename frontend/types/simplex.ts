export type Difficulty = "easy" | "intermediate" | "hard";

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: "available";
  objective_type: "maximize";
  x1_coefficient: number;
  x2_coefficient: number;
  constraint_1_x1: number;
  constraint_1_x2: number;
  constraint_1_operator: "<=";
  constraint_1_result: number;
  constraint_2_x1: number;
  constraint_2_x2: number;
  constraint_2_operator: "<=";
  constraint_2_result: number;
  constraint_3_x1: number | null;
  constraint_3_x2: number | null;
  constraint_3_operator: "<=" | null;
  constraint_3_result: number | null;
  created_at: string;
}

export interface ConstraintInput {
  x1: number;
  x2: number;
  operator: "<=";
  result: number;
}

export interface SimplexPayload {
  objective: { x1: number; x2: number };
  constraints: ConstraintInput[];
}

export interface FractionValue {
  fraction: string;
  decimal: number;
}

export interface TableauRow {
  label: string;
  values: FractionValue[];
}

export interface Tableau {
  headers: string[];
  rows: TableauRow[];
}

export interface Ratio {
  row: number;
  basis: string;
  rhs: FractionValue;
  coefficient: FractionValue;
  ratio: FractionValue | null;
  calculation: string;
  eligible: boolean;
}

export interface Operation {
  target: string;
  expression: string;
  result: FractionValue[];
}

export interface Iteration {
  number: number;
  entering_variable: string;
  leaving_variable: string;
  pivot_column_index: number;
  pivot_row_index: number;
  pivot: FractionValue;
  ratios: Ratio[];
  before_tableau: Tableau;
  operations: Operation[];
  after_tableau: Tableau;
  explanations: {
    pivot_column: string;
    pivot_row: string;
    pivot: string;
  };
}

export interface GraphVertex {
  label: string;
  x: FractionValue;
  y: FractionValue;
}

export interface GraphConstraint {
  name: string;
  x1_coefficient: FractionValue;
  x2_coefficient: FractionValue;
  result: FractionValue;
  x_intercept: FractionValue | null;
  y_intercept: FractionValue | null;
}

export interface SimplexResult {
  standard_form: {
    objective: string;
    equations: string[];
    slack_variables: string[];
    explanation: string;
  };
  initial_tableau: Tableau;
  iterations: Iteration[];
  final_tableau: Tableau;
  optimal_solution: {
    x1: FractionValue;
    x2: FractionValue;
    z: FractionValue;
    iterations: number;
  };
  graph_data: {
    constraints: GraphConstraint[];
    vertices: GraphVertex[];
    optimal_point: { x: FractionValue; y: FractionValue; z: FractionValue };
    axis_max: number;
  };
}
