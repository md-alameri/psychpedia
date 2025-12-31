import createMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function proxy(request: NextRequest) {
  // Infer locale from pathname
  const pathname = request.nextUrl.pathname;
  let locale = 'en';
  
  if (pathname.startsWith('/ar')) {
    locale = 'ar';
  } else if (pathname.startsWith('/en')) {
    locale = 'en';
  }
  
  // Call next-intl middleware first
  const response = intlMiddleware(request);
  
  // Set APP_LOCALE cookie on the response
  // If response is a NextResponse, use it directly; otherwise create a new one
  const responseToReturn = response instanceof NextResponse 
    ? response 
    : NextResponse.next();
  
  // Set cookie for client-side consistency
  responseToReturn.cookies.set('APP_LOCALE', locale, {
    path: '/',
    httpOnly: false,
  });
  
  // Set headers for server-side reading (ensures consistency during SSR)
  responseToReturn.headers.set('x-app-locale', locale);
  responseToReturn.headers.set('x-pathname', pathname);
  
  return responseToReturn;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

