import { existsSync } from 'fs';
import { join } from 'path';
import type { Locale, ContentDepth } from './types';
import type { ConditionContent, ConditionMetadata } from './schemas/condition';
import type { MedicationContent, MedicationMetadata } from './schemas/medication';
import type { GovernanceContent, GovernanceMetadata } from './schemas/governance';
import { validateConditionMetadata } from './schemas/condition';
import { validateMedicationMetadata } from './schemas/medication';
import { validateGovernanceMetadata } from './schemas/governance';
import { getContentPath, readJSONFile, readMDXFile, CONTENT_DIR } from './utils';
import { CONDITION_SECTIONS, createDefaultConditionSections } from './schemas/condition';
import { MEDICATION_SECTIONS, createDefaultMedicationSections } from './schemas/medication';
import {
  fetchCondition as fetchConditionFromCMS,
  fetchMedication as fetchMedicationFromCMS,
  fetchGovernance as fetchGovernanceFromCMS,
} from '@/lib/cms';

/**
 * Load condition content for a given slug and locale
 * Tries CMS first, falls back to local files
 */
export async function loadCondition(
  slug: string,
  locale: Locale = 'en'
): Promise<ConditionContent | null> {
  // Try CMS first if configured
  // Use centralized config check - fail gracefully if CMS is not configured
  const { isCMSConfigured } = await import('@/lib/cms/config');
  if (isCMSConfigured()) {
    try {
      const cmsContent = await fetchConditionFromCMS(locale, slug);
      if (cmsContent) {
        return cmsContent;
      }
    } catch (error) {
      // Log warning during build, but don't throw - graceful degradation
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[loadCondition] CMS fetch failed for ${slug}, falling back to local files:`, error);
      }
    }
  }

  // Fallback to local files
  const paths = getContentPath('conditions', slug, locale);
  
  // Try locale-specific first, then fallback to root
  let metadata: ConditionMetadata | null = null;
  let mdxData: { content: string; frontmatter: Record<string, unknown> } | null = null;
  let isLocaleSpecific = false;
  
  // Check if locale-specific files exist
  if (existsSync(paths.metadataPath)) {
    metadata = readJSONFile<ConditionMetadata>(paths.metadataPath);
    isLocaleSpecific = true;
  }
  if (existsSync(paths.mdxPath)) {
    mdxData = readMDXFile(paths.mdxPath);
  }
  
  // Fallback to root files if locale-specific not found
  if (!metadata && paths.fallbackMetadataPath && existsSync(paths.fallbackMetadataPath)) {
    metadata = readJSONFile<ConditionMetadata>(paths.fallbackMetadataPath);
    isLocaleSpecific = false;
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
    // Set the requested locale, not the content's original locale
    validatedMetadata.locale = locale;
    
    // Calculate nextReviewDue if not provided
    if (!validatedMetadata.nextReviewDue) {
      const lastReviewed = new Date(validatedMetadata.editorial.lastReviewed);
      const nextReview = new Date(lastReviewed);
      nextReview.setMonth(nextReview.getMonth() + validatedMetadata.reviewCadenceMonths);
      validatedMetadata.nextReviewDue = nextReview.toISOString().split('T')[0];
    }
    
    // Validate published content requirements
    if (validatedMetadata.status === 'published') {
      if (!validatedMetadata.editorial.lastReviewed) {
        throw new Error('Published content must have lastReviewed date');
      }
      if (!validatedMetadata.editorial.reviewer.name) {
        throw new Error('Published content must have reviewer name');
      }
    }
    
    // Create sections structure
    const sections = createDefaultConditionSections();
    
    // If MDX content exists, we'll parse it to extract sections
    // For now, we'll store the raw content
    const rawContent = mdxData?.content || '';
    
    return {
      metadata: validatedMetadata,
      sections,
      rawContent,
      isLocaleSpecific, // Track if content is actually in requested locale
    };
  } catch (error) {
    console.error(`Error validating condition metadata for ${slug}:`, error);
    return null;
  }
}

/**
 * Load medication content for a given slug and locale
 * Tries CMS first, falls back to local files
 */
export async function loadMedication(
  slug: string,
  locale: Locale = 'en'
): Promise<MedicationContent | null> {
  // Try CMS first if configured
  // Use centralized config check - fail gracefully if CMS is not configured
  const { isCMSConfigured } = await import('@/lib/cms/config');
  if (isCMSConfigured()) {
    try {
      const cmsContent = await fetchMedicationFromCMS(locale, slug);
      if (cmsContent) {
        return cmsContent;
      }
    } catch (error) {
      console.warn(`[loadMedication] CMS fetch failed for ${slug}, falling back to local files:`, error);
    }
  }

  // Fallback to local files
  const paths = getContentPath('medications', slug, locale);
  
  // Try locale-specific first, then fallback to root
  let metadata: MedicationMetadata | null = null;
  let mdxData: { content: string; frontmatter: Record<string, unknown> } | null = null;
  let isLocaleSpecific = false;
  
  // Check if locale-specific files exist
  if (existsSync(paths.metadataPath)) {
    metadata = readJSONFile<MedicationMetadata>(paths.metadataPath);
    isLocaleSpecific = true;
  }
  if (existsSync(paths.mdxPath)) {
    mdxData = readMDXFile(paths.mdxPath);
  }
  
  // Fallback to root files if locale-specific not found
  if (!metadata && paths.fallbackMetadataPath && existsSync(paths.fallbackMetadataPath)) {
    metadata = readJSONFile<MedicationMetadata>(paths.fallbackMetadataPath);
    isLocaleSpecific = false;
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
    // Set the requested locale, not the content's original locale
    validatedMetadata.locale = locale;
    
    // Calculate nextReviewDue if not provided
    if (!validatedMetadata.nextReviewDue) {
      const lastReviewed = new Date(validatedMetadata.editorial.lastReviewed);
      const nextReview = new Date(lastReviewed);
      nextReview.setMonth(nextReview.getMonth() + validatedMetadata.reviewCadenceMonths);
      validatedMetadata.nextReviewDue = nextReview.toISOString().split('T')[0];
    }
    
    // Validate published content requirements
    if (validatedMetadata.status === 'published') {
      if (!validatedMetadata.editorial.lastReviewed) {
        throw new Error('Published content must have lastReviewed date');
      }
      if (!validatedMetadata.editorial.reviewer.name) {
        throw new Error('Published content must have reviewer name');
      }
    }
    
    // Create sections structure
    const sections = createDefaultMedicationSections();
    
    // If MDX content exists, we'll parse it to extract sections
    // For now, we'll store the raw content
    const rawContent = mdxData?.content || '';
    
    return {
      metadata: validatedMetadata,
      sections,
      rawContent,
      isLocaleSpecific, // Track if content is actually in requested locale
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

/**
 * Load governance page content for a given slug and locale
 * Tries CMS first, falls back to local files
 */
export async function loadGovernance(
  slug: string,
  locale: Locale = 'en'
): Promise<GovernanceContent | null> {
  // Try CMS first if configured
  // Use centralized config check - fail gracefully if CMS is not configured
  const { isCMSConfigured } = await import('@/lib/cms/config');
  if (isCMSConfigured()) {
    try {
      const cmsContent = await fetchGovernanceFromCMS(locale, slug);
      if (cmsContent) {
        return cmsContent;
      }
    } catch (error) {
      console.warn(`[loadGovernance] CMS fetch failed for ${slug}, falling back to local files:`, error);
    }
  }

  // Fallback to local files
  const governanceDir = join(CONTENT_DIR, 'governance', slug);
  
  // Try locale-specific first, then fallback to root
  let metadata: GovernanceMetadata | null = null;
  let mdxData: { content: string; frontmatter: Record<string, unknown> } | null = null;
  let isLocaleSpecific = false;
  
  // Check if locale-specific files exist
  const localeDir = join(governanceDir, locale);
  const localeMdxPath = join(localeDir, 'index.mdx');
  const localeMetadataPath = join(localeDir, 'metadata.json');
  
  if (existsSync(localeMetadataPath)) {
    metadata = readJSONFile<GovernanceMetadata>(localeMetadataPath);
    isLocaleSpecific = true;
  }
  if (existsSync(localeMdxPath)) {
    mdxData = readMDXFile(localeMdxPath);
  }
  
  // Fallback to root files if locale-specific not found
  const rootMdxPath = join(governanceDir, 'index.mdx');
  const rootMetadataPath = join(governanceDir, 'metadata.json');
  
  if (!metadata && existsSync(rootMetadataPath)) {
    metadata = readJSONFile<GovernanceMetadata>(rootMetadataPath);
    isLocaleSpecific = false;
  }
  if (!mdxData && existsSync(rootMdxPath)) {
    mdxData = readMDXFile(rootMdxPath);
  }
  
  // If Arabic was requested but not found, try English explicitly
  if (!metadata && locale === 'ar') {
    const enDir = join(governanceDir, 'en');
    const enMdxPath = join(enDir, 'index.mdx');
    const enMetadataPath = join(enDir, 'metadata.json');
    
    if (existsSync(enMetadataPath)) {
      metadata = readJSONFile<GovernanceMetadata>(enMetadataPath);
      isLocaleSpecific = false;
    }
    if (!mdxData && existsSync(enMdxPath)) {
      mdxData = readMDXFile(enMdxPath);
    }
  }
  
  if (!metadata) {
    console.error(`[loadGovernance] No metadata found for slug: ${slug}, locale: ${locale}`);
    return null;
  }
  
  // Validate metadata
  try {
    const validatedMetadata = validateGovernanceMetadata(metadata);
    // Set the requested locale, not the content's original locale
    validatedMetadata.locale = locale;
    
    const rawContent = mdxData?.content || '';
    
    return {
      metadata: validatedMetadata,
      rawContent,
      isLocaleSpecific,
    };
  } catch (error) {
    console.error(`Error validating governance metadata for ${slug}:`, error);
    return null;
  }
}

