# app/services/color_service.py
from sqlalchemy.orm import Session
from app.models.color import Color
from app.schemas.color import ColorCreate


class ColorService:
    @staticmethod
    def create(db: Session, color_data: ColorCreate) -> Color:
        print(f"Creating color: {color_data.name} with hex {color_data.hex_code}")
        existing = db.query(Color).filter(Color.name == color_data.name).first()
        if existing:
            raise ValueError(f"Color '{color_data.name}' already exists")

        db_color = Color(**color_data.model_dump())
        db.add(db_color)
        db.commit()
        db.refresh(db_color)
        return db_color

    @staticmethod
    def get_all(db: Session) -> list[Color]:
        return db.query(Color).filter(Color.is_active == True).all()
