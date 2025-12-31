'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { SearchResult } from '@/lib/search/search';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onSelect?: () => void;
}

export default function SearchResults({ results, isLoading, query, onSelect }: SearchResultsProps) {
  const locale = useLocale();
  
  if (isLoading) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Searching...
      </div>
    );
  }
  
  if (query && results.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary">
        No results found for &quot;{query}&quot;
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Start typing to search...
      </div>
    );
  }
  
  return (
    <div className="max-h-96 overflow-y-auto">
      {results.map((result) => {
        const url = `/${locale}/${result.entry.type === 'condition' ? 'conditions' : 'medications'}/${result.entry.slug}`;
        
        return (
          <Link
            key={result.entry.id}
            href={url}
            onClick={onSelect}
            className="block px-4 py-3 hover:bg-background-off transition-colors border-b border-border last:border-b-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-accent uppercase">
                    {result.entry.type}
                  </span>
                  <span className="text-xs text-text-muted">
                    {result.entry.locale.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-text-primary mb-1 truncate">
                  {result.entry.title}
                </h4>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {result.entry.description}
                </p>
                {result.matchedFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.matchedFields.map((field) => (
                      <span
                        key={field}
                        className="text-xs px-2 py-0.5 bg-background-off text-text-muted rounded"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

