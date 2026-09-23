import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { getConnectedAccountsByUserId, deleteConnectedAccount } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = getConnectedAccountsByUserId(session.userId);
    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        email: a.email,
        name: a.name,
        avatarUrl: a.avatarUrl,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve connected accounts' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const provider = body.provider;

    if (!provider || (provider !== 'google' && provider !== 'apple')) {
      return NextResponse.json({ error: 'Invalid provider specified' }, { status: 400 });
    }

    const result = deleteConnectedAccount(session.userId, provider);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to disconnect account' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Successfully unlinked ${provider} identity.` });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
  }
}
