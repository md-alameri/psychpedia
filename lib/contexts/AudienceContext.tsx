'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ContentDepth } from '@/lib/content/types';

const STORAGE_KEY = 'psychpedia-audience-preference';

interface AudienceContextType {
  audienceDepth: ContentDepth;
  setAudienceDepth: (depth: ContentDepth) => void;
}

const AudienceContext = createContext<AudienceContextType | undefined>(undefined);

interface AudienceProviderProps {
  children: ReactNode;
  defaultDepth?: ContentDepth;
}

/**
 * Audience context provider for global audience state management
 * Persists user preference in localStorage across sessions
 */
export function AudienceProvider({ children, defaultDepth = 'basic' }: AudienceProviderProps) {
  const [audienceDepth, setAudienceDepthState] = useState<ContentDepth>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['basic', 'intermediate', 'advanced'].includes(saved)) {
        return saved as ContentDepth;
      }
    }
    return defaultDepth;
  });
  
  // Save to localStorage when depth changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, audienceDepth);
    }
  }, [audienceDepth]);
  
  const setAudienceDepth = (depth: ContentDepth) => {
    setAudienceDepthState(depth);
  };
  
  return (
    <AudienceContext.Provider value={{ audienceDepth, setAudienceDepth }}>
      {children}
    </AudienceContext.Provider>
  );
}

/**
 * Hook to access audience context
 */
export function useAudience() {
  const context = useContext(AudienceContext);
  if (context === undefined) {
    throw new Error('useAudience must be used within an AudienceProvider');
  }
  return context;
}

