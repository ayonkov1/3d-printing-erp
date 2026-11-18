from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_endpoint_is_not_exposed():
    response = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "secret123"},
    )

    assert response.status_code == 404


def test_no_api_route_creates_users():
    user_creation_routes = [
        (route.path, sorted(route.methods))
        for route in app.routes
        if isinstance(route, APIRoute)
        and route.path.rstrip("/") in {"/api/auth/register", "/api/users"}
        and route.methods & {"POST", "PUT"}
    ]

    assert user_creation_routes == []
