'use client';

import type { Locale } from '@/lib/content/types';

interface Citation {
  label?: string;
  url?: string;
  sourceType?: string;
  year?: number;
}

interface CitationsSectionProps {
  citations?: Citation[];
  locale: Locale;
  title?: string;
}

/**
 * Citations section - rendered from authoritative citations[] array
 * This is separate from inline References blocks in richText
 */
export default function CitationsSection({ citations, locale, title = 'Sources & References' }: CitationsSectionProps) {
  if (!citations || citations.length === 0) {
    return null;
  }
  
  return (
    <section className="my-12 border-t border-border pt-8">
      <h2 className="text-2xl font-semibold text-text-primary mb-6">{title}</h2>
      <ol className="list-decimal list-inside space-y-3 rtl:list-outside rtl:mr-6">
        {citations.map((citation, index) => (
          <li key={index} className="text-text-secondary ml-4 rtl:mr-4">
            {citation.label || 'Citation'}
            {citation.sourceType && (
              <span className="text-text-muted ml-2 rtl:mr-2">
                [{citation.sourceType}]
              </span>
            )}
            {citation.year && (
              <span className="text-text-muted"> ({citation.year})</span>
            )}
            {citation.url && (
              <a
                href={citation.url}
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
    </section>
  );
}

