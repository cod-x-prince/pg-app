-- Add PasswordResetToken table for secure password reset flow
-- Tokens are hashed before storage for security

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS "idx_password_reset_token" ON "PasswordResetToken"("token");

-- Index for email lookup (to delete old tokens)
CREATE INDEX IF NOT EXISTS "idx_password_reset_email" ON "PasswordResetToken"("email");

-- Index for cleanup query (expired tokens)
CREATE INDEX IF NOT EXISTS "idx_password_reset_expires" ON "PasswordResetToken"("expiresAt");

-- Note: Run this migration with:
-- npx prisma db execute --file prisma/migrations/add_password_reset.sql
