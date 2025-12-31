#!/usr/bin/env node

/**
 * Content validation script
 * Run this before builds to ensure all content metadata is valid
 * Usage: npm run validate:content
 */

import { validateAllContent } from '../lib/content/validator';

try {
  validateAllContent();
  process.exit(0);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}

