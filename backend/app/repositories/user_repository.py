from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email (case-insensitive)"""
        return self.db.query(User).filter(User.email.ilike(email)).first()

    def find_by_id(self, user_id: str) -> Optional[User]:
        """Find user by ID"""
        return self.get_by_id(user_id)

    def find_all(self) -> List[User]:
        """Get all users"""
        return self.db.query(User).order_by(User.created_at.desc()).all()

    def count_users(self) -> int:
        """Count total number of users"""
        return self.db.query(User).count()

    def create_user(
        self,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        role: UserRole = UserRole.USER,
    ) -> User:
        """Create a new user with specified role."""
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
        )
        return self.create(new_user)
