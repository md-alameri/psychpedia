'use client';

import { ReactNode } from 'react';
import type { ContentDepth } from '@/lib/content/types';
import { isSectionGated } from '@/lib/content/gating';
import GatedBadge from './GatedBadge';

interface ContentSectionProps {
  id: string;
  title: string;
  depth: ContentDepth;
  gated?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable wrapper component for content sections
 * Handles gating indicators and depth-based visibility
 */
export default function ContentSection({
  id,
  title,
  depth,
  gated,
  children,
  className = '',
}: ContentSectionProps) {
  const isGated = isSectionGated(gated, depth);
  
  return (
    <section
      id={id}
      className={`mb-12 ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2
          id={`${id}-title`}
          className="text-3xl font-semibold text-text-primary"
        >
          {title}
        </h2>
        {isGated && <GatedBadge />}
      </div>
      
      {isGated ? (
        <div className="bg-background-off border border-border rounded-lg p-6">
          <p className="text-text-secondary mb-4">
            This section contains advanced clinical content that requires registration.
          </p>
          <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors">
            Sign up to access
          </button>
        </div>
      ) : (
        <div className="prose prose-medical max-w-none">
          {children}
        </div>
      )}
    </section>
  );
}

