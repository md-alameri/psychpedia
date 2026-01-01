'use client';

import type { Locale } from '@/lib/content/types';

interface StudentHighlightsProps {
  highYieldPoints?: Array<{ point: string }>;
  differentials?: Array<{ differential: string }>;
  examTips?: string;
  locale: Locale;
}

/**
 * Student highlights block component
 */
export default function StudentHighlights({
  highYieldPoints,
  differentials,
  examTips,
  locale,
}: StudentHighlightsProps) {
  if (!highYieldPoints && !differentials && !examTips) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-500 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">
        Student Highlights
      </h3>
      
      {highYieldPoints && highYieldPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            High-Yield Points
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {highYieldPoints.map((item, index) => (
              <li key={index} className="ml-4 rtl:mr-4">{item.point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {differentials && differentials.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            Differentials
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {differentials.map((item, index) => (
              <li key={index} className="ml-4 rtl:mr-4">{item.differential}</li>
            ))}
          </ul>
        </div>
      )}
      
      {examTips && (
        <div>
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
            Exam Tips
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            {examTips}
          </p>
        </div>
      )}
    </div>
  );
}

