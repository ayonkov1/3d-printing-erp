"""Tests for inventory API endpoints"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.dependencies import get_db
from tests.conftest import TestingSessionLocal, Base, engine

# Import all models
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
from app.models.inventory import Inventory
from app.models.status import Status
from app.models.category import Category
from app.models.trade_name import TradeName

# Create tables
Base.metadata.create_all(bind=engine)


# Override dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def create_test_spool(barcode: str = "INV-TEST-001") -> dict:
    """Helper to create a spool for inventory tests"""
    response = client.post(
        "/api/spools/",
        json={
            "barcode": barcode,
            "base_weight": 1000.0,
            "is_box": False,
            "thickness": 1.75,
            "spool_return": True,
            "color_name": "Inventory Test Blue",
            "color_hex_code": "#0066CC",
            "brand_name": "TestBrand",
            "material_name": "PLA",
        },
    )
    return response.json()


def test_add_to_inventory():
    """Test adding a spool to inventory"""
    spool = create_test_spool("INV-001")

    response = client.post(
        "/api/inventory/",
        json={
            "spool_id": spool["id"],
            "weight": 1000.0,
            "is_in_use": False,
            "status_name": "in_stock",
        },
    )

    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")

    assert response.status_code == 201
    data = response.json()

    assert data["spool"]["id"] == spool["id"]
    assert data["weight"] == 1000.0
    assert data["is_in_use"] is False
    assert data["status"]["name"] == "in_stock"
    assert "id" in data
    assert "created_at" in data


def test_add_to_inventory_uses_base_weight():
    """Test that inventory uses spool's base_weight when weight not provided"""
    spool = create_test_spool("INV-002")

    response = client.post(
        "/api/inventory/",
        json={
            "spool_id": spool["id"],
            # weight not provided
            "status_name": "in_stock",
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data["weight"] == spool["base_weight"]  # Should use 1000.0


def test_add_to_inventory_invalid_spool():
    """Test adding inventory with non-existent spool"""
    response = client.post(
        "/api/inventory/",
        json={
            "spool_id": "non-existent-id",
            "status_name": "in_stock",
        },
    )

    assert response.status_code == 400
    assert "not found" in response.json()["detail"]


def test_get_all_inventory():
    """Test getting all inventory items"""
    spool = create_test_spool("INV-003")

    # Add some inventory
    client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "status_name": "in_stock"},
    )

    response = client.get("/api/inventory/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # Verify structure
    item = data[0]
    assert "spool" in item
    assert "status" in item
    assert "weight" in item


def test_get_inventory_by_id():
    """Test getting inventory by ID"""
    spool = create_test_spool("INV-004")

    create_response = client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "status_name": "in_stock"},
    )
    inventory_id = create_response.json()["id"]

    response = client.get(f"/api/inventory/{inventory_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == inventory_id


def test_get_inventory_by_id_not_found():
    """Test getting non-existent inventory"""
    response = client.get("/api/inventory/non-existent-id")

    assert response.status_code == 404


def test_get_inventory_by_spool():
    """Test getting inventory items for a specific spool type"""
    spool = create_test_spool("INV-005")

    # Add multiple inventory items
    for _ in range(3):
        client.post(
            "/api/inventory/",
            json={"spool_id": spool["id"], "status_name": "in_stock"},
        )

    response = client.get(f"/api/inventory/by-spool/{spool['id']}")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    for item in data:
        assert item["spool"]["id"] == spool["id"]


def test_get_in_use_inventory():
    """Test getting inventory items that are in use"""
    spool = create_test_spool("INV-006")

    # Add one in-use item
    client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "is_in_use": True, "status_name": "in_use"},
    )

    response = client.get("/api/inventory/in-use")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["is_in_use"] is True


def test_update_inventory():
    """Test updating inventory item"""
    spool = create_test_spool("INV-007")

    create_response = client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "weight": 1000.0, "status_name": "in_stock"},
    )
    inventory_id = create_response.json()["id"]

    # Update with new weight (simulating usage)
    response = client.patch(
        f"/api/inventory/{inventory_id}",
        json={"weight": 750.0},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 750.0


def test_update_inventory_status():
    """Test updating inventory status"""
    spool = create_test_spool("INV-008")

    create_response = client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "status_name": "in_stock"},
    )
    inventory_id = create_response.json()["id"]

    # Mark as in use
    response = client.patch(
        f"/api/inventory/{inventory_id}",
        json={"status_name": "in_use", "is_in_use": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"]["name"] == "in_use"
    assert data["is_in_use"] is True


def test_update_inventory_not_found():
    """Test updating non-existent inventory"""
    response = client.patch(
        "/api/inventory/non-existent-id",
        json={"weight": 500.0},
    )

    assert response.status_code == 404


def test_delete_inventory():
    """Test deleting inventory item"""
    spool = create_test_spool("INV-009")

    create_response = client.post(
        "/api/inventory/",
        json={"spool_id": spool["id"], "status_name": "in_stock"},
    )
    inventory_id = create_response.json()["id"]

    # Delete
    response = client.delete(f"/api/inventory/{inventory_id}")

    assert response.status_code == 204

    # Verify it's gone
    get_response = client.get(f"/api/inventory/{inventory_id}")
    assert get_response.status_code == 404


def test_delete_inventory_not_found():
    """Test deleting non-existent inventory"""
    response = client.delete("/api/inventory/non-existent-id")

    assert response.status_code == 404


def test_count_by_spool():
    """Test counting inventory items by spool type"""
    spool = create_test_spool("INV-010")

    # Add 5 items
    for _ in range(5):
        client.post(
            "/api/inventory/",
            json={"spool_id": spool["id"], "status_name": "in_stock"},
        )

    response = client.get(f"/api/inventory/count/{spool['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 5


def test_inventory_with_custom_properties():
    """Test inventory with custom properties/notes"""
    spool = create_test_spool("INV-011")

    response = client.post(
        "/api/inventory/",
        json={
            "spool_id": spool["id"],
            "status_name": "in_use",
            "is_in_use": True,
            "custom_properties": "Loaded in Prusa MK4 #2",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["custom_properties"] == "Loaded in Prusa MK4 #2"
