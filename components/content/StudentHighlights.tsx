'use client';

import { useTranslations } from 'next-intl';

interface StudentHighlightsProps {
  highYieldPoints?: string[];
  differentials?: string[];
  examTips?: string;
}

/**
 * Student highlights section for medical students
 * Shows high-yield points, differentials, and exam tips
 */
export default function StudentHighlights({
  highYieldPoints,
  differentials,
  examTips,
}: StudentHighlightsProps) {
  const t = useTranslations('content.studentHighlights');
  
  if (!highYieldPoints && !differentials && !examTips) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-500 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">
        {t('title')}
      </h3>
      
      {highYieldPoints && highYieldPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            {t('highYield.title')}
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {highYieldPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {differentials && differentials.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            {t('differentials.title')}
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {differentials.map((diff, index) => (
              <li key={index}>{diff}</li>
            ))}
          </ul>
        </div>
      )}
      
      {examTips && (
        <div>
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            {t('examTips.title')}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            {examTips}
          </p>
        </div>
      )}
    </div>
  );
}

