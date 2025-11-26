from typing import List
from app.repositories.color_repository import ColorRepository
from app.models.color import Color


# This service will use the ColorRepository to implement business logic related to colors. I want to use it in order to simplify color management in the application.
class ColorService:
    """Business logic for colors"""

    def __init__(self, color_repo: ColorRepository):
        self.color_repo = color_repo

    def get_all_colors(self, skip: int = 0, limit: int = 100) -> List[Color]:
        """Get all colors with pagination"""
        return self.color_repo.get_all(skip, limit)

    def get_color_by_id(self, color_id: str) -> Color:
        """Get a color by ID"""
        color = self.color_repo.get_by_id(color_id)
        if not color:
            raise ValueError(f"Color with id {color_id} not found")
        return color

    def create_color(self, name: str, hex_code: str) -> Color:
        """Create a new color"""
        # Check if color already exists
        existing = self.color_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Color '{name}' already exists")

        new_color = Color(name=name, hex_code=hex_code)
        return self.color_repo.create(new_color)

    def find_or_create(self, name: str, hex_code: str = "#000000") -> Color:
        """
        Find existing color by name, or create new one.

        Args:
            name: Color name
            hex_code: Hex color code (default black if not provided)

        Returns:
            Color object (existing or newly created)
        """
        return self.color_repo.find_or_create(name, hex_code)
