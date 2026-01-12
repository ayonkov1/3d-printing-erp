-- Migration: Add role column to users table
-- Date: 2024-12-16
-- Description: Adds RBAC role support for authorization

-- Add role column with default value of 'member'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'member';

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update any existing users to have 'member' role (if they have NULL)
UPDATE users SET role = 'member' WHERE role IS NULL;

-- Add check constraint to ensure valid roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'member', 'viewer'));
    END IF;
END $$;

-- Grant first user admin role (optional - uncomment if needed)
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

COMMENT ON COLUMN users.role IS 'User role for RBAC authorization: admin, member, or viewer';
