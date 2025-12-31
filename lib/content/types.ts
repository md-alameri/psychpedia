/**
 * Shared TypeScript types for content architecture
 */

export type Locale = 'en' | 'ar';

export type ContentDepth = 'basic' | 'intermediate' | 'advanced';

export type EvidenceStrength = 'guideline' | 'meta-analysis' | 'expert-consensus';

/**
 * Evidence level (A/B/C/D) for clinical evidence grading
 * A: Strong evidence (multiple RCTs, meta-analyses)
 * B: Moderate evidence (single RCT, well-designed studies)
 * C: Limited evidence (observational studies, case series)
 * D: Expert opinion or consensus
 */
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';

/**
 * Audience level flags - indicates which audience tiers can access this content
 */
export interface AudienceLevel {
  public: boolean;      // General population
  student: boolean;      // Medical students
  clinician: boolean;   // Clinicians
}

export interface Reviewer {
  name: string;
  role: string;
  credentials: string[];
}

export interface EditorialMetadata {
  lastReviewed: string; // ISO date string
  reviewer: Reviewer;
  evidenceStrength: EvidenceStrength;
  evidenceLevel: EvidenceLevel; // A/B/C/D grading
  version: number;
}

export interface ContentSection {
  id: string;
  title: string;
  depth: ContentDepth;
  gated?: boolean;
  content?: string; // MDX content
}

export interface BaseContentMetadata {
  slug: string;
  title: string;
  description: string;
  editorial: EditorialMetadata;
  locale: Locale;
  audienceLevel: AudienceLevel; // Required: which audiences can access
  publicSummary?: string; // Optional: safe, non-prescriptive summary for public
}

