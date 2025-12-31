import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { validateConditionMetadata } from './schemas/condition';
import { validateMedicationMetadata } from './schemas/medication';
import { CONTENT_DIR, CONDITIONS_DIR, MEDICATIONS_DIR } from './utils';
import { readMDXFile } from './utils';

/**
 * Content validation system
 * Validates all content files and fails if any are invalid
 */

interface ValidationError {
  file: string;
  error: string;
}

export class ContentValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(`Content validation failed with ${errors.length} error(s)`);
    this.name = 'ContentValidationError';
  }
}

/**
 * Validate all condition content
 */
export function validateAllConditions(): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!statSync(CONDITIONS_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    return errors; // No conditions directory, skip
  }
  
  const conditionDirs = readdirSync(CONDITIONS_DIR).filter((item) => {
    const itemPath = join(CONDITIONS_DIR, item);
    return statSync(itemPath).isDirectory() && !item.startsWith('_');
  });
  
  for (const dir of conditionDirs) {
    const metadataPath = join(CONDITIONS_DIR, dir, 'metadata.json');
    
    try {
      if (!statSync(metadataPath, { throwIfNoEntry: false })?.isFile()) {
        errors.push({
          file: metadataPath,
          error: 'metadata.json file is missing',
        });
        continue;
      }
      
      const content = readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      validateConditionMetadata(metadata);
    } catch (error) {
      errors.push({
        file: metadataPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  return errors;
}

/**
 * Validate all medication content
 */
export function validateAllMedications(): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!statSync(MEDICATIONS_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    return errors; // No medications directory, skip
  }
  
  const medicationDirs = readdirSync(MEDICATIONS_DIR).filter((item) => {
    const itemPath = join(MEDICATIONS_DIR, item);
    return statSync(itemPath).isDirectory() && !item.startsWith('_');
  });
  
  for (const dir of medicationDirs) {
    const metadataPath = join(MEDICATIONS_DIR, dir, 'metadata.json');
    
    try {
      if (!statSync(metadataPath, { throwIfNoEntry: false })?.isFile()) {
        errors.push({
          file: metadataPath,
          error: 'metadata.json file is missing',
        });
        continue;
      }
      
      const content = readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      validateMedicationMetadata(metadata);
    } catch (error) {
      errors.push({
        file: metadataPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  return errors;
}

/**
 * Validate all content (conditions + medications)
 * Throws ContentValidationError if any validation fails
 */
export function validateAllContent(): void {
  const errors = [
    ...validateAllConditions(),
    ...validateAllMedications(),
  ];
  
  if (errors.length > 0) {
    console.error('\n❌ Content validation failed:\n');
    errors.forEach(({ file, error }) => {
      console.error(`  ${file}: ${error}`);
    });
    console.error('\n');
    throw new ContentValidationError(errors);
  }
  
  console.log('✅ All content validated successfully');
}

/**
 * Check if MDX content has citations/references section
 */
function hasCitations(content: string): boolean {
  // Check for References section (case-insensitive)
  const referencesPattern = /^##+\s+References?/im;
  if (referencesPattern.test(content)) {
    // Check if there's actual content after the References heading
    const match = content.match(/^##+\s+References?[\s\S]*$/im);
    if (match) {
      const referencesContent = match[0].replace(/^##+\s+References?\s*/i, '').trim();
      // Check for numbered list, bullet points, or citation-like content
      return referencesContent.length > 50 && (
        /^\d+\./m.test(referencesContent) || // Numbered list
        /^[-*•]/m.test(referencesContent) || // Bullet points
        /\[.*?\]\(.*?\)/.test(referencesContent) || // Markdown links
        /doi|pubmed|pmc|journal/i.test(referencesContent) // Citation indicators
      );
    }
  }
  return false;
}

/**
 * Check if content has advanced sections (Clinician Notes, advanced content)
 */
function hasAdvancedSections(content: string): boolean {
  const advancedPatterns = [
    /^##+\s+Clinician\s+Notes?/im,
    /^##+\s+Advanced/im,
    /^##+\s+Clinical\s+Pearls?/im,
    /treatment\s+algorithm/i,
    /dosing\s+strategy/i,
    /augmentation/i,
  ];
  
  return advancedPatterns.some((pattern) => pattern.test(content));
}

/**
 * Validate citations in advanced sections
 */
export function validateCitations(): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check conditions
  if (existsSync(CONDITIONS_DIR)) {
    const conditionDirs = readdirSync(CONDITIONS_DIR).filter((item) => {
      const itemPath = join(CONDITIONS_DIR, item);
      return statSync(itemPath).isDirectory() && !item.startsWith('_');
    });
    
    for (const dir of conditionDirs) {
      const mdxPath = join(CONDITIONS_DIR, dir, 'index.mdx');
      if (existsSync(mdxPath)) {
        const mdxData = readMDXFile(mdxPath);
        if (mdxData) {
          const { content } = mdxData;
          if (hasAdvancedSections(content) && !hasCitations(content)) {
            errors.push({
              file: mdxPath,
              error: 'Advanced sections detected but no citations/references found. Advanced content must include proper citations.',
            });
          }
        }
      }
    }
  }
  
  // Check medications
  if (existsSync(MEDICATIONS_DIR)) {
    const medicationDirs = readdirSync(MEDICATIONS_DIR).filter((item) => {
      const itemPath = join(MEDICATIONS_DIR, item);
      return statSync(itemPath).isDirectory() && !item.startsWith('_');
    });
    
    for (const dir of medicationDirs) {
      const mdxPath = join(MEDICATIONS_DIR, dir, 'index.mdx');
      if (existsSync(mdxPath)) {
        const mdxData = readMDXFile(mdxPath);
        if (mdxData) {
          const { content } = mdxData;
          if (hasAdvancedSections(content) && !hasCitations(content)) {
            errors.push({
              file: mdxPath,
              error: 'Advanced sections detected but no citations/references found. Advanced content must include proper citations.',
            });
          }
        }
      }
    }
  }
  
  return errors;
}

/**
 * Validate all content including citations
 */
export function validateAllContentWithCitations(): void {
  validateAllContent();
  
  const citationErrors = validateCitations();
  if (citationErrors.length > 0) {
    console.error('\n❌ Citation validation failed:\n');
    citationErrors.forEach(({ file, error }) => {
      console.error(`  ${file}: ${error}`);
    });
    console.error('\n');
    throw new ContentValidationError(citationErrors);
  }
  
  console.log('✅ All citations validated successfully');
}

