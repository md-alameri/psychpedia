'use client';

import { useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/useSearch';
import SearchResults from './SearchResults';

export default function SearchModal() {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background-light border border-border rounded-lg shadow-xl">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-text-muted"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conditions, medications..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder-text-muted text-lg"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-text-muted bg-background-off border border-border rounded">
              ESC
            </kbd>
          </div>
        </div>
        
        {/* Results */}
        <div className="max-h-[60vh] overflow-hidden">
          <SearchResults
            results={results}
            isLoading={isLoading}
            query={query}
            onSelect={() => setIsOpen(false)}
          />
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-border bg-background-off text-xs text-text-muted text-center">
          Press <kbd className="px-1.5 py-0.5 bg-background-light border border-border rounded">⌘K</kbd> to open, <kbd className="px-1.5 py-0.5 bg-background-light border border-border rounded">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
}

