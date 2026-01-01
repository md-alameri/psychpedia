import type { Metadata } from "next";
import { cookies, headers } from 'next/headers';
import { locales, type Locale } from '@/lib/i18n/config';
import { Inter } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Psychpedia - Mental Health & Psychiatry Knowledge Base",
  description: "A clinically grounded knowledge platform for mental health. Evidence-based content for clinicians, medical students, and mental health professionals.",
  alternates: {
    languages: {
      'en': '/en',
      'ar': '/ar',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to get locale from multiple sources (in order of priority):
  // 1. Header set by middleware (most reliable)
  // 2. Cookie (set by middleware on previous requests)
  // 3. Infer from pathname header
  // 4. Default to 'en'
  const headersList = await headers();
  const cookieStore = await cookies();
  
  // Get locale from next-intl middleware header (set by next-intl middleware)
  const nextIntlLocale = headersList.get('x-next-intl-locale');
  const headerLocale = headersList.get('x-app-locale');
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value || cookieStore.get('APP_LOCALE')?.value;
  const pathnameHeader = headersList.get('x-pathname');
  
  let locale: Locale = 'en';
  
  // Priority: next-intl header > custom header > cookie > pathname
  if (nextIntlLocale && locales.includes(nextIntlLocale as Locale)) {
    locale = nextIntlLocale as Locale;
  } else if (headerLocale && locales.includes(headerLocale as Locale)) {
    locale = headerLocale as Locale;
  } else if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else if (pathnameHeader) {
    if (pathnameHeader.startsWith('/ar')) {
      locale = 'ar';
    } else if (pathnameHeader.startsWith('/en')) {
      locale = 'en';
    }
  }
  
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={`${inter.variable} ${notoSansArabic.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {/* Suppress hydration warnings from browser extensions and metadata boundaries */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
