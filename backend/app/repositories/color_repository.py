from typing import Optional
from sqlalchemy.orm import Session
from app.models.color import Color
from app.repositories.base import BaseRepository


class ColorRepository(BaseRepository[Color]):
    def __init__(self, db: Session):
        super().__init__(Color, db)

    def find_by_name(self, name: str) -> Optional[Color]:
        """Find color by name (case-insensitive)"""
        return self.db.query(Color).filter(Color.name.ilike(name)).first()

    def find_or_create(self, name: str, hex_code: str) -> Color:
        """Find existing color or create new one"""
        color = self.find_by_name(name)
        if color:
            return color

        new_color = Color(name=name, hex_code=hex_code)
        return self.create(new_color)
