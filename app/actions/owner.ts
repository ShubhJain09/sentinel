'use server';

import { getSession } from '@/app/lib/auth';
import { getDb, generateId, now, getUserById, createPasswordResetToken } from '@/app/lib/db';
import type { UserRole, Session } from '@/app/lib/types';
import { canSuspendUser, canTerminateUser } from '@/app/lib/permissions';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { sendPasswordResetEmail } from '@/app/lib/email';

function requireAdminOrOwner(session: Session | null): asserts session is Session & { role: 'owner' | 'admin' } {
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    throw new Error('Access denied: Administrator authorization required');
  }
}

function requireOwner(session: Session | null): asserts session is Session & { role: 'owner' } {
  if (!session || session.role !== 'owner') {
    throw new Error('Access denied: Owner authorization required');
  }
}

export async function inviteUser(formData: FormData) {
  const session = await getSession();
  requireAdminOrOwner(session);

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const name = (formData.get('name') as string)?.trim();
  let requestedRole = (formData.get('role') as UserRole) || 'user';

  // Admin can ONLY invite normal users; only Owner can invite Admins
  if (session.role === 'admin') {
    requestedRole = 'user';
  } else if (requestedRole !== 'admin' && requestedRole !== 'user') {
    requestedRole = 'user';
  }

  if (!email || !name) {
    return { success: false, error: 'Name and email are required' };
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return { success: false, error: 'User with this email already exists' };
  }

  const userId = generateId();
  const timestamp = now();
  const unusableRandomPassword = crypto.randomBytes(32).toString('base64url');
  const passwordHash = bcrypt.hashSync(unusableRandomPassword, 10);

  const nameParts = name.split(' ');
  const avatarInitials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();

  db.prepare(`
    INSERT INTO users (id, email, name, passwordHash, role, avatarInitials, workspaceId, createdAt, updatedAt, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(userId, email, name, passwordHash, requestedRole, avatarInitials, session.workspaceId, timestamp, timestamp);

  const auditId = generateId();
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'user.invited', ?, ?, 'user', ?, ?, ?)
  `).run(
    auditId,
    session.userId,
    session.name,
    userId,
    `Invited ${name} (${email}) with role ${requestedRole}`,
    timestamp
  );

  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
  createPasswordResetToken(userId, tokenHash, new Date(Date.now() + 60 * 60 * 1000).toISOString());
  const appUrl = (process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const delivery = await sendPasswordResetEmail({
    to: email,
    resetUrl: `${appUrl}/reset-password?token=${rawResetToken}`,
    baseUrl: appUrl,
  });

  if (!delivery.success) {
    // Do not leave behind an unreachable account when its one-time setup link
    // could not be delivered. The email failure log is intentionally retained.
    db.transaction(() => {
      db.prepare('DELETE FROM password_reset_tokens WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM audit_events WHERE id = ?').run(auditId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    })();
    return { success: false, error: 'Invitation could not be delivered. Configure transactional email and try again.' };
  }

  revalidatePath('/owner/users');
  return { success: true, message: 'Invitation created. The user must set a password through the emailed secure link.' };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getSession();
  // Strictly enforce that ONLY Owner can manage user roles (promotions/demotions)
  requireOwner(session);

  if (newRole === 'owner') {
    return { success: false, error: 'Cannot assign Platform Owner role' };
  }

  const db = getDb();
  const timestamp = now();

  const targetUser = getUserById(userId);
  if (!targetUser) {
    return { success: false, error: 'User not found' };
  }
  if (session.role !== 'owner' && targetUser.workspaceId !== session.workspaceId) {
    return { success: false, error: 'User not found' };
  }

  // Protect owner from demoting themselves if they are the only owner
  if (userId === session.userId) {
    const ownerCount = (db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "owner" AND isActive = 1').get() as { count: number }).count;
    if (ownerCount <= 1) {
      return { success: false, error: 'Cannot demote the sole platform owner' };
    }
  }

  db.prepare('UPDATE users SET role = ?, updatedAt = ? WHERE id = ?').run(newRole, timestamp, userId);

  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'user.role_changed', ?, ?, 'user', ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    userId,
    `Changed role of ${targetUser.name} (${targetUser.email}) from ${targetUser.role} to ${newRole}`,
    timestamp
  );

  revalidatePath('/owner/users');
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await getSession();
  requireAdminOrOwner(session);

  const targetUser = getUserById(userId);
  if (!targetUser) {
    return { success: false, error: 'User not found' };
  }
  if (session.role !== 'owner' && targetUser.workspaceId !== session.workspaceId) {
    return { success: false, error: 'User not found' };
  }

  // Hierarchy check:
  // - Cannot suspend self
  // - Target cannot be owner
  // - Admin CANNOT suspend another Admin
  if (!canSuspendUser(session.role, targetUser.role, session.userId === userId)) {
    if (targetUser.role === 'owner') {
      return { success: false, error: 'Platform Owner cannot be suspended' };
    }
    if (session.role === 'admin' && targetUser.role === 'admin') {
      return { success: false, error: 'Administrators cannot suspend other administrators' };
    }
    return { success: false, error: 'Cannot suspend your own account' };
  }

  const db = getDb();
  const newStatus = currentStatus ? 0 : 1;
  const timestamp = now();

  db.prepare('UPDATE users SET isActive = ?, updatedAt = ? WHERE id = ?').run(newStatus, timestamp, userId);

  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, ?, ?, ?, 'user', ?, ?, ?)
  `).run(
    generateId(),
    newStatus === 1 ? 'user.restored' : 'user.suspended',
    session.userId,
    session.name,
    userId,
    `${newStatus === 1 ? 'Restored' : 'Suspended'} user ${targetUser.name} (${targetUser.email})`,
    timestamp
  );

  revalidatePath('/owner/users');
  return { success: true, isActive: newStatus === 1 };
}

export async function terminateUser(userId: string) {
  const session = await getSession();
  requireAdminOrOwner(session);

  const targetUser = getUserById(userId);
  if (!targetUser) {
    return { success: false, error: 'User not found' };
  }
  if (session.role !== 'owner' && targetUser.workspaceId !== session.workspaceId) {
    return { success: false, error: 'User not found' };
  }

  // Hierarchy check:
  // - Cannot terminate self
  // - Target cannot be owner
  // - Admin CANNOT terminate another Admin
  if (!canTerminateUser(session.role, targetUser.role, session.userId === userId)) {
    if (targetUser.role === 'owner') {
      return { success: false, error: 'Platform Owner cannot be terminated' };
    }
    if (session.role === 'admin' && targetUser.role === 'admin') {
      return { success: false, error: 'Administrators cannot terminate other administrators' };
    }
    return { success: false, error: 'Cannot terminate your own account' };
  }

  const db = getDb();
  const timestamp = now();

  // Log audit event before deleting user
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'user.terminated', ?, ?, 'user', ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    userId,
    `Terminated account for ${targetUser.name} (${targetUser.email})`,
    timestamp
  );

  // Clean up dependent child records
  db.prepare('DELETE FROM login_challenges WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM password_reset_tokens WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM passkeys WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM connected_accounts WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM notifications WHERE userId = ?').run(userId);
  db.prepare('DELETE FROM user_settings WHERE userId = ?').run(userId);

  // Delete user record
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);

  revalidatePath('/owner/users');
  return { success: true };
}
