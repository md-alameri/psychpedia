'use client';

import type { EditorialMetadata, EvidenceStrength } from '@/lib/content/types';
import { useTranslations } from 'next-intl';

interface EditorialMetadataProps {
  metadata: EditorialMetadata;
}

/**
 * Component to display editorial metadata on content pages
 * Shows last reviewed date, reviewer information, and evidence strength
 */
export default function EditorialMetadata({ metadata }: EditorialMetadataProps) {
  const t = useTranslations();
  
  const evidenceLabels: Record<EvidenceStrength, string> = {
    'guideline': 'Guideline-based',
    'meta-analysis': 'Meta-analysis',
    'expert-consensus': 'Expert Consensus',
  };
  
  const evidenceColors: Record<EvidenceStrength, string> = {
    'guideline': 'bg-blue-100 text-blue-800',
    'meta-analysis': 'bg-green-100 text-green-800',
    'expert-consensus': 'bg-gray-100 text-gray-800',
  };
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="bg-background-off border border-border rounded-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-sm text-text-muted">Last reviewed on</span>
              <p className="text-base font-medium text-text-primary mt-1">
                {formatDate(metadata.lastReviewed)}
              </p>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-border" />
            
            <div>
              <span className="text-sm text-text-muted">Reviewed by</span>
              <p className="text-base font-medium text-text-primary mt-1">
                {metadata.reviewer.name}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {metadata.reviewer.role}
                {metadata.reviewer.credentials.length > 0 && (
                  <span className="ml-2">
                    {metadata.reviewer.credentials.join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Evidence:</span>
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${evidenceColors[metadata.evidenceStrength]}
            `}
          >
            {evidenceLabels[metadata.evidenceStrength]}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          Version {metadata.version} • This content is for informational purposes only and does not constitute medical advice.
        </p>
      </div>
    </div>
  );
}

