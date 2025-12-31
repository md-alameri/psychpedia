'use client';

import { useTranslations } from 'next-intl';
import type { EvidenceLevel } from '@/lib/content/types';

interface TrustBadgesProps {
  evidenceLevel: EvidenceLevel;
  reviewCadenceMonths: number;
  lastReviewed: string;
  nextReviewDue: string;
}

/**
 * Trust badges component showing evidence levels, review cadence, and disclaimer
 * Displays credibility indicators for content pages
 */
export default function TrustBadges({
  evidenceLevel,
  reviewCadenceMonths,
  lastReviewed,
  nextReviewDue,
}: TrustBadgesProps) {
  const t = useTranslations('content.trustBadges');
  
  const evidenceLevelLabels: Record<EvidenceLevel, string> = {
    A: t('evidenceLevel.strong'),
    B: t('evidenceLevel.moderate'),
    C: t('evidenceLevel.limited'),
    D: t('evidenceLevel.expert'),
  };
  
  const evidenceLevelColors: Record<EvidenceLevel, string> = {
    A: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    B: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    D: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  
  // Check if review is overdue
  const today = new Date();
  const reviewDueDate = new Date(nextReviewDue);
  const isOverdue = reviewDueDate < today;
  const daysUntilReview = Math.ceil((reviewDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-background-off border border-border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t('title')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Evidence Level */}
        <div className="flex items-start gap-3">
          <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${evidenceLevelColors[evidenceLevel]}`}>
            {t('evidenceLevel.label')}: {evidenceLevel}
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary">
              {evidenceLevelLabels[evidenceLevel]}
            </p>
          </div>
        </div>
        
        {/* Review Cadence */}
        <div className="flex items-start gap-3">
          <div className="px-3 py-1.5 bg-background-light border border-border rounded-lg font-semibold text-sm text-text-primary">
            {t('reviewCadence.label')}
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary">
              {t('reviewCadence.value', { months: reviewCadenceMonths })}
            </p>
          </div>
        </div>
        
        {/* Review Status */}
        <div className="flex items-start gap-3">
          <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
            isOverdue 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : daysUntilReview <= 30
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-background-light border border-border text-text-primary'
          }`}>
            {isOverdue ? t('reviewStatus.overdue') : t('reviewStatus.due', { days: daysUntilReview })}
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary">
              {t('lastReviewed')}: {new Date(lastReviewed).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

