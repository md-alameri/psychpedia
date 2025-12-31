'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { SearchResult } from '@/lib/search/search';

export function useSearch() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Perform search via API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);
  
  // Update search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);
  
  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    performSearch,
  };
}

