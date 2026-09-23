import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { handleOAuthLogin } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

async function processAppleAuth(
  request: NextRequest,
  params: {
    code?: string | null;
    id_token?: string | null;
    state?: string | null;
    user?: string | null;
    error?: string | null;
  }
) {
  const baseUrl = getBaseUrl(request);
  const loginUrl = new URL('/login', baseUrl);

  if (params.error) {
    loginUrl.searchParams.set('error', `apple_${params.error}`);
    return NextResponse.redirect(loginUrl);
  }

  const storedState = request.cookies.get('sentinel_apple_oauth_state')?.value;
  if (!params.state || !storedState || params.state !== storedState) {
    loginUrl.searchParams.set('error', 'invalid_oauth_state');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_apple_oauth_state');
    return res;
  }

  if (!params.id_token) {
    loginUrl.searchParams.set('error', 'missing_apple_token');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_apple_oauth_state');
    return res;
  }

  try {
    // Decode Apple ID Token
    const payload = decodeJwt(params.id_token);

    if (payload.iss !== 'https://appleid.apple.com') {
      loginUrl.searchParams.set('error', 'invalid_apple_issuer');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_apple_oauth_state');
      return res;
    }

    const appleClientId = process.env.APPLE_CLIENT_ID?.trim();
    if (appleClientId && payload.aud !== appleClientId) {
      loginUrl.searchParams.set('error', 'invalid_apple_audience');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_apple_oauth_state');
      return res;
    }

    const email = (payload.email as string)?.trim().toLowerCase();
    const providerUserId = payload.sub;

    if (!email || !providerUserId) {
      loginUrl.searchParams.set('error', 'apple_identity_incomplete');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_apple_oauth_state');
      return res;
    }

    // Check email verification if provided by Apple
    if (payload.email_verified !== undefined && payload.email_verified !== true && payload.email_verified !== 'true') {
      loginUrl.searchParams.set('error', 'apple_email_unverified');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_apple_oauth_state');
      return res;
    }

    // Parse user details sent by Apple on first sign-in
    let name: string | null = null;
    if (params.user) {
      try {
        const parsed = typeof params.user === 'string' ? JSON.parse(params.user) : params.user;
        if (parsed?.name) {
          const parts = [parsed.name.firstName, parsed.name.lastName].filter(Boolean);
          if (parts.length > 0) {
            name = parts.join(' ');
          }
        }
      } catch (e) {
        // Ignore unparseable user object
      }
    }

    // Link or create Sentinel user session
    const { sessionToken, expiresAt, needsOnboarding } = await handleOAuthLogin({
      provider: 'apple',
      providerUserId,
      email,
      name,
      avatarUrl: null,
    });

    const targetUrl = new URL(needsOnboarding ? '/onboarding/profile' : '/overview', baseUrl);
    const response = NextResponse.redirect(targetUrl);
    response.cookies.delete('sentinel_apple_oauth_state');
    response.cookies.set('sentinel-session', sessionToken, {
      httpOnly: true,
      secure: baseUrl.startsWith('https:'),
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (err: any) {
    console.error('Apple Sign In callback exception:', err);
    loginUrl.searchParams.set('error', 'apple_auth_failed');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_apple_oauth_state');
    return res;
  }
}

// Apple sends form_post
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string | null;
    const id_token = formData.get('id_token') as string | null;
    const state = formData.get('state') as string | null;
    const user = formData.get('user') as string | null;
    const error = formData.get('error') as string | null;

    return await processAppleAuth(request, { code, id_token, state, user, error });
  } catch (err: any) {
    const baseUrl = getBaseUrl(request);
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'apple_payload_error');
    return NextResponse.redirect(loginUrl);
  }
}

// Fallback for GET response_mode
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const id_token = searchParams.get('id_token');
  const state = searchParams.get('state');
  const user = searchParams.get('user');
  const error = searchParams.get('error');

  return await processAppleAuth(request, { code, id_token, state, user, error });
}
