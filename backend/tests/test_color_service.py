import pytest
from app.models.color import Color


def test_find_or_create_new_color(color_service, db):
    """Test creating a new color"""
    color = color_service.find_or_create("Red", "#FF0000")

    assert color.id is not None
    assert color.name == "Red"
    assert color.hex_code == "#FF0000"

    # Verify it's in database
    db_color = db.query(Color).filter(Color.name == "Red").first()
    assert db_color is not None
    assert db_color.id == color.id


def test_find_or_create_existing_color(color_service, db):
    """Test finding existing color (no duplicate creation)"""
    # Create first time
    color1 = color_service.find_or_create("Blue", "#0000FF")

    # Try to create again
    color2 = color_service.find_or_create("Blue", "#0000FF")

    # Should return same color
    assert color1.id == color2.id

    # Verify only one exists in DB
    count = db.query(Color).filter(Color.name == "Blue").count()
    assert count == 1


def test_find_or_create_case_insensitive(color_service):
    """Test that color matching is case-insensitive"""
    color1 = color_service.find_or_create("Green", "#00FF00")
    color2 = color_service.find_or_create("green", "#00FF00")
    color3 = color_service.find_or_create("GREEN", "#00FF00")

    assert color1.id == color2.id == color3.id
