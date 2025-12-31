import { existsSync } from 'fs';
import type { Locale, ContentDepth } from './types';
import type { ConditionContent, ConditionMetadata } from './schemas/condition';
import type { MedicationContent, MedicationMetadata } from './schemas/medication';
import { validateConditionMetadata } from './schemas/condition';
import { validateMedicationMetadata } from './schemas/medication';
import { getContentPath, readJSONFile, readMDXFile } from './utils';
import { CONDITION_SECTIONS, createDefaultConditionSections } from './schemas/condition';
import { MEDICATION_SECTIONS, createDefaultMedicationSections } from './schemas/medication';

/**
 * Load condition content for a given slug and locale
 */
export async function loadCondition(
  slug: string,
  locale: Locale = 'en'
): Promise<ConditionContent | null> {
  const paths = getContentPath('conditions', slug, locale);
  
  // Try locale-specific first, then fallback to root
  let metadata: ConditionMetadata | null = null;
  let mdxData: { content: string; frontmatter: Record<string, unknown> } | null = null;
  
  // Check if locale-specific files exist
  if (existsSync(paths.metadataPath)) {
    metadata = readJSONFile<ConditionMetadata>(paths.metadataPath);
  }
  if (existsSync(paths.mdxPath)) {
    mdxData = readMDXFile(paths.mdxPath);
  }
  
  // Fallback to root files if locale-specific not found
  if (!metadata && paths.fallbackMetadataPath && existsSync(paths.fallbackMetadataPath)) {
    metadata = readJSONFile<ConditionMetadata>(paths.fallbackMetadataPath);
  }
  if (!mdxData && paths.fallbackMdxPath && existsSync(paths.fallbackMdxPath)) {
    mdxData = readMDXFile(paths.fallbackMdxPath);
  }
  
  if (!metadata) {
    console.error(`[loadCondition] No metadata found for slug: ${slug}, locale: ${locale}`);
    console.error(`[loadCondition] Tried paths:`, paths);
    return null;
  }
  
  // Validate metadata
  try {
    const validatedMetadata = validateConditionMetadata(metadata);
    validatedMetadata.locale = locale;
    
    // Create sections structure
    const sections = createDefaultConditionSections();
    
    // If MDX content exists, we'll parse it to extract sections
    // For now, we'll store the raw content
    const rawContent = mdxData?.content || '';
    
    return {
      metadata: validatedMetadata,
      sections,
      rawContent,
    };
  } catch (error) {
    console.error(`Error validating condition metadata for ${slug}:`, error);
    return null;
  }
}

/**
 * Load medication content for a given slug and locale
 */
export async function loadMedication(
  slug: string,
  locale: Locale = 'en'
): Promise<MedicationContent | null> {
  const paths = getContentPath('medications', slug, locale);
  
  // Try locale-specific first, then fallback to root
  let metadata: MedicationMetadata | null = null;
  let mdxData: { content: string; frontmatter: Record<string, unknown> } | null = null;
  
  // Check if locale-specific files exist
  if (existsSync(paths.metadataPath)) {
    metadata = readJSONFile<MedicationMetadata>(paths.metadataPath);
  }
  if (existsSync(paths.mdxPath)) {
    mdxData = readMDXFile(paths.mdxPath);
  }
  
  // Fallback to root files if locale-specific not found
  if (!metadata && paths.fallbackMetadataPath && existsSync(paths.fallbackMetadataPath)) {
    metadata = readJSONFile<MedicationMetadata>(paths.fallbackMetadataPath);
  }
  if (!mdxData && paths.fallbackMdxPath && existsSync(paths.fallbackMdxPath)) {
    mdxData = readMDXFile(paths.fallbackMdxPath);
  }
  
  if (!metadata) {
    console.error(`[loadMedication] No metadata found for slug: ${slug}, locale: ${locale}`);
    console.error(`[loadMedication] Tried paths:`, paths);
    return null;
  }
  
  // Validate metadata
  try {
    const validatedMetadata = validateMedicationMetadata(metadata);
    validatedMetadata.locale = locale;
    
    // Create sections structure
    const sections = createDefaultMedicationSections();
    
    // If MDX content exists, we'll parse it to extract sections
    // For now, we'll store the raw content
    const rawContent = mdxData?.content || '';
    
    return {
      metadata: validatedMetadata,
      sections,
      rawContent,
    };
  } catch (error) {
    console.error(`Error validating medication metadata for ${slug}:`, error);
    return null;
  }
}

/**
 * Filter content sections by depth level
 */
export function filterSectionsByDepth<T extends Record<string, { depth: ContentDepth }>>(
  sections: T,
  depth: ContentDepth
): Partial<T> {
  const depthOrder: Record<ContentDepth, number> = {
    basic: 1,
    intermediate: 2,
    advanced: 3,
  };
  
  const targetDepth = depthOrder[depth];
  const filtered = {} as Partial<T>;
  
  for (const [key, section] of Object.entries(sections)) {
    if (depthOrder[section.depth] <= targetDepth) {
      (filtered as Record<string, { depth: ContentDepth }>)[key] = section;
    }
  }
  
  return filtered;
}

/**
 * Get all condition slugs
 */
export function getAllConditionSlugs(): string[] {
  const { getAllContentSlugs } = require('./utils');
  return getAllContentSlugs('conditions');
}

/**
 * Get all medication slugs
 */
export function getAllMedicationSlugs(): string[] {
  const { getAllContentSlugs } = require('./utils');
  return getAllContentSlugs('medications');
}

