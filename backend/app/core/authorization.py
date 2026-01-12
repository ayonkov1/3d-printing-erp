"""
Centralized Authorization Module

This module implements authorization best practices:
1. Centralized policy definitions (single source of truth)
2. Declarative permission mapping (RBAC model)
3. Model-agnostic enforcement layer
4. Audit logging for all authorization decisions
5. Deny by default

Based on: https://workos.com/blog/python-authorization-best-practices
"""

import logging
from enum import Enum
from typing import Optional, Any
from fastapi import HTTPException, status

from app.models.user import User, UserRole

# Configure authorization logger
authz_logger = logging.getLogger("authorization")


class Action(str, Enum):
    """
    Declarative permission actions.

    Using the format "verb:resource" makes it easy to:
    - Audit what actions exist
    - Map roles to permissions clearly
    - Evolve from RBAC to ABAC later
    """

    # Inventory actions
    READ_INVENTORY = "read:inventory"
    WRITE_INVENTORY = "write:inventory"
    DELETE_INVENTORY = "delete:inventory"

    # Catalog actions (colors, brands, materials, spools, etc.)
    READ_CATALOG = "read:catalog"
    WRITE_CATALOG = "write:catalog"
    DELETE_CATALOG = "delete:catalog"

    # User management actions
    READ_USERS = "read:users"
    WRITE_USERS = "write:users"
    DELETE_USERS = "delete:users"

    # Admin actions
    MANAGE_SETTINGS = "manage:settings"


# Declarative Role-Permission Mapping
# This is the single source of truth for what each role can do
ROLE_PERMISSIONS: dict[UserRole, set[Action]] = {
    UserRole.ADMIN: {
        # Admins can do everything
        Action.READ_INVENTORY,
        Action.WRITE_INVENTORY,
        Action.DELETE_INVENTORY,
        Action.READ_CATALOG,
        Action.WRITE_CATALOG,
        Action.DELETE_CATALOG,
        Action.READ_USERS,
        Action.WRITE_USERS,
        Action.DELETE_USERS,
        Action.MANAGE_SETTINGS,
    },
    UserRole.USER: {
        # Users can read/write inventory and catalog, but not delete or manage users
        Action.READ_INVENTORY,
        Action.WRITE_INVENTORY,
        Action.READ_CATALOG,
        Action.WRITE_CATALOG,
    },
    UserRole.VIEWER: {
        # Viewers have read-only access
        Action.READ_INVENTORY,
        Action.READ_CATALOG,
    },
}


def get_permissions_for_role(role: UserRole) -> set[Action]:
    """Get all permissions for a given role."""
    return ROLE_PERMISSIONS.get(role, set())


def is_allowed(
    user: User,
    action: Action,
    resource: Optional[Any] = None,
) -> bool:
    """
    Core authorization check - determines if a user can perform an action.

    This is the model-agnostic enforcement layer that:
    1. Currently implements RBAC (role-based)
    2. Can evolve to ABAC (add resource/attribute checks) without changing API
    3. Always returns a boolean - never throws

    Args:
        user: The authenticated user
        action: The action being attempted
        resource: Optional resource for future ABAC support

    Returns:
        True if allowed, False otherwise
    """
    if not user or not user.is_active:
        return False

    # RBAC check: Does the user's role have this permission?
    user_permissions = ROLE_PERMISSIONS.get(user.role, set())
    allowed = action in user_permissions

    # Future: Add ABAC checks here
    # Example: if resource and hasattr(resource, 'owner_id'):
    #     allowed = allowed or resource.owner_id == user.id

    return allowed


def authorize(
    user: User,
    action: Action,
    resource: Optional[Any] = None,
    resource_id: Optional[str] = None,
) -> None:
    """
    Enforce authorization - raises exception if not allowed.

    This is the main entry point for authorization checks.
    It wraps is_allowed() and:
    1. Logs the authorization decision (audit trail)
    2. Raises appropriate HTTP exceptions
    3. Provides clear error messages

    Args:
        user: The authenticated user
        action: The action being attempted
        resource: Optional resource object
        resource_id: Optional resource ID for logging

    Raises:
        HTTPException: 403 Forbidden if not authorized
    """
    allowed = is_allowed(user, action, resource)

    # Audit logging - log every authorization decision
    log_authz_decision(
        user=user,
        action=action,
        resource_id=resource_id
        or (getattr(resource, "id", None) if resource else None),
        allowed=allowed,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied: {action.value} requires higher privileges",
        )


def log_authz_decision(
    user: User,
    action: Action,
    resource_id: Optional[str],
    allowed: bool,
) -> None:
    """
    Log authorization decisions for audit trail.

    Best practice: Record who tried to do what, on which resource,
    and what was decided. This helps with:
    - Security audits
    - Debugging access issues
    - Compliance requirements
    - Detecting abuse patterns
    """
    log_data = {
        "event": "authz_decision",
        "user_id": user.id if user else None,
        "user_email": user.email if user else None,
        "user_role": user.role.value if user and user.role else None,
        "action": action.value,
        "resource_id": resource_id,
        "allowed": allowed,
    }

    if allowed:
        authz_logger.info("Authorization allowed", extra=log_data)
    else:
        # Log denials at warning level - these are important security signals
        authz_logger.warning("Authorization denied", extra=log_data)


def require_role(user: User, required_role: UserRole) -> None:
    """
    Simple role-based check for cases where you need a specific role.

    Note: Prefer using authorize() with Actions for most cases,
    as it's more granular and auditable.
    """
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    role_hierarchy = {
        UserRole.VIEWER: 0,
        UserRole.MEMBER: 1,
        UserRole.ADMIN: 2,
    }

    if role_hierarchy.get(user.role, -1) < role_hierarchy.get(required_role, 999):
        authz_logger.warning(
            "Role check failed",
            extra={
                "user_id": user.id,
                "user_role": user.role.value,
                "required_role": required_role.value,
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This action requires {required_role.value} role or higher",
        )


# Convenience functions for common checks
def can_read_inventory(user: User) -> bool:
    """Check if user can read inventory."""
    return is_allowed(user, Action.READ_INVENTORY)


def can_write_inventory(user: User) -> bool:
    """Check if user can write to inventory."""
    return is_allowed(user, Action.WRITE_INVENTORY)


def can_delete_inventory(user: User) -> bool:
    """Check if user can delete from inventory."""
    return is_allowed(user, Action.DELETE_INVENTORY)


def can_manage_users(user: User) -> bool:
    """Check if user can manage other users."""
    return is_allowed(user, Action.WRITE_USERS)
