import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { Locale } from './types';

/**
 * Content directory paths
 */
export const CONTENT_DIR = join(process.cwd(), 'content');
export const CONDITIONS_DIR = join(CONTENT_DIR, 'conditions');
export const MEDICATIONS_DIR = join(CONTENT_DIR, 'medications');

/**
 * Generate slug from title or filename
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get content file path for a given slug and locale
 */
export function getContentPath(
  type: 'conditions' | 'medications',
  slug: string,
  locale: Locale = 'en'
): {
  mdxPath: string;
  metadataPath: string;
  fallbackMdxPath?: string;
  fallbackMetadataPath?: string;
} {
  const baseDir = type === 'conditions' ? CONDITIONS_DIR : MEDICATIONS_DIR;
  const itemDir = join(baseDir, slug);
  
  // Try locale-specific first
  const localeDir = join(itemDir, locale);
  const mdxPath = join(localeDir, 'index.mdx');
  const metadataPath = join(localeDir, 'metadata.json');
  
  // Fallback to root if locale-specific doesn't exist
  const fallbackMdxPath = join(itemDir, 'index.mdx');
  const fallbackMetadataPath = join(itemDir, 'metadata.json');
  
  return {
    mdxPath,
    metadataPath,
    fallbackMdxPath: locale !== 'en' ? fallbackMdxPath : undefined,
    fallbackMetadataPath: locale !== 'en' ? fallbackMetadataPath : undefined,
  };
}

/**
 * Read and parse JSON file
 */
export function readJSONFile<T>(path: string): T | null {
  try {
    if (!existsSync(path)) {
      return null;
    }
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${path}:`, error);
    return null;
  }
}

/**
 * Read and parse MDX file with frontmatter
 */
export function readMDXFile(path: string): { content: string; frontmatter: Record<string, unknown> } | null {
  try {
    if (!existsSync(path)) {
      return null;
    }
    const fileContent = readFileSync(path, 'utf-8');
    const { content, data } = matter(fileContent);
    return { content, frontmatter: data };
  } catch (error) {
    console.error(`Error reading MDX file ${path}:`, error);
    return null;
  }
}

/**
 * Get all content slugs for a given type
 */
export function getAllContentSlugs(type: 'conditions' | 'medications'): string[] {
  const baseDir = type === 'conditions' ? CONDITIONS_DIR : MEDICATIONS_DIR;
  
  if (!existsSync(baseDir)) {
    return [];
  }
  
  try {
    return readdirSync(baseDir)
      .filter((item) => {
        const itemPath = join(baseDir, item);
        return statSync(itemPath).isDirectory() && !item.startsWith('_');
      });
  } catch (error) {
    console.error(`Error reading content directory ${baseDir}:`, error);
    return [];
  }
}

/**
 * Validate locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'en' || locale === 'ar';
}

