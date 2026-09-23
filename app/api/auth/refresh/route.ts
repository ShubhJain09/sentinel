import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { getUserById } from '@/app/lib/db';
import type { UserRole } from '@/app/lib/types';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const encodedKey = new TextEncoder().encode(secretKey);

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sentinel-session')?.value;
  const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/overview';

  // Ensure redirect target is a safe relative path
  const safeTarget = redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')
    ? redirectTarget
    : '/overview';

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(sessionToken, encodedKey, {
      algorithms: ['HS256'],
    });

    const userId = payload.userId as string;
    if (!userId) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('sentinel-session');
      return response;
    }

    const dbUser = getUserById(userId);
    if (!dbUser || !dbUser.isActive) {
      const response = NextResponse.redirect(new URL('/login?error=Account+suspended', request.url));
      response.cookies.delete('sentinel-session');
      return response;
    }

    const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());

    let liveRole: UserRole = dbUser.role;
    if (dbUser.email && ownerEmails.includes(dbUser.email.toLowerCase())) {
      liveRole = 'owner';
    }

    // Re-sign fresh 7-day token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updatedPayload = {
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: liveRole,
      avatarInitials: dbUser.avatarInitials,
      workspaceId: dbUser.workspaceId,
      username: dbUser.username,
      avatarUrl: dbUser.avatarUrl,
    };

    const newToken = await new SignJWT(updatedPayload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(encodedKey);

    // Validate access to safeTarget
    let finalDestination = safeTarget;
    if (safeTarget.startsWith('/owner')) {
      const isOwner = liveRole === 'owner';
      const isAdmin = liveRole === 'admin';

      if (!isOwner && !isAdmin) {
        finalDestination = '/overview?error=Unauthorized+access';
      } else if (isAdmin && !isOwner) {
        const ownerOnlyPrefixes = ['/owner/secrets', '/owner/diagnostics', '/owner/security'];
        if (ownerOnlyPrefixes.some((p) => safeTarget === p || safeTarget.startsWith(p + '/') || safeTarget.startsWith(p + '?'))) {
          finalDestination = '/owner?error=Owner+privileges+required';
        }
      }
    }

    const response = NextResponse.redirect(new URL(finalDestination, request.url));
    response.cookies.set('sentinel-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.APP_URL?.startsWith('http://localhost'),
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login?error=Session+expired', request.url));
    response.cookies.delete('sentinel-session');
    return response;
  }
}
