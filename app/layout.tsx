import type { Metadata } from "next";
import { cookies, headers } from 'next/headers';
import { locales, type Locale } from '@/lib/i18n/config';
import "./globals.css";

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
  
  const headerLocale = headersList.get('x-app-locale');
  const cookieLocale = cookieStore.get('APP_LOCALE')?.value;
  const pathnameHeader = headersList.get('x-pathname');
  
  let locale: Locale = 'en';
  
  if (headerLocale && locales.includes(headerLocale as Locale)) {
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
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
