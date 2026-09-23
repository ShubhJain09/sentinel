import { NextResponse } from 'next/server';
import { getProviderConfig } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getProviderConfig();
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve auth provider configuration' },
      { status: 500 }
    );
  }
}
