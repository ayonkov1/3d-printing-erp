import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.dependencies import get_db
from tests.conftest import TestingSessionLocal, Base, engine

# Import all models to register them with Base
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
from app.models.inventory import Inventory
from app.models.status import Status
from app.models.category import Category
from app.models.trade_name import TradeName

# Create tables once before setting up the client
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


def test_create_spool_success():
    """Test creating a spool catalog entry"""
    response = client.post(
        "/api/spools/",
        json={
            "barcode": "SP001",
            "base_weight": 1000.0,  # Standard weight in grams
            "is_box": False,
            "thickness": 1.75,
            "spool_return": True,
            "color_name": "Neon Green",
            "color_hex_code": "#39FF14",
            "brand_name": "Prusament",
            "material_name": "PLA",
        },
    )

    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")

    assert response.status_code == 201
    data = response.json()

    assert data["barcode"] == "SP001"
    assert data["base_weight"] == 1000.0
    assert data["color"]["name"] == "Neon Green"
    assert data["color"]["hex_code"] == "#39FF14"
    assert data["brand"]["name"] == "Prusament"
    assert data["material"]["name"] == "PLA"
    assert "id" in data
    assert "created_at" in data


def test_create_spool_duplicate_barcode():
    """Test that duplicate barcode is rejected"""
    # Create first spool
    client.post(
        "/api/spools/",
        json={
            "barcode": "SP002",
            "base_weight": 1000.0,
            "color_name": "Red",
            "color_hex_code": "#FF0000",
            "brand_name": "eSun",
            "material_name": "PETG",
        },
    )

    # Try to create duplicate
    response = client.post(
        "/api/spools/",
        json={
            "barcode": "SP002",
            "base_weight": 1000.0,
            "color_name": "Blue",
            "color_hex_code": "#0000FF",
            "brand_name": "eSun",
            "material_name": "PLA",
        },
    )

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_spools():
    """Test getting list of spools from catalog"""
    # Create test data
    client.post(
        "/api/spools/",
        json={
            "barcode": "SP003",
            "base_weight": 1000.0,
            "color_name": "Black",
            "color_hex_code": "#000000",
            "brand_name": "Prusament",
            "material_name": "PLA",
        },
    )

    # Get list
    response = client.get("/api/spools/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # Verify nested data structure
    spool = data[0]
    assert "color" in spool
    assert "name" in spool["color"]
    assert "hex_code" in spool["color"]
    assert "brand" in spool
    assert "material" in spool
    assert "base_weight" in spool


def test_create_spool_reuses_existing_lookup_data():
    """Test that creating spools reuses existing colors/brands/materials"""
    # Create first spool
    response1 = client.post(
        "/api/spools/",
        json={
            "barcode": "SP004",
            "base_weight": 1000.0,
            "color_name": "Orange",
            "color_hex_code": "#FFA500",
            "brand_name": "Polymaker",
            "material_name": "ABS",
        },
    )
    color_id_1 = response1.json()["color"]["id"]

    # Create second spool with same color
    response2 = client.post(
        "/api/spools/",
        json={
            "barcode": "SP005",
            "base_weight": 1000.0,
            "color_name": "Orange",  # Same color!
            "color_hex_code": "#FFA500",
            "brand_name": "Polymaker",  # Same brand!
            "material_name": "ABS",  # Same material!
        },
    )
    color_id_2 = response2.json()["color"]["id"]

    # Should reuse same color ID
    assert color_id_1 == color_id_2
