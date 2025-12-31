'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ContentDepth } from '@/lib/content/types';

export type AudienceTier = 'basic' | 'intermediate' | 'advanced';

interface AudienceTabsProps {
  onDepthChange?: (depth: ContentDepth) => void;
  defaultDepth?: ContentDepth;
}

/**
 * Progressive disclosure component for audience tiers
 * Allows users to switch between Basic (Patients), Intermediate (Students), and Advanced (Clinicians) views
 */
export default function AudienceTabs({ onDepthChange, defaultDepth = 'basic' }: AudienceTabsProps) {
  const t = useTranslations();
  const [activeDepth, setActiveDepth] = useState<ContentDepth>(defaultDepth);
  
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

