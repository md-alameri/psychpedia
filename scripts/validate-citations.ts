#!/usr/bin/env node

/**
 * Citation validation script
 * Checks that advanced sections have proper citations
 * Usage: npm run validate:citations
 */

import { validateCitations, ContentValidationError } from '../lib/content/validator';

try {
  const errors = validateCitations();
  if (errors.length > 0) {
    console.error('\n❌ Citation validation failed:\n');
    errors.forEach(({ file, error }) => {
      console.error(`  ${file}: ${error}`);
    });
    console.error('\n');
    process.exit(1);
  }
  console.log('✅ All citations validated successfully');
  process.exit(0);
} catch (error) {
  if (error instanceof ContentValidationError) {
    process.exit(1);
  }
  console.error('Unexpected error:', error);
  process.exit(1);
}

