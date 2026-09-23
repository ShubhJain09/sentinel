import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { getDb } from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate format
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json({
        available: false,
        reason: 'Username must be 3-30 characters: letters, numbers, underscore only',
      });
    }

    const db = getDb();
    const existing = db.prepare(
      'SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?'
    ).get(username, session.userId);

    return NextResponse.json({
      available: !existing,
      reason: existing ? 'This username is already taken' : null,
    });
  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
