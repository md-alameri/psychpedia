import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ CRITICAL: Do not touch API routes - return immediately
  // This MUST be the first check before any other processing
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Exclude Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Handle next-intl routing for all other paths (non-API routes)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes - CRITICAL: must be excluded to prevent locale redirects)
     * - _next (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - Files with extensions (images, etc.)
     * 
     * The negative lookahead (?!api...) ensures /api/* routes are NEVER matched
     * by this middleware, preventing locale redirects on API routes.
     */
    '/((?!api|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};

