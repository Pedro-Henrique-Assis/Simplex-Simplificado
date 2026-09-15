from database import get_connection


def list_problems(difficulty: str | None = None):
    query = "SELECT * FROM problems"
    params: tuple = ()
    if difficulty:
        query += " WHERE difficulty = ?"
        params = (difficulty,)
    query += " ORDER BY CASE difficulty WHEN 'easy' THEN 1 WHEN 'intermediate' THEN 2 ELSE 3 END, id"
    with get_connection() as conn:
        return [dict(row) for row in conn.execute(query, params).fetchall()]


def get_problem(problem_id: int):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM problems WHERE id = ?", (problem_id,)).fetchone()
    return dict(row) if row else None
