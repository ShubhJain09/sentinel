'use server';

import { z } from 'zod';
import crypto from 'crypto';
import {
  getDb,
  generateId,
  now,
  getUserById,
  createLoginChallenge,
  getLoginChallenge,
  incrementLoginChallengeAttempts,
  markLoginChallengeUsed,
  invalidateUserLoginChallenges,
  updateLoginChallengeOtp,
} from '@/app/lib/db';
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  createLoginChallengeToken,
  setLoginChallengeCookie,
  getLoginChallengeSession,
  clearLoginChallengeCookie,
  maskEmail,
  getConfiguredOwnerEmails,
} from '@/app/lib/auth';
import { sendLoginOtpEmail } from '@/app/lib/email';
import type { UserRole } from '@/app/lib/types';
import { redirect } from 'next/navigation';

const passwordPolicySchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' });

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: passwordPolicySchema,
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | undefined;

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || 'Validation error' };
  }

  const { name, password } = result.data;
  const email = result.data.email.trim().toLowerCase();

  try {
    const db = getDb();

    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Designated owner or first user becomes owner
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const ownerEmails = getConfiguredOwnerEmails();
    const isDesignatedOwner = ownerEmails.includes(email.toLowerCase().trim());
    const role: UserRole = isDesignatedOwner || userCount === 0 ? 'owner' : 'user';

    const hashedPassword = await hashPassword(password);
    const userId = generateId();
    const timestamp = now();

    // Every self-service account receives an isolated workspace. Existing users and
    // their data remain untouched; workspace sharing must be an explicit admin action.
    const workspaceId = generateId();

    // Generate avatar initials
    const nameParts = name.trim().split(' ');
    const avatarInitials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();

    db.transaction(() => {
      db.prepare('INSERT INTO workspaces (id, name, ownerId, createdAt) VALUES (?, ?, ?, ?)').run(
        workspaceId, `${name.trim()}'s workspace`, userId, timestamp
      );
      db.prepare(`
        INSERT INTO users (id, email, name, passwordHash, role, avatarInitials, workspaceId, createdAt, updatedAt, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(userId, email, name.trim(), hashedPassword, role, avatarInitials, workspaceId, timestamp, timestamp);
      db.prepare(`
        INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
        VALUES (?, 'user.signup', ?, ?, 'user', ?, ?, ?)
      `).run(generateId(), userId, name.trim(), userId, 'Operator created an account', timestamp);
    })();

    await createSession({ userId, email, name, role, avatarInitials, workspaceId });
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }

  redirect('/onboarding/profile');
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || 'Validation error' };
  }

  const { email, password } = result.data;

  try {
    const db = getDb();

    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND isActive = 1').get(normalizedEmail) as {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
      role: UserRole;
      avatarInitials: string;
      workspaceId: string;
    } | undefined;

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    const timestamp = now();

    // 1. Audit event: password verified
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'login_password_verified', ?, ?, 'user', ?, 'Operator credentials successfully verified; initiating email OTP challenge', ?)
    `).run(generateId(), user.id, user.name, user.id, timestamp);

    // 2. Cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 3. Cryptographic SHA-256 hash for database storage (raw code never stored)
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // 4. Code expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 5. Persist challenge record in SQLite
    const { id: challengeId } = createLoginChallenge(user.id, otpHash, expiresAt);

    // 6. Base URL
    const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

    // 7. Dispatch verification code via configured email provider
    const emailResult = await sendLoginOtpEmail({
      to: user.email,
      otp: rawOtp,
      baseUrl: appUrl,
    });

    if (!emailResult.success) {
      console.error('[login] Failed to dispatch OTP email:', emailResult.error);
      invalidateUserLoginChallenges(user.id);
      return {
        success: false,
        error: "We couldn't send your verification code. Please try again.",
      };
    }

    // 8. Audit event: OTP dispatched
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'login_otp_sent', ?, ?, 'user', ?, 'Security verification code dispatched to operator email', ?)
    `).run(generateId(), user.id, user.name, user.id, now());

    // 9. Issue provisional challenge session cookie (10m maxAge)
    const masked = maskEmail(user.email);
    const challengeToken = await createLoginChallengeToken({
      challengeId,
      userId: user.id,
      maskedEmail: masked,
    });
    await setLoginChallengeCookie(challengeToken);
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }

  // Provisional challenge set — user must verify OTP before full session is issued
  redirect('/verify-login');
}

export async function verifyLoginOtp(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const challengeSession = await getLoginChallengeSession();
  if (!challengeSession || !challengeSession.challengeId) {
    return { success: false, error: 'Login session expired or invalid. Please sign in again.' };
  }

  const rawCode = formData.get('code');
  if (!rawCode || typeof rawCode !== 'string') {
    return { success: false, error: 'Please enter the verification code' };
  }

  const code = rawCode.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(code)) {
    return { success: false, error: 'Please enter a valid 6-digit code' };
  }

  const db = getDb();
  const timestamp = now();
  const challenge = getLoginChallenge(challengeSession.challengeId);

  if (!challenge || challenge.usedAt !== null) {
    return { success: false, error: 'The verification code is incorrect.' };
  }

  // Check code expiration
  if (new Date(challenge.expiresAt).getTime() < Date.now()) {
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'login_otp_expired', ?, 'system', 'security', ?, 'Expired OTP code presented during login verification', ?)
    `).run(generateId(), challenge.userId, challenge.userId, timestamp);

    return { success: false, error: 'This verification code has expired.' };
  }

  // Check rate limit: maximum 5 failed attempts per challenge
  if (challenge.attemptsCount >= 5) {
    await clearLoginChallengeCookie();
    invalidateUserLoginChallenges(challenge.userId);
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'login_otp_failed', ?, 'system', 'security', ?, 'Maximum failed OTP verification attempts exceeded; challenge invalidated', ?)
    `).run(generateId(), challenge.userId, challenge.userId, timestamp);

    return { success: false, error: 'Too many failed attempts. Please sign in again.' };
  }

  const computedHash = crypto.createHash('sha256').update(code).digest('hex');
  if (computedHash !== challenge.otpHash) {
    const attempts = incrementLoginChallengeAttempts(challenge.id);
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'login_otp_failed', ?, 'system', 'security', ?, 'Incorrect OTP code entered during login verification', ?)
    `).run(generateId(), challenge.userId, challenge.userId, timestamp);

    if (attempts >= 5) {
      await clearLoginChallengeCookie();
      invalidateUserLoginChallenges(challenge.userId);
      return { success: false, error: 'Too many failed attempts. Please sign in again.' };
    }

    return { success: false, error: 'The verification code is incorrect.' };
  }

  // OTP is valid!
  markLoginChallengeUsed(challenge.id);
  invalidateUserLoginChallenges(challenge.userId);

  const user = getUserById(challenge.userId);
  if (!user || !user.isActive) {
    await clearLoginChallengeCookie();
    return { success: false, error: 'Operator account could not be found or is inactive.' };
  }

  // Audit logs
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'login_otp_verified', ?, ?, 'user', ?, 'Email OTP successfully verified', ?)
  `).run(generateId(), user.id, user.name, user.id, timestamp);

  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'login_completed', ?, ?, 'user', ?, 'Operator authentication completed with two-factor email OTP', ?)
  `).run(generateId(), user.id, user.name, user.id, timestamp);

  // Clear challenge cookie
  await clearLoginChallengeCookie();

  // Role resolution
  const ownerEmails = getConfiguredOwnerEmails();
  let effectiveRole = user.role;
  if (ownerEmails.includes(user.email.toLowerCase()) && user.role !== 'owner') {
    effectiveRole = 'owner';
    db.prepare("UPDATE users SET role = 'owner', updatedAt = ? WHERE id = ?").run(timestamp, user.id);
  }

  // Establish full authenticated session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: effectiveRole,
    avatarInitials: user.avatarInitials,
    workspaceId: user.workspaceId,
    username: user.username,
    avatarUrl: user.avatarUrl,
  });

  const needsOnboarding = !user.isOnboarded;
  redirect(needsOnboarding ? '/onboarding/profile' : '/overview');
}

// Rate limiting map for OTP resends: challengeId -> lastSentTimestamp
const otpResendRateLimitMap = new Map<string, number>();

export async function resendLoginOtp(): Promise<ActionState> {
  const challengeSession = await getLoginChallengeSession();
  if (!challengeSession || !challengeSession.challengeId) {
    return { success: false, error: 'Login session expired or invalid. Please sign in again.' };
  }

  const lastSent = otpResendRateLimitMap.get(challengeSession.challengeId) || 0;
  const nowMs = Date.now();
  if (nowMs - lastSent < 30 * 1000) {
    const remaining = Math.ceil((30 * 1000 - (nowMs - lastSent)) / 1000);
    return { success: false, error: `Please wait ${remaining}s before requesting a new code.` };
  }

  const challenge = getLoginChallenge(challengeSession.challengeId);
  if (!challenge || challenge.usedAt !== null) {
    return { success: false, error: 'Challenge is no longer valid. Please sign in again.' };
  }

  const user = getUserById(challengeSession.userId);
  if (!user || !user.isActive) {
    return { success: false, error: 'Operator account not found.' };
  }

  // 1. Generate new 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // 2. Update challenge record
  updateLoginChallengeOtp(challenge.id, otpHash, expiresAt);
  otpResendRateLimitMap.set(challenge.id, nowMs);

  // 3. Send email
  const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const emailResult = await sendLoginOtpEmail({
    to: user.email,
    otp: rawOtp,
    baseUrl: appUrl,
  });

  if (!emailResult.success) {
    return { success: false, error: "We couldn't send your verification code. Please try again." };
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'login_otp_resent', ?, ?, 'user', ?, 'Security verification code resent to operator email', ?)
  `).run(generateId(), user.id, user.name, user.id, now());

  return { success: true, message: 'A new verification code has been sent.' };
}

export async function cancelLoginChallenge() {
  await clearLoginChallengeCookie();
  redirect('/login');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

// ── Modular Re-Exports (Ensures 100% Backwards Compatibility) ────────────────
// These functions are implemented in dedicated, single-responsibility modules:
// - `app/actions/profile.ts`: Profile management & in-app security
// - `app/actions/password-reset.ts`: Public password recovery flow
// Next.js 16 requires explicit async function declarations in "use server" files.

import * as profileModule from '@/app/actions/profile';
import * as passwordResetModule from '@/app/actions/password-reset';

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  return profileModule.updateProfile(prevState, formData);
}

export async function changePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  return profileModule.changePassword(prevState, formData);
}

export async function requestPasswordResetFromProfile(): Promise<ActionState> {
  return profileModule.requestPasswordResetFromProfile();
}

export async function forgotPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  return passwordResetModule.forgotPassword(prevState, formData);
}

export async function validateResetToken(rawToken: string | null | undefined): Promise<{
  valid: boolean;
  reason?: 'missing' | 'invalid_format' | 'used_or_invalid' | 'expired';
}> {
  return passwordResetModule.validateResetToken(rawToken);
}

export async function resetPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  return passwordResetModule.resetPassword(prevState, formData);
}
