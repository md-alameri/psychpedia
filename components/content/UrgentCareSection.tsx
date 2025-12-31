'use client';

import { useTranslations } from 'next-intl';

interface UrgentCareSectionProps {
  redFlags?: string[];
  whenToSeekHelp?: string;
}

/**
 * Urgent care section for public audience
 * Shows red flags and when to seek immediate medical attention
 */
export default function UrgentCareSection({ 
  redFlags, 
  whenToSeekHelp 
}: UrgentCareSectionProps) {
  const t = useTranslations('content.urgentCare');
  
  if (!redFlags && !whenToSeekHelp) {
    return null;
  }
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 rtl:border-l-0 rtl:border-r-4 border-red-500 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">
        {t('title')}
      </h3>
      
      {redFlags && redFlags.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
            {t('redFlags.title')}
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {redFlags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
      
      {whenToSeekHelp && (
        <div>
          <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
            {t('whenToSeekHelp.title')}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
            {whenToSeekHelp}
          </p>
        </div>
      )}
      
      <p className="text-xs text-red-600 dark:text-red-400 mt-4">
        {t('disclaimer')}
      </p>
    </div>
  );
}

