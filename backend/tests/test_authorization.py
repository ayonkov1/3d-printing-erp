"""
Authorization Tests

Best practice: Test authorization like you test money movement.
- Test the policy surface, not just happy paths
- Include tenant-boundary tests (if applicable)
- Test role escalation prevention
- Test edge cases (inactive users, missing roles)
"""

import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

from app.core.authorization import (
    Action,
    ROLE_PERMISSIONS,
    is_allowed,
    authorize,
    get_permissions_for_role,
    require_role,
    can_read_inventory,
    can_write_inventory,
    can_delete_inventory,
)
from app.models.user import User, UserRole


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def admin_user():
    """Create a mock admin user."""
    user = MagicMock(spec=User)
    user.id = "admin-123"
    user.email = "admin@example.com"
    user.role = UserRole.ADMIN
    user.is_active = True
    return user


@pytest.fixture
def member_user():
    """Create a mock member user."""
    user = MagicMock(spec=User)
    user.id = "member-123"
    user.email = "member@example.com"
    user.role = UserRole.USER
    user.is_active = True
    return user


@pytest.fixture
def viewer_user():
    """Create a mock viewer user."""
    user = MagicMock(spec=User)
    user.id = "viewer-123"
    user.email = "viewer@example.com"
    user.role = UserRole.VIEWER
    user.is_active = True
    return user


@pytest.fixture
def inactive_user():
    """Create a mock inactive user."""
    user = MagicMock(spec=User)
    user.id = "inactive-123"
    user.email = "inactive@example.com"
    user.role = UserRole.ADMIN  # Even admin if inactive
    user.is_active = False
    return user


# =============================================================================
# Role Permission Mapping Tests
# =============================================================================


class TestRolePermissions:
    """Test that role-permission mappings are correct."""

    def test_admin_has_all_permissions(self):
        """Admin should have all defined actions."""
        admin_perms = ROLE_PERMISSIONS[UserRole.ADMIN]
        all_actions = set(Action)

        # Admin should have every action
        assert admin_perms == all_actions, f"Admin missing: {all_actions - admin_perms}"

    def test_member_permissions(self):
        """Member should have read/write but not delete or user management."""
        member_perms = ROLE_PERMISSIONS[UserRole.USER]

        # Should have
        assert Action.READ_INVENTORY in member_perms
        assert Action.WRITE_INVENTORY in member_perms
        assert Action.READ_CATALOG in member_perms
        assert Action.WRITE_CATALOG in member_perms

        # Should NOT have
        assert Action.DELETE_INVENTORY not in member_perms
        assert Action.DELETE_CATALOG not in member_perms
        assert Action.WRITE_USERS not in member_perms
        assert Action.MANAGE_SETTINGS not in member_perms

    def test_viewer_is_read_only(self):
        """Viewer should only have read permissions."""
        viewer_perms = ROLE_PERMISSIONS[UserRole.VIEWER]

        # Should have read
        assert Action.READ_INVENTORY in viewer_perms
        assert Action.READ_CATALOG in viewer_perms

        # Should NOT have any write/delete
        for action in Action:
            if action.value.startswith(("write:", "delete:", "manage:")):
                assert action not in viewer_perms, f"Viewer should not have {action}"


# =============================================================================
# is_allowed() Tests
# =============================================================================


class TestIsAllowed:
    """Test the core is_allowed function."""

    @pytest.mark.parametrize(
        "role,action,expected",
        [
            # Admin can do everything
            (UserRole.ADMIN, Action.READ_INVENTORY, True),
            (UserRole.ADMIN, Action.WRITE_INVENTORY, True),
            (UserRole.ADMIN, Action.DELETE_INVENTORY, True),
            (UserRole.ADMIN, Action.MANAGE_SETTINGS, True),
            # Member can read/write but not delete
            (UserRole.USER, Action.READ_INVENTORY, True),
            (UserRole.USER, Action.WRITE_INVENTORY, True),
            (UserRole.USER, Action.DELETE_INVENTORY, False),
            (UserRole.MEMBER, Action.MANAGE_SETTINGS, False),
            # Viewer can only read
            (UserRole.VIEWER, Action.READ_INVENTORY, True),
            (UserRole.VIEWER, Action.WRITE_INVENTORY, False),
            (UserRole.VIEWER, Action.DELETE_INVENTORY, False),
        ],
    )
    def test_role_permissions(self, role, action, expected):
        """Test that role permissions are enforced correctly."""
        user = MagicMock(spec=User)
        user.role = role
        user.is_active = True

        assert is_allowed(user, action) == expected

    def test_inactive_user_denied(self, inactive_user):
        """Inactive users should be denied all actions."""
        # Even admin role should be denied if inactive
        assert is_allowed(inactive_user, Action.READ_INVENTORY) is False
        assert is_allowed(inactive_user, Action.WRITE_INVENTORY) is False

    def test_none_user_denied(self):
        """None user should be denied all actions."""
        assert is_allowed(None, Action.READ_INVENTORY) is False


# =============================================================================
# authorize() Tests
# =============================================================================


class TestAuthorize:
    """Test the authorize enforcement function."""

    def test_authorize_allows_valid_action(self, admin_user):
        """Should not raise when action is allowed."""
        # Should not raise
        authorize(admin_user, Action.DELETE_INVENTORY)

    def test_authorize_raises_403_when_denied(self, viewer_user):
        """Should raise 403 when action is denied."""
        with pytest.raises(HTTPException) as exc_info:
            authorize(viewer_user, Action.DELETE_INVENTORY)

        assert exc_info.value.status_code == 403
        assert "Permission denied" in exc_info.value.detail

    def test_authorize_raises_403_for_inactive(self, inactive_user):
        """Should raise 403 for inactive users."""
        with pytest.raises(HTTPException) as exc_info:
            authorize(inactive_user, Action.READ_INVENTORY)

        assert exc_info.value.status_code == 403


# =============================================================================
# Convenience Function Tests
# =============================================================================


class TestConvenienceFunctions:
    """Test helper functions for common permission checks."""

    def test_can_read_inventory(self, admin_user, member_user, viewer_user):
        """All roles should be able to read inventory."""
        assert can_read_inventory(admin_user) is True
        assert can_read_inventory(member_user) is True
        assert can_read_inventory(viewer_user) is True

    def test_can_write_inventory(self, admin_user, member_user, viewer_user):
        """Only admin and member can write inventory."""
        assert can_write_inventory(admin_user) is True
        assert can_write_inventory(member_user) is True
        assert can_write_inventory(viewer_user) is False

    def test_can_delete_inventory(self, admin_user, member_user, viewer_user):
        """Only admin can delete inventory."""
        assert can_delete_inventory(admin_user) is True
        assert can_delete_inventory(member_user) is False
        assert can_delete_inventory(viewer_user) is False


# =============================================================================
# require_role() Tests
# =============================================================================


class TestRequireRole:
    """Test the role-based requirement function."""

    def test_admin_passes_admin_requirement(self, admin_user):
        """Admin should pass admin requirement."""
        require_role(admin_user, UserRole.ADMIN)  # Should not raise

    def test_member_fails_admin_requirement(self, member_user):
        """Member should fail admin requirement."""
        with pytest.raises(HTTPException) as exc_info:
            require_role(member_user, UserRole.ADMIN)

        assert exc_info.value.status_code == 403

    def test_viewer_fails_member_requirement(self, viewer_user):
        """Viewer should fail member requirement."""
        with pytest.raises(HTTPException) as exc_info:
            require_role(viewer_user, UserRole.MEMBER)

        assert exc_info.value.status_code == 403

    def test_admin_passes_viewer_requirement(self, admin_user):
        """Higher role should pass lower role requirement."""
        require_role(admin_user, UserRole.VIEWER)  # Should not raise


# =============================================================================
# Edge Cases and Security Tests
# =============================================================================


class TestSecurityEdgeCases:
    """Test security edge cases and potential attack vectors."""

    def test_unknown_role_denied(self):
        """Users with unknown/missing role should be denied."""
        user = MagicMock(spec=User)
        user.role = "hacker"  # Invalid role
        user.is_active = True

        # Should be denied (fail closed)
        assert is_allowed(user, Action.READ_INVENTORY) is False

    def test_role_escalation_prevented(self, viewer_user):
        """Ensure viewer cannot access admin-only actions."""
        admin_only_actions = [
            Action.DELETE_INVENTORY,
            Action.DELETE_CATALOG,
            Action.WRITE_USERS,
            Action.DELETE_USERS,
            Action.MANAGE_SETTINGS,
        ]

        for action in admin_only_actions:
            assert (
                is_allowed(viewer_user, action) is False
            ), f"Viewer should not have {action}"

    def test_get_permissions_for_unknown_role(self):
        """Unknown role should return empty permissions (deny by default)."""
        # Simulate an unknown role
        perms = get_permissions_for_role("unknown_role")
        assert perms == set()
