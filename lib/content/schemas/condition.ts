import { z } from 'zod';
import type { ContentDepth, BaseContentMetadata, ContentSection, AudienceLevel } from '../types';
import { EditorialMetadataSchema } from './editorial';

const AudienceLevelSchema = z.object({
  public: z.boolean(),
  student: z.boolean(),
  clinician: z.boolean(),
});

/**
 * Standard sections for condition pages (10 sections as per spec)
 */
export const CONDITION_SECTIONS = [
  'overview',
  'epidemiology',
  'etiology',
  'clinical-features',
  'diagnosis',
  'differential-diagnosis',
  'management',
  'prognosis',
  'red-flags',
  'references',
] as const;

export type ConditionSectionId = (typeof CONDITION_SECTIONS)[number];

/**
 * Section titles mapping
 */
export const CONDITION_SECTION_TITLES: Record<ConditionSectionId, string> = {
  overview: 'Overview',
  epidemiology: 'Epidemiology',
  etiology: 'Etiology & Risk Factors',
  'clinical-features': 'Clinical Features',
  diagnosis: 'Diagnosis',
  'differential-diagnosis': 'Differential Diagnosis',
  management: 'Management',
  prognosis: 'Prognosis',
  'red-flags': 'Red Flags & When to Refer',
  references: 'References',
};

/**
 * Zod schema for condition metadata
 * All fields are required except optional ones explicitly marked
 */
export const ConditionMetadataSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  editorial: EditorialMetadataSchema,
  locale: z.enum(['en', 'ar']),
  audienceLevel: AudienceLevelSchema.refine(
    (val) => val.public || val.student || val.clinician,
    { message: 'At least one audience level must be enabled' }
  ),
  publicSummary: z.string().min(50, 'Public summary must be at least 50 characters').optional(),
  // Optional: category, tags, related conditions
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relatedConditions: z.array(z.string()).default([]),
});

export type ConditionMetadata = z.infer<typeof ConditionMetadataSchema>;

/**
 * Condition content structure
 */
export interface ConditionContent {
  metadata: ConditionMetadata;
  sections: Record<ConditionSectionId, ContentSection>;
  rawContent?: string; // Full MDX content
}

/**
 * Type guard and validator for condition metadata
 */
export function validateConditionMetadata(data: unknown): ConditionMetadata {
  return ConditionMetadataSchema.parse(data);
}

/**
 * Create default condition sections structure
 */
export function createDefaultConditionSections(): Record<ConditionSectionId, ContentSection> {
  const sections: Partial<Record<ConditionSectionId, ContentSection>> = {};
  
  for (const sectionId of CONDITION_SECTIONS) {
    sections[sectionId] = {
      id: sectionId,
      title: CONDITION_SECTION_TITLES[sectionId],
      depth: sectionId === 'overview' ? 'basic' : 'intermediate',
      gated: false,
    };
  }
  
  return sections as Record<ConditionSectionId, ContentSection>;
}

