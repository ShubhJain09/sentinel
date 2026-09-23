import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-login',
  '/privacy',
  '/terms',
  '/security',
  '/about',
  '/accessibility',
  '/support',
  '/favicon.ico',
  '/icon.svg',
];
const publicPrefixes = ['/api/auth/', '/_next/', '/support/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow all static assets (images, fonts, icons) without auth checks
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf)$/i)) {
    return NextResponse.next();
  }
  
  // 2. Allow public routes and public prefixes
  if (publicRoutes.includes(pathname) || publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    const isAuthRoute = ['/login', '/signup', '/forgot-password', '/verify-login'].includes(pathname);
    
    if (isAuthRoute) {
      const session = request.cookies.get('sentinel-session')?.value;
      if (session) {
        try {
          const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
          const encodedKey = new TextEncoder().encode(secretKey);
          await jwtVerify(session, encodedKey, { algorithms: ['HS256'] });
          return NextResponse.redirect(new URL('/overview', request.url));
        } catch (e) {
          // Invalid session, let them access auth page
        }
      }

      // If accessing /verify-login, require active challenge cookie
      if (pathname === '/verify-login') {
        const challenge = request.cookies.get('sentinel_login_challenge')?.value;
        if (!challenge) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // 3. Authenticated routes strictly require verified session
  const session = request.cookies.get('sentinel-session')?.value;
  if (!session) {
    const hasChallenge = request.cookies.get('sentinel_login_challenge')?.value;
    if (hasChallenge) {
      return NextResponse.redirect(new URL('/verify-login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    const encodedKey = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ['HS256'] });
    
    const ownerEmails = (process.env.OWNER_EMAIL || 'owner@sentinel.security,workspaceshubhjain@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    const isOwner = payload.role === 'owner' || (typeof payload.email === 'string' && ownerEmails.includes(payload.email.toLowerCase()));
    const isAdmin = payload.role === 'admin';

    // Check owner / admin routes
    if (pathname === '/owner' || pathname.startsWith('/owner/')) {
      if (isOwner) {
        return NextResponse.next();
      }

      if (isAdmin) {
        const ownerOnlyPrefixes = ['/owner/secrets', '/owner/diagnostics', '/owner/security'];
        if (ownerOnlyPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
          const url = new URL('/owner', request.url);
          url.searchParams.set('error', 'Owner privileges required');
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      // If token does not reflect admin/owner yet, check live DB via refresh route
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      refreshUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(refreshUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'Session expired');
    const response = NextResponse.redirect(url);
    response.cookies.delete('sentinel-session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static, _next/image
     * - static image/font extensions
     */
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};
