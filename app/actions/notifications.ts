'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/app/lib/auth';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  seedUserNotificationsIfEmpty,
} from '@/app/lib/db';
import type { Notification } from '@/app/lib/types';

export async function getNotificationsAction(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const session = await getSession();
  if (!session) {
    return { notifications: [], unreadCount: 0 };
  }

  seedUserNotificationsIfEmpty(session.userId);
  const notifications = getNotifications(session.userId);
  const unreadCount = getUnreadNotificationCount(session.userId);

  return { notifications, unreadCount };
}

export async function getUnreadCountAction(): Promise<{ count: number }> {
  const session = await getSession();
  if (!session) {
    return { count: 0 };
  }

  const count = getUnreadNotificationCount(session.userId);
  return { count };
}

export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
  count: number;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, count: 0 };
  }

  markAllNotificationsRead(session.userId);
  revalidatePath('/notifications');
  revalidatePath('/');

  return { success: true, count: 0 };
}

export async function markNotificationReadAction(id: string): Promise<{
  success: boolean;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false };
  }

  markNotificationRead(id, session.userId);
  revalidatePath('/notifications');

  return { success: true };
}
