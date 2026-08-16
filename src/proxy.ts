import { NextResponse, type NextRequest } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

/** Exact-match public routes. "/" must be exact — startsWith('/') would match everything. */
const PUBLIC_EXACT = ['/'];

/**
 * Prefix-match public routes. Security and seat-invite links in particular must
 * work for someone with no account at all — requiring a login to disown an
 * action you never took would be absurd. The marketing pages are public by
 * definition; /welcome redirects to "/" but stays listed so it never bounces
 * to sign-in on the way there.
 */
const PUBLIC_PREFIXES = [
  '/about',
  '/careers',
  '/terms',
  '/privacy',
  '/security',
  '/seat-invites',
  '/welcome',
];

/**
 * Redirects on a cookie mirror of the session so signed-out visitors never see
 * the app shell flash. The API is still the real authority — every request
 * carries a Bearer token and a stale cookie only costs one 401.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = request.cookies.get('lp_auth')?.value === '1';

  const isPublic =
    PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIXES.some((route) => pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!signedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (signedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/today', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|logo-mark.svg|.*\\.png).*)'],
};
