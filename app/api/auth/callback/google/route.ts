import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthLogin } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const loginUrl = new URL('/login', baseUrl);

  if (error) {
    loginUrl.searchParams.set('error', `google_${error}`);
    return NextResponse.redirect(loginUrl);
  }

  const storedState = request.cookies.get('sentinel_google_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    loginUrl.searchParams.set('error', 'invalid_oauth_state');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_google_oauth_state');
    return res;
  }

  if (!code) {
    loginUrl.searchParams.set('error', 'missing_oauth_code');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_google_oauth_state');
    return res;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      loginUrl.searchParams.set('error', 'google_token_exchange_failed');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_google_oauth_state');
      return res;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch userinfo using access token
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoRes.ok) {
      loginUrl.searchParams.set('error', 'google_userinfo_failed');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_google_oauth_state');
      return res;
    }

    const profile = await userinfoRes.json();
    const { sub, email, email_verified, name, picture } = profile;

    if (!email) {
      loginUrl.searchParams.set('error', 'google_email_missing');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_google_oauth_state');
      return res;
    }

    const isEmailVerified = email_verified === true || email_verified === 'true' || email_verified === 1;
    if (!isEmailVerified) {
      loginUrl.searchParams.set('error', 'google_email_unverified');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('sentinel_google_oauth_state');
      return res;
    }

    // 3. Link or create Sentinel user session
    const { sessionToken, expiresAt, needsOnboarding } = await handleOAuthLogin({
      provider: 'google',
      providerUserId: sub,
      email,
      name: name || null,
      avatarUrl: picture || null,
    });

    const targetUrl = new URL(needsOnboarding ? '/onboarding/profile' : '/overview', baseUrl);
    const response = NextResponse.redirect(targetUrl);
    response.cookies.delete('sentinel_google_oauth_state');
    response.cookies.set('sentinel-session', sessionToken, {
      httpOnly: true,
      secure: baseUrl.startsWith('https:'),
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (err: any) {
    console.error('Google OAuth callback exception:', err?.message || err);
    if (err?.cause) {
      console.error('Google OAuth callback cause:', err.cause);
    }
    const isNetwork = err?.code === 'ENOTFOUND' || err?.cause?.code === 'ENOTFOUND' || (typeof err?.message === 'string' && err.message.includes('fetch failed'));
    loginUrl.searchParams.set('error', isNetwork ? 'google_network_error' : 'google_auth_failed');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('sentinel_google_oauth_state');
    return res;
  }
}
