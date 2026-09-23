import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.APPLE_CLIENT_ID?.trim();

  // If not configured, gracefully return to /login without crashing
  if (!clientId) {
    const loginUrl = new URL('/login', getBaseUrl(request));
    loginUrl.searchParams.set('error', 'apple_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = getBaseUrl(request);
  const redirectUri = process.env.APPLE_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/callback/apple`;
  const state = crypto.randomUUID();

  const authUrl = new URL('https://appleid.apple.com/auth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code id_token');
  authUrl.searchParams.set('response_mode', 'form_post');
  authUrl.searchParams.set('scope', 'name email');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('sentinel_apple_oauth_state', state, {
    httpOnly: true,
    secure: baseUrl.startsWith('https:'),
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return response;
}
