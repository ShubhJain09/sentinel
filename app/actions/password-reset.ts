'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { redirect } from 'next/navigation';
import {
  getDb,
  generateId,
  now,
  getUserById,
  createPasswordResetToken,
  getPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
  invalidateAllUserResetTokens,
  updateUserPassword,
} from '@/app/lib/db';
import { hashPassword, createSession } from '@/app/lib/auth';
import { sendPasswordResetEmail } from '@/app/lib/email';
import type { ActionState } from '@/app/actions/auth';

const passwordPolicySchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' });

/**
 * ==============================================================================
 * SENTINEL — PUBLIC PASSWORD RECOVERY & RESET ACTIONS
 * ==============================================================================
 *
 * Responsibilities:
 * 1. forgotPassword: Rate-limited email submission that generates a 60-minute
 *    cryptographic reset token and dispatches an email without account enumeration.
 * 2. validateResetToken: Validates format, database record, used state, and expiry.
 * 3. resetPassword: Sets new password, hashes with bcrypt (cost 10), updates SQLite,
 *    invalidates all tokens, and auto-logs the operator in directly to /overview.
 * ==============================================================================
 */

// Rate limiting map: email -> timestamps[]
const resetRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_RESET_REQUESTS_PER_WINDOW = 5;

function checkResetRateLimit(email: string): boolean {
  const currentTime = Date.now();
  const timestamps = resetRateLimitMap.get(email) || [];
  const validTimestamps = timestamps.filter((t) => currentTime - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_RESET_REQUESTS_PER_WINDOW) {
    resetRateLimitMap.set(email, validTimestamps);
    return true; // rate limited
  }

  validTimestamps.push(currentTime);
  resetRateLimitMap.set(email, validTimestamps);
  return false;
}

export async function forgotPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rawEmail = formData.get('email');
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { success: false, error: 'Please enter your email address' };
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(normalizedEmail);
  if (!result.success) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  // Generic anti-enumeration response (never reveal if email exists)
  const genericResponse: ActionState = {
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.',
  };

  const db = getDb();
  const timestamp = now();

  // Rate limiting check
  if (checkResetRateLimit(normalizedEmail)) {
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_reset_rate_limited', 'anonymous', 'system', 'security', ?, 'Rate limit reached for password reset requests', ?)
    `).run(generateId(), normalizedEmail, timestamp);
    return genericResponse;
  }

  // Safe user lookup (prevent account enumeration)
  const user = db.prepare('SELECT id, email, name, isActive FROM users WHERE email = ? COLLATE NOCASE').get(normalizedEmail) as {
    id: string;
    email: string;
    name: string;
    isActive: number;
  } | undefined;

  if (!user || !user.isActive) {
    // Record anonymous audit event without revealing user status
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_reset_requested_unknown_email', 'anonymous', 'system', 'security', 'unregistered_target', 'Password reset requested for non-existent or inactive email', ?)
    `).run(generateId(), timestamp);
    return genericResponse;
  }

  try {
    // 1. Generate high-entropy 256-bit cryptographic token (64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Compute cryptographic SHA-256 hash for database storage (never store raw token)
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 3. Expiry: 60 minutes
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 4. Invalidate prior tokens and persist new token hash
    createPasswordResetToken(user.id, tokenHash, expiresAt);

    // 5. Construct secure reset URL using environment-configured base URL
    const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // 6. Dispatch transactional email
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      baseUrl: appUrl,
    });

    // 7. Audit log
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_reset_requested', ?, ?, 'user', ?, 'Password reset email dispatched to operator', ?)
    `).run(generateId(), user.id, user.name, user.id, timestamp);

    return genericResponse;
  } catch (error: any) {
    console.error('[forgotPassword] Error generating reset request:', error?.message || error);
    return genericResponse;
  }
}

export async function validateResetToken(rawToken: string | null | undefined): Promise<{
  valid: boolean;
  reason?: 'missing' | 'invalid_format' | 'used_or_invalid' | 'expired';
}> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { valid: false, reason: 'missing' };
  }

  const trimmed = rawToken.trim();
  if (trimmed.length !== 64 || !/^[0-9a-fA-F]+$/.test(trimmed)) {
    return { valid: false, reason: 'invalid_format' };
  }

  const tokenHash = crypto.createHash('sha256').update(trimmed).digest('hex');
  const tokenRecord = getPasswordResetTokenByHash(tokenHash);

  if (!tokenRecord || tokenRecord.usedAt !== null) {
    return { valid: false, reason: 'used_or_invalid' };
  }

  if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true };
}

export async function resetPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = formData.get('token');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Invalid or missing reset token. Please request a new link.' };
  }

  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Please enter a new password' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  const passwordValidation = passwordPolicySchema.safeParse(password);
  if (!passwordValidation.success) {
    return {
      success: false,
      error: passwordValidation.error.issues[0]?.message || 'Password does not meet requirements',
    };
  }

  const trimmedToken = token.trim();
  if (trimmedToken.length !== 64 || !/^[0-9a-fA-F]+$/.test(trimmedToken)) {
    return {
      success: false,
      error: 'This reset link is invalid or has already been used. Please request a new link.',
    };
  }

  const tokenHash = crypto.createHash('sha256').update(trimmedToken).digest('hex');
  const tokenRecord = getPasswordResetTokenByHash(tokenHash);

  if (!tokenRecord || tokenRecord.usedAt !== null) {
    return {
      success: false,
      error: 'This reset link is invalid or has already been used. Please request a new link.',
    };
  }

  if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      error: 'This reset link has expired. Please request a new link.',
    };
  }

  const user = getUserById(tokenRecord.userId);
  if (!user || !user.isActive) {
    return {
      success: false,
      error: 'Operator account could not be found or is inactive.',
    };
  }

  const db = getDb();
  const timestamp = now();

  // 1. Hash the new password using bcrypt cost 10
  const hashedPassword = await hashPassword(password);

  // 2. Transactionally update password and invalidate all tokens for user
  updateUserPassword(user.id, hashedPassword);
  markPasswordResetTokenUsed(tokenRecord.id);
  invalidateAllUserResetTokens(user.id);

  // 3. Security Audit Logging
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'password_reset_completed', ?, ?, 'user', ?, 'Operator account password reset successfully completed', ?)
  `).run(generateId(), user.id, user.name, user.id, timestamp);

  // 4. Auto-login: Establish authenticated Sentinel session directly
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarInitials: user.avatarInitials,
    workspaceId: user.workspaceId,
    username: user.username,
    avatarUrl: user.avatarUrl,
  });

  // 5. Seamless redirect directly to overview (no second manual login)
  redirect('/overview');
}
