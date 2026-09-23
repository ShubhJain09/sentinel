'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { getDb, generateId, now, getUserById, updateUserPassword, invalidateAllUserResetTokens, invalidateUserLoginChallenges, createPasswordResetToken } from '@/app/lib/db';
import { getSession, createSession, hashPassword, verifyPassword } from '@/app/lib/auth';
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
 * SENTINEL — OPERATOR PROFILE & IN-APP SECURITY ACTIONS
 * ==============================================================================
 *
 * Responsibilities:
 * 1. updateProfile: Updates display name, bio, date of birth (18+ verification),
 *    avatar URL, location, and validated social links.
 * 2. changePassword: Authenticated operator password rotation with current password
 *    verification and automatic token invalidation.
 * 3. requestPasswordResetFromProfile: Dispatches a password reset email link from
 *    within the operator's security profile.
 * ==============================================================================
 */

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
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

  // Strict HTTPS URL validation helper to prevent javascript: or data: injection
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

  // Enforce 18+ operator requirement
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

    // Refresh JWT session cookie with latest operator metadata
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

  // 1. Verify current password server-side using bcrypt
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
    // Generate secure 256-bit cryptographic reset token
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
