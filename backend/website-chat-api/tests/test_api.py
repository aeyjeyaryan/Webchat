from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_crawl_invalid_url():
    response = client.post("/crawl", json={"url": "invalid-url"})
    assert response.status_code == 422