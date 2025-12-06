from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email (case-insensitive)"""
        return self.db.query(User).filter(User.email.ilike(email)).first()

    def create_user(
        self, email: str, hashed_password: str, full_name: Optional[str] = None
    ) -> User:
        """Create a new user"""
        new_user = User(
            email=email, hashed_password=hashed_password, full_name=full_name
        )
        return self.create(new_user)
