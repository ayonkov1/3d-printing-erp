"""
User Management API endpoints.

This module provides admin-only endpoints for managing users:
- List all users
- Update user roles
- Deactivate/reactivate users
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db
from app.services.auth_service import get_current_user
from app.core.authorization import Action, authorize
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserRoleEnum
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all users in the system.

    **Requires:** ADMIN role (READ_USERS permission)
    """
    # Strict authorization check
    authorize(current_user, Action.READ_USERS)

    user_repo = UserRepository(db)
    users = user_repo.find_all()

    return [UserResponse.model_validate(user) for user in users]


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role: UserRoleEnum,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update a user's role.

    **Requires:** ADMIN role (WRITE_USERS permission)

    - Cannot change own role (security measure)
    - Role must be valid enum value
    """
    # Strict authorization check
    authorize(current_user, Action.WRITE_USERS)

    # Prevent admins from changing their own role
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own role for security reasons",
        )

    user_repo = UserRepository(db)
    user = user_repo.find_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update role
    user.role = UserRole[role.name]
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Activate or deactivate a user.

    **Requires:** ADMIN role (DELETE_USERS permission for deactivation)

    - Cannot deactivate own account (security measure)
    - Deactivated users cannot log in
    """
    # Strict authorization check
    authorize(current_user, Action.DELETE_USERS)

    # Prevent admins from deactivating themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own account status for security reasons",
        )

    user_repo = UserRepository(db)
    user = user_repo.find_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update status
    user.is_active = is_active
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)
