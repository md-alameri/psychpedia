import { z } from 'zod';
import type { ContentDepth, BaseContentMetadata, ContentSection, AudienceLevel } from '../types';
import { EditorialMetadataSchema } from './editorial';

const AudienceLevelSchema = z.object({
  public: z.boolean(),
  student: z.boolean(),
  clinician: z.boolean(),
});

/**
 * Standard sections for medication pages (10 sections as per spec)
 */
export const MEDICATION_SECTIONS = [
  'mechanism-of-action',
  'indications',
  'dosing',
  'side-effects',
  'contraindications',
  'interactions',
  'monitoring',
  'patient-counseling',
  'clinical-pearls',
  'references',
] as const;

export type MedicationSectionId = (typeof MEDICATION_SECTIONS)[number];

/**
 * Section titles mapping
 */
export const MEDICATION_SECTION_TITLES: Record<MedicationSectionId, string> = {
  'mechanism-of-action': 'Mechanism of Action',
  indications: 'Indications',
  dosing: 'Dosing',
  'side-effects': 'Side Effects',
  contraindications: 'Contraindications',
  interactions: 'Interactions',
  monitoring: 'Monitoring',
  'patient-counseling': 'Patient Counseling Points',
  'clinical-pearls': 'Clinical Pearls',
  references: 'References',
};

/**
 * Zod schema for medication metadata
 * All fields are required except optional ones explicitly marked
 */
const ChangelogEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  summary: z.string().min(1, 'Changelog summary is required'),
  version: z.number().int().positive(),
});

export const MedicationMetadataSchema = z.object({
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
  // Optional: drug class, generic name, brand names
  drugClass: z.string().optional(),
  genericName: z.string().optional(),
  brandNames: z.array(z.string()).default([]),
  relatedMedications: z.array(z.string()).default([]),
  // Publishing workflow fields
  status: z.enum(['draft', 'published']).default('published'),
  reviewCadenceMonths: z.number().int().positive().default(12),
  nextReviewDue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  changelog: z.array(ChangelogEntrySchema).default([]),
  // Search synonyms
  synonyms: z.array(z.string()).default([]),
});

export type MedicationMetadata = z.infer<typeof MedicationMetadataSchema>;

/**
 * Medication content structure
 */
export interface MedicationContent {
  metadata: MedicationMetadata;
  sections: Record<MedicationSectionId, ContentSection>;
  rawContent?: string; // Full MDX content
  isLocaleSpecific?: boolean; // True if content exists in requested locale, false if falling back
}

/**
 * Type guard and validator for medication metadata
 */
export function validateMedicationMetadata(data: unknown): MedicationMetadata {
  return MedicationMetadataSchema.parse(data);
}

/**
 * Create default medication sections structure
 */
export function createDefaultMedicationSections(): Record<MedicationSectionId, ContentSection> {
  const sections: Partial<Record<MedicationSectionId, ContentSection>> = {};
  
  for (const sectionId of MEDICATION_SECTIONS) {
    sections[sectionId] = {
      id: sectionId,
      title: MEDICATION_SECTION_TITLES[sectionId],
      depth: sectionId === 'indications' ? 'basic' : 'intermediate',
      gated: false,
    };
  }
  
  return sections as Record<MedicationSectionId, ContentSection>;
}

