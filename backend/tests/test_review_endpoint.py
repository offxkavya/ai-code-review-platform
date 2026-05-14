from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_review_endpoint_success():
    payload = {
        "code": "print('hello world')",
        "language": "python"
    }
    response = client.post("/api/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "comments" in data
    assert len(data["comments"]) > 0

def test_review_endpoint_validation_error():
    payload = {
        "code": "   ",
        "language": "python"
    }
    response = client.post("/api/review", json=payload)
    assert response.status_code == 422  # Pydantic validation error returns 422
