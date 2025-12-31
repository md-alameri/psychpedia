import { z } from 'zod';
import type { Locale } from '../types';
import { EditorialMetadataSchema } from './editorial';

/**
 * Zod schema for governance page metadata
 */
export const GovernanceMetadataSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  locale: z.enum(['en', 'ar']),
  // Governance pages are always published
  status: z.literal('published').default('published'),
  // Last updated date
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type GovernanceMetadata = z.infer<typeof GovernanceMetadataSchema>;

/**
 * Governance content structure
 */
export interface GovernanceContent {
  metadata: GovernanceMetadata;
  rawContent: string; // Full MDX content
  isLocaleSpecific?: boolean; // True if content exists in requested locale, false if falling back
}

/**
 * Type guard and validator for governance metadata
 */
export function validateGovernanceMetadata(data: unknown): GovernanceMetadata {
  return GovernanceMetadataSchema.parse(data);
}

