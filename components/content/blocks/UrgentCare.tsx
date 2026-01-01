'use client';

import type { Locale } from '@/lib/content/types';

interface UrgentCareProps {
  items: Array<{ item: string }>;
  locale: Locale;
}

/**
 * Urgent Care / Red Flags block component
 */
export default function UrgentCare({ items, locale }: UrgentCareProps) {
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-red-500 bg-red-50 dark:bg-red-900/20 pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">
        Urgent Care / Red Flags
      </h4>
      <ul className="list-disc list-inside space-y-2 text-text-secondary">
        {items.map((item, index) => (
          <li key={index} className="ml-4 rtl:mr-4">
            {item.item}
          </li>
        ))}
      </ul>
    </div>
  );
}

