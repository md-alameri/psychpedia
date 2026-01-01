import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize API routes: rewrite /api/ to /api (remove trailing slash)
  // Using rewrite instead of redirect to avoid 308 responses
  // This maps /api/ to /api internally without changing the URL
  // Only works reliably after disabling Next.js's own trailing slash redirect
  if (pathname === '/api/') {
    const url = request.nextUrl.clone();
    url.pathname = '/api';
    return NextResponse.rewrite(url);
  }

  // Handle next-intl routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

