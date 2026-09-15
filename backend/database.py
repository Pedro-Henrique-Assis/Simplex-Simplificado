from pathlib import Path
import sqlite3

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "simplex.db"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'intermediate', 'hard')),
                status TEXT NOT NULL DEFAULT 'available',
                objective_type TEXT NOT NULL DEFAULT 'maximize',
                x1_coefficient REAL NOT NULL,
                x2_coefficient REAL NOT NULL,
                constraint_1_x1 REAL NOT NULL,
                constraint_1_x2 REAL NOT NULL,
                constraint_1_operator TEXT NOT NULL DEFAULT '<=',
                constraint_1_result REAL NOT NULL,
                constraint_2_x1 REAL NOT NULL,
                constraint_2_x2 REAL NOT NULL,
                constraint_2_operator TEXT NOT NULL DEFAULT '<=',
                constraint_2_result REAL NOT NULL,
                constraint_3_x1 REAL,
                constraint_3_x2 REAL,
                constraint_3_operator TEXT,
                constraint_3_result REAL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id INTEGER,
                completed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(problem_id) REFERENCES problems(id)
            )
            """
        )
