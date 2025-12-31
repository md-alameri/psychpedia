import { z } from 'zod';
import type { EditorialMetadata, EvidenceStrength, EvidenceLevel, Reviewer } from '../types';

/**
 * Zod schema for editorial metadata validation
 */
export const ReviewerSchema = z.object({
  name: z.string().min(1, 'Reviewer name is required'),
  role: z.string().min(1, 'Reviewer role is required'),
  credentials: z.array(z.string()).default([]),
});

export const EditorialMetadataSchema = z.object({
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  reviewer: ReviewerSchema,
  evidenceStrength: z.enum(['guideline', 'meta-analysis', 'expert-consensus']),
  evidenceLevel: z.enum(['A', 'B', 'C', 'D'], {
    message: 'Evidence level must be A, B, C, or D',
  }),
  version: z.number().int().positive(),
});

/**
 * Type guard and validator for editorial metadata
 */
export function validateEditorialMetadata(data: unknown): EditorialMetadata {
  return EditorialMetadataSchema.parse(data);
}

/**
 * Default editorial metadata for new content
 */
export function createDefaultEditorialMetadata(): EditorialMetadata {
  return {
    lastReviewed: new Date().toISOString().split('T')[0],
    reviewer: {
      name: '',
      role: '',
      credentials: [],
    },
    evidenceStrength: 'expert-consensus',
    evidenceLevel: 'D',
    version: 1,
  };
}

