'use server';

import { z } from 'zod';
import crypto from 'crypto';
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
} from '@/app/lib/auth';
import { sendPasswordResetEmail, sendLoginOtpEmail } from '@/app/lib/email';
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

  const { name, email, password } = result.data;

  try {
    const db = getDb();

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Designated owner or first user becomes owner
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    const isDesignatedOwner = ownerEmails.includes(email.toLowerCase().trim());
    const role: UserRole = isDesignatedOwner || userCount === 0 ? 'owner' : 'user';

    const hashedPassword = await hashPassword(password);
    const userId = generateId();
    const timestamp = now();

    // Get or create workspace
    let workspaceId: string;
    const existingWorkspace = db.prepare('SELECT id FROM workspaces LIMIT 1').get() as { id: string } | undefined;
    
    if (existingWorkspace) {
      workspaceId = existingWorkspace.id;
    } else {
      workspaceId = generateId();
      db.prepare('INSERT INTO workspaces (id, name, ownerId, createdAt) VALUES (?, ?, ?, ?)').run(
        workspaceId, 'Personal workspace', userId, timestamp
      );
    }

    // Generate avatar initials
    const nameParts = name.trim().split(' ');
    const avatarInitials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();

    // Insert user with camelCase column names matching schema
    db.prepare(`
      INSERT INTO users (id, email, name, passwordHash, role, avatarInitials, workspaceId, createdAt, updatedAt, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(userId, email, name, hashedPassword, role, avatarInitials, workspaceId, timestamp, timestamp);

    // Log audit event
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'user.signup', ?, ?, 'user', ?, ?, ?)
    `).run(generateId(), userId, name, userId, `${name} created an account`, timestamp);

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

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1').get(email) as {
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
      email: user.email,
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
  const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
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

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { getSession } = await import('@/app/lib/auth');
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: No active session' };
  }

  const name = formData.get('name')?.toString().trim();
  const username = formData.get('username')?.toString().trim().toLowerCase();
  const bio = formData.get('bio')?.toString().trim();
  const dob = formData.get('dob')?.toString().trim();
  const avatarUrl = formData.get('avatarUrl')?.toString().trim();
  const website = formData.get('website')?.toString().trim();
  const github = formData.get('github')?.toString().trim();
  const linkedin = formData.get('linkedin')?.toString().trim();
  const instagram = formData.get('instagram')?.toString().trim();
  const xTwitter = formData.get('xTwitter')?.toString().trim();
  const location = formData.get('location')?.toString().trim();
  const rawSocialLinks = formData.get('socialLinks')?.toString().trim();

  // Strict HTTPS URL validation helper
  const validateHttpsUrl = (url: string): boolean => {
    if (!url) return true;
    const lower = url.toLowerCase().trim();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
      return false;
    }
    try {
      const candidate = lower.startsWith('http://') || lower.startsWith('https://') ? lower : `https://${lower}`;
      const parsed = new URL(candidate);
      return parsed.protocol === 'https:' && parsed.hostname.includes('.');
    } catch {
      return false;
    }
  };

  // Validate legacy social fields if provided
  const socialFields = [website, github, linkedin, instagram, xTwitter].filter(Boolean) as string[];
  for (const sf of socialFields) {
    if (!validateHttpsUrl(sf)) {
      return { success: false, error: 'Social links must be valid HTTPS URLs' };
    }
  }

  // Validate dynamic socialLinks JSON if provided
  let socialLinksJson: string | null = null;
  if (rawSocialLinks) {
    try {
      const parsedList = JSON.parse(rawSocialLinks);
      if (Array.isArray(parsedList)) {
        for (const item of parsedList) {
          if (item?.url && !validateHttpsUrl(item.url)) {
            return { success: false, error: `Invalid URL for ${item.platform || 'social link'}. Only valid HTTPS URLs are permitted.` };
          }
        }
        socialLinksJson = JSON.stringify(parsedList);
      }
    } catch {
      // Invalid JSON string - ignore
    }
  }

  if (!name || name.length < 2) {
    return { success: false, error: 'Display name must be at least 2 characters long' };
  }

  if (username) {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return { success: false, error: 'Username must be 3-30 characters and only contain letters, numbers, and underscores' };
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(username, session.userId);
    if (existing) {
      return { success: false, error: 'This username is already taken by another operator' };
    }
  }

  if (dob) {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return { success: false, error: 'Invalid Date of Birth format' };
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return { success: false, error: 'Age verification failed: Operator must be at least 18 years of age.' };
    }
  }

  try {
    const { updateUserProfile } = await import('@/app/lib/db');
    const timestamp = now();
    
    // Generate new initials if name changed
    const nameParts = name.split(' ');
    const avatarInitials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();

    updateUserProfile(session.userId, {
      name,
      avatarInitials,
      username: username || null,
      bio: bio || null,
      dob: dob || null,
      avatarUrl: avatarUrl || null,
      website: website || null,
      github: github || null,
      linkedin: linkedin || null,
      instagram: instagram || null,
      xTwitter: xTwitter || null,
      location: location || null,
      socialLinks: socialLinksJson || null,
      updatedAt: timestamp,
    });

    const db = getDb();
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'user.profile_update', ?, ?, 'user', ?, ?, ?)
    `).run(generateId(), session.userId, name, session.userId, `${name} updated operator profile credentials`, timestamp);

    // Refresh JWT session cookie
    await createSession({
      ...session,
      name,
      avatarInitials,
      username: username || null,
      avatarUrl: avatarUrl || null,
    });

    return { success: true, message: 'Operator profile updated successfully' };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

export async function changePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { getSession } = await import('@/app/lib/auth');
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Please sign in again.' };
  }

  const currentPassword = formData.get('currentPassword')?.toString() || '';
  const newPassword = formData.get('newPassword')?.toString() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString() || '';

  if (!currentPassword) {
    return { success: false, error: 'Please enter your current password' };
  }
  if (!newPassword) {
    return { success: false, error: 'Please enter a new password' };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  const policyCheck = passwordPolicySchema.safeParse(newPassword);
  if (!policyCheck.success) {
    return {
      success: false,
      error: policyCheck.error.issues[0]?.message || 'Password does not meet requirements',
    };
  }

  const db = getDb();
  const timestamp = now();
  const user = getUserById(session.userId);
  if (!user) {
    return { success: false, error: 'Operator account could not be found' };
  }

  // 1. Verify current password server-side
  const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_change_failed', ?, ?, 'user', ?, 'Invalid current password provided during password change attempt', ?)
    `).run(generateId(), user.id, user.name, user.id, timestamp);

    return { success: false, error: 'Current password is incorrect.' };
  }

  if (currentPassword === newPassword) {
    return { success: false, error: 'New password cannot be the same as your current password.' };
  }

  try {
    // 2. Hash new password with bcrypt salt cost 10
    const newHash = await hashPassword(newPassword);

    // 3. Atomically update database
    updateUserPassword(user.id, newHash);

    // 4. Invalidate outstanding reset tokens and challenges
    invalidateAllUserResetTokens(user.id);
    invalidateUserLoginChallenges(user.id);

    // 5. Audit event: password_changed
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_changed', ?, ?, 'user', ?, 'Operator successfully changed account password from profile', ?)
    `).run(generateId(), user.id, user.name, user.id, timestamp);

    // 6. Refresh active session
    await createSession({
      ...session,
    });

    return { success: true, message: 'Password updated successfully.' };
  } catch (err: any) {
    console.error('[changePassword] Error:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function requestPasswordResetFromProfile(): Promise<ActionState> {
  const { getSession } = await import('@/app/lib/auth');
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Please sign in again.' };
  }

  const user = getUserById(session.userId);
  if (!user || !user.isActive) {
    return {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    };
  }

  const db = getDb();
  const timestamp = now();

  try {
    // Generate secure reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    createPasswordResetToken(user.id, tokenHash, expiresAt);

    const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      baseUrl: appUrl,
    });

    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'password_reset_requested_from_profile', ?, ?, 'user', ?, 'Operator requested password reset link from security profile', ?)
    `).run(generateId(), user.id, user.name, user.id, timestamp);

    return {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    };
  } catch (error: any) {
    console.error('[requestPasswordResetFromProfile] Error:', error);
    return {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    };
  }
}

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

    // 2. Compute cryptographic SHA-256 hash for database storage
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

  // 4. Auto-login: Establish authenticated Sentinel session
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
