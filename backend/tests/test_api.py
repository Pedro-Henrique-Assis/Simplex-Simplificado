from fastapi.testclient import TestClient
from main import app
from seed import seed


def setup_module():
    seed()


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


def test_list_seeded_problems():
    with TestClient(app) as client:
        response = client.get("/problems")
        assert response.status_code == 200
        assert len(response.json()) == 18


def test_filter_problems():
    with TestClient(app) as client:
        response = client.get("/problems?difficulty=hard")
        assert response.status_code == 200
        assert len(response.json()) == 6


def test_solve_endpoint():
    payload = {
        "objective": {"x1": 30, "x2": 40},
        "constraints": [
            {"x1": 2, "x2": 1, "operator": "<=", "result": 8},
            {"x1": 1, "x2": 2, "operator": "<=", "result": 10},
        ],
    }
    with TestClient(app) as client:
        response = client.post("/simplex/solve", json=payload)
        assert response.status_code == 200
        body = response.json()
        assert body["optimal_solution"]["z"]["fraction"] == "220"
        assert body["graph_data"]["optimal_point"]["z"]["fraction"] == "220"
