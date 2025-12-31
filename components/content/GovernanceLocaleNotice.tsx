'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

interface GovernanceLocaleNoticeProps {
  requestedLocale: Locale;
  pageSlug: string;
}

/**
 * Notice component shown when governance page content is not available in the requested locale
 * and is falling back to English content
 */
export default function GovernanceLocaleNotice({
  requestedLocale,
  pageSlug,
}: GovernanceLocaleNoticeProps) {
  const t = useTranslations('content.governanceLocaleUnavailable');
  
  // Only show notice if Arabic was requested but content is in English
  if (requestedLocale !== 'ar') {
    return null;
  }
  
  const englishUrl = `/en/${pageSlug}`;
  
  return (
    <div className="bg-background-off border-l-4 rtl:border-l-0 rtl:border-r-4 border-accent pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h3 className="font-semibold text-text-primary mb-2">
        {t('title')}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-3">
        {t('message')}
      </p>
      <Link
        href={englishUrl}
        className="text-sm font-medium text-accent hover:text-text-primary transition-colors"
      >
        {t('viewEnglish')} <span className="rtl:hidden">→</span><span className="hidden rtl:inline">←</span>
      </Link>
    </div>
  );
}

