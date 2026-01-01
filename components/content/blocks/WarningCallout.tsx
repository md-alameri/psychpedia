'use client';

import { ReactNode } from 'react';
import RichTextRenderer from '../RichTextRenderer';
import type { Locale } from '@/lib/content/types';

interface WarningCalloutProps {
  variant?: 'warning' | 'danger' | 'info';
  title?: string;
  text: any; // Payload richText JSON
  locale: Locale;
}

/**
 * Warning callout block component
 */
export default function WarningCallout({ variant = 'warning', title, text, locale }: WarningCalloutProps) {
  const baseClasses = 'border-l-4 rtl:border-l-0 rtl:border-r-4 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none';
  
  const typeClasses = {
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  };
  
  const defaultTitles = {
    warning: 'Warning',
    danger: 'Important Safety Information',
    info: 'Note',
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[variant]}`}>
      {title && (
        <h4 className="font-semibold text-text-primary mb-2">
          {title}
        </h4>
      )}
      {!title && (
        <h4 className="font-semibold text-text-primary mb-2">
          {defaultTitles[variant]}
        </h4>
      )}
      <div className="text-text-secondary">
        <RichTextRenderer content={text} locale={locale} />
      </div>
    </div>
  );
}

