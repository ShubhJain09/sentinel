import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  seedUserNotificationsIfEmpty,
} from '@/app/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ unreadCount: 0, notifications: [] }, { status: 200 });
  }

  seedUserNotificationsIfEmpty(session.userId);
  const notifications = getNotifications(session.userId);
  const unreadCount = getUnreadNotificationCount(session.userId);

  return NextResponse.json({ unreadCount, notifications }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (body.action === 'markAllRead') {
      markAllNotificationsRead(session.userId);
      return NextResponse.json({ success: true, unreadCount: 0 });
    }

    if (body.action === 'markRead' && typeof body.id === 'string') {
      markNotificationRead(body.id, session.userId);
      const unreadCount = getUnreadNotificationCount(session.userId);
      return NextResponse.json({ success: true, unreadCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
