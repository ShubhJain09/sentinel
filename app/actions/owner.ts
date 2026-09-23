'use server';

import { getSession } from '@/app/lib/auth';
import { getDb, generateId, now } from '@/app/lib/db';
import type { UserRole, Session } from '@/app/lib/types';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

function requireOwner(session: Session | null): asserts session is Session & { role: 'owner' } {
  if (!session || session.role !== 'owner') {
    throw new Error('Access denied: Owner authorization required');
  }
}

export async function inviteUser(formData: FormData) {
  const session = await getSession();
  requireOwner(session);

  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const name = (formData.get('name') as string)?.trim();
  const role = (formData.get('role') as UserRole) || 'analyst';

  if (!email || !name) {
    return { success: false, error: 'Name and email are required' };
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return { success: false, error: 'User with this email already exists' };
  }

  const userId = generateId();
  const timestamp = now();
  const tempPassword = `Sentinel${Math.floor(1000 + Math.random() * 9000)}!`;
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  const nameParts = name.split(' ');
  const avatarInitials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();

  db.prepare(`
    INSERT INTO users (id, email, name, passwordHash, role, avatarInitials, workspaceId, createdAt, updatedAt, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(userId, email, name, passwordHash, role, avatarInitials, session.workspaceId, timestamp, timestamp);

  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'user.invited', ?, ?, 'user', ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    userId,
    `Invited ${name} (${email}) with role ${role}`,
    timestamp
  );

  revalidatePath('/owner/users');
  return { success: true, tempPassword };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getSession();
  requireOwner(session);

  const db = getDb();
  const timestamp = now();

  // Protect owner from demoting themselves if they are the only owner
  if (userId === session.userId && newRole !== 'owner') {
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
    `Changed role of user ${userId} to ${newRole}`,
    timestamp
  );

  revalidatePath('/owner/users');
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await getSession();
  requireOwner(session);

  if (userId === session.userId) {
    return { success: false, error: 'Cannot suspend your own owner account' };
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
    `${newStatus === 1 ? 'Restored' : 'Suspended'} user ${userId}`,
    timestamp
  );

  revalidatePath('/owner/users');
  return { success: true, isActive: newStatus === 1 };
}
