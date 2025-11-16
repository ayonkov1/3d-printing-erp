from app.repositories.color_repository import ColorRepository
from app.models.color import Color


# This service will use the ColorRepository to implement business logic related to colors. I want to use it in order to simplify color management in the application.
class ColorService:
    """Business logic for colors"""

    def __init__(self, color_repo: ColorRepository):
        self.color_repo = color_repo

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
