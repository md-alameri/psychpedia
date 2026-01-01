'use client';

import RichTextRenderer from '../RichTextRenderer';
import type { Locale } from '@/lib/content/types';

interface DosingBlockProps {
  doseText: any; // Payload richText JSON
  audience?: 'clinician' | 'student';
  locale: Locale;
  hideDosing?: boolean;
}

/**
 * Dosing block component - NEVER shown to public audience
 * Safety: Always hides for public, regardless of audience prop or editor settings
 */
export default function DosingBlock({ doseText, audience = 'clinician', locale, hideDosing = false }: DosingBlockProps) {
  // CRITICAL SAFETY: Always hide for public audience, even if editor sets audience incorrectly
  // hideDosing is passed from page level based on getCurrentUserRole() === 'public'
  if (hideDosing) {
    return (
      <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-gray-400 bg-gray-50 dark:bg-gray-800 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded">
            Clinician-only
          </span>
          <p className="text-text-muted text-sm">
            Dosing information is available to registered healthcare professionals.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-accent bg-background-off pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h4 className="font-semibold text-text-primary mb-3">Dosing</h4>
      <div className="text-text-secondary">
        <RichTextRenderer content={doseText} locale={locale} />
      </div>
    </div>
  );
}

