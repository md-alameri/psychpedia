'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ContentDepth } from '@/lib/content/types';

export type AudienceTier = 'basic' | 'intermediate' | 'advanced';

interface AudienceTabsProps {
  onDepthChange?: (depth: ContentDepth) => void;
  defaultDepth?: ContentDepth;
}

const STORAGE_KEY = 'psychpedia-audience-preference';

/**
 * Progressive disclosure component for audience tiers
 * Allows users to switch between Basic (Patients), Intermediate (Students), and Advanced (Clinicians) views
 * Persists user preference in localStorage across sessions
 */
export default function AudienceTabs({ onDepthChange, defaultDepth = 'basic' }: AudienceTabsProps) {
  const t = useTranslations();
  
  // Initialize from localStorage or use default
  const [activeDepth, setActiveDepth] = useState<ContentDepth>(() => {
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
      localStorage.setItem(STORAGE_KEY, activeDepth);
    }
  }, [activeDepth]);
  
  const tabs: { depth: ContentDepth; label: string; description: string }[] = [
    {
      depth: 'basic',
      label: 'For Patients',
      description: 'Simplified, patient-friendly information',
    },
    {
      depth: 'intermediate',
      label: 'For Students',
      description: 'Educational content for medical students',
    },
    {
      depth: 'advanced',
      label: 'For Clinicians',
      description: 'Advanced clinical information',
    },
  ];
  
  const handleTabChange = (depth: ContentDepth) => {
    setActiveDepth(depth);
    onDepthChange?.(depth);
  };
  
  return (
    <div className="border-b border-border mb-8">
      <div className="flex space-x-1 rtl:space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeDepth === tab.depth;
          return (
            <button
              key={tab.depth}
              onClick={() => handleTabChange(tab.depth)}
              className={`
                px-6 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${isActive
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              <div className="text-base font-semibold">{tab.label}</div>
              <div className="text-xs mt-1 opacity-75">{tab.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

