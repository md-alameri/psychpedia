'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface ReportIssueProps {
  contentType: 'condition' | 'medication';
  contentSlug: string;
  locale: string;
}

/**
 * Report an issue CTA component
 * Allows users to report content issues, errors, or concerns
 */
export default function ReportIssue({ contentType, contentSlug, locale }: ReportIssueProps) {
  const t = useTranslations('content.reportIssue');
  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
    // Set the URL only after component mounts on client to avoid hydration mismatch
    setCurrentUrl(window.location.href);
  }, []);
  
  const reportUrl = `mailto:content@psychpedia.com?subject=${encodeURIComponent(
    `Content Issue: ${contentType}/${contentSlug}`
  )}&body=${encodeURIComponent(
    `Content Type: ${contentType}\n` +
    `Slug: ${contentSlug}\n` +
    `Locale: ${locale}\n` +
    `URL: ${currentUrl}\n\n` +
    `Please describe the issue:\n`
  )}`;
  
  return (
    <div className="border-t border-border pt-6 mt-8">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            {t('title')}
          </h4>
          <p className="text-xs text-text-secondary">
            {t('description')}
          </p>
        </div>
        <a
          href={reportUrl}
          className="px-4 py-2 text-sm font-medium text-accent border border-border rounded-lg hover:bg-background-off transition-colors whitespace-nowrap"
        >
          {t('button')}
        </a>
      </div>
    </div>
  );
}

