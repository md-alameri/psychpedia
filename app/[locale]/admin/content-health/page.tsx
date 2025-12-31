import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { generateContentHealthReport, getHealthSummary } from '@/lib/content/health';
import ContentHealthDashboard from '@/components/admin/ContentHealthDashboard';

interface ContentHealthPageProps {
  params: Promise<{ locale: Locale }>;
}

export const metadata: Metadata = {
  title: 'Content Health Dashboard | Psychpedia',
  description: 'Monitor content quality and review status',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ContentHealthPage({ params }: ContentHealthPageProps) {
  // TODO: Replace with proper authentication (e.g., NextAuth, Clerk)
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  const { locale } = await params;
  setRequestLocale(locale);
  
  // Generate health report
  const reports = await generateContentHealthReport();
  const summary = getHealthSummary(reports);
  
  return <ContentHealthDashboard reports={reports} summary={summary} locale={locale} />;
}

