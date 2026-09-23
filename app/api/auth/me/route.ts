import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { authenticated: false, session: null },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        session: {
          userId: session.userId,
          email: session.email,
          name: session.name,
          role: session.role,
          avatarInitials: session.avatarInitials,
          avatarUrl: session.avatarUrl,
          username: session.username,
          workspaceId: session.workspaceId,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, session: null },
      { status: 200 }
    );
  }
}
