import type { Locale } from './types';
import { getAllConditionSlugs, getAllMedicationSlugs } from './loader';

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
 * Generate sitemap for conditions
 */
export function generateConditionSitemapEntries(baseUrl: string = 'https://psychpedia.com'): SitemapEntry[] {
  const slugs = getAllConditionSlugs();
  const entries: SitemapEntry[] = [];
  
  for (const slug of slugs) {
    entries.push({
      url: `${baseUrl}/en/conditions/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    entries.push({
      url: `${baseUrl}/ar/conditions/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }
  
  return entries;
}

/**
 * Generate sitemap for medications
 */
export function generateMedicationSitemapEntries(baseUrl: string = 'https://psychpedia.com'): SitemapEntry[] {
  const slugs = getAllMedicationSlugs();
  const entries: SitemapEntry[] = [];
  
  for (const slug of slugs) {
    entries.push({
      url: `${baseUrl}/en/medications/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    entries.push({
      url: `${baseUrl}/ar/medications/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }
  
  return entries;
}

/**
 * Generate complete sitemap
 */
export function generateSitemap(baseUrl: string = 'https://psychpedia.com'): SitemapEntry[] {
  return [
    ...generateConditionSitemapEntries(baseUrl),
    ...generateMedicationSitemapEntries(baseUrl),
  ];
}

