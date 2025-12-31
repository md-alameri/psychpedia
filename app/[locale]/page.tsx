import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n/config';
import Hero from '@/components/Hero';
import Credibility from '@/components/Credibility';
import Vision from '@/components/Vision';
import Waitlist from '@/components/Waitlist';
import Ethics from '@/components/Ethics';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Credibility />
      <Vision />
      <Waitlist />
      <Ethics />
    </>
  );
}

