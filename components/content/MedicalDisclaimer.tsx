'use client';

import { useTranslations } from 'next-intl';

/**
 * Medical disclaimer component with locale support
 * Displays "Not medical advice" disclaimer on content pages
 */
export default function MedicalDisclaimer() {
  const t = useTranslations('content.disclaimer');
  
  return (
    <div className="bg-background-off border-l-4 rtl:border-l-0 rtl:border-r-4 border-accent pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h3 className="font-semibold text-text-primary mb-2">
        {t('title')}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {t('text')}
      </p>
    </div>
  );
}

