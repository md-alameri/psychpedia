'use client';

import type { Locale } from '@/lib/content/types';

interface Reference {
  title: string;
  source?: string;
  url?: string;
  year?: number;
}

interface ReferencesProps {
  references: Reference[];
  locale: Locale;
}

/**
 * References block component
 */
export default function References({ references, locale }: ReferencesProps) {
  if (!references || references.length === 0) {
    return null;
  }
  
  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold text-text-primary mb-4">References</h3>
      <ol className="list-decimal list-inside space-y-3 rtl:list-outside rtl:mr-6">
        {references.map((ref, index) => (
          <li key={index} className="text-text-secondary ml-4 rtl:mr-4">
            {ref.title}
            {ref.source && <span className="text-text-muted"> - {ref.source}</span>}
            {ref.year && <span className="text-text-muted"> ({ref.year})</span>}
            {ref.url && (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light underline ml-2 rtl:mr-2"
              >
                [Link]
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

