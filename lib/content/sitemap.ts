import type { Locale } from './types';
import { getAllConditionSlugs, getAllMedicationSlugs, loadCondition, loadMedication } from './loader';

/**
 * Generate sitemap entries for all content
 */
export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap for conditions (excludes drafts)
 */
export async function generateConditionSitemapEntries(baseUrl: string = 'https://psychpedia.com'): Promise<SitemapEntry[]> {
  const slugs = getAllConditionSlugs();
  const entries: SitemapEntry[] = [];
  
  for (const slug of slugs) {
    // Check both locales, only include if published
    const enContent = await loadCondition(slug, 'en');
    const arContent = await loadCondition(slug, 'ar');
    
    if (enContent && enContent.metadata.status === 'published') {
      entries.push({
        url: `${baseUrl}/en/conditions/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
        lastModified: enContent.metadata.editorial.lastReviewed,
      });
    }
    
    if (arContent && arContent.metadata.status === 'published') {
      entries.push({
        url: `${baseUrl}/ar/conditions/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
        lastModified: arContent.metadata.editorial.lastReviewed,
      });
    }
  }
  
  return entries;
}

/**
 * Generate sitemap for medications (excludes drafts)
 */
export async function generateMedicationSitemapEntries(baseUrl: string = 'https://psychpedia.com'): Promise<SitemapEntry[]> {
  const slugs = getAllMedicationSlugs();
  const entries: SitemapEntry[] = [];
  
  for (const slug of slugs) {
    // Check both locales, only include if published
    const enContent = await loadMedication(slug, 'en');
    const arContent = await loadMedication(slug, 'ar');
    
    if (enContent && enContent.metadata.status === 'published') {
      entries.push({
        url: `${baseUrl}/en/medications/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
        lastModified: enContent.metadata.editorial.lastReviewed,
      });
    }
    
    if (arContent && arContent.metadata.status === 'published') {
      entries.push({
        url: `${baseUrl}/ar/medications/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
        lastModified: arContent.metadata.editorial.lastReviewed,
      });
    }
  }
  
  return entries;
}

/**
 * Generate complete sitemap (excludes drafts)
 */
export async function generateSitemap(baseUrl: string = 'https://psychpedia.com'): Promise<SitemapEntry[]> {
  const [conditions, medications] = await Promise.all([
    generateConditionSitemapEntries(baseUrl),
    generateMedicationSitemapEntries(baseUrl),
  ]);
  
  return [...conditions, ...medications];
}

