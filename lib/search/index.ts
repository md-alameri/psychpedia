import { getAllConditionSlugs, getAllMedicationSlugs, loadCondition, loadMedication } from '@/lib/content/loader';
import type { Locale } from '@/lib/content/types';

export interface SearchIndexEntry {
  id: string;
  type: 'condition' | 'medication';
  slug: string;
  title: string;
  description: string;
  locale: Locale;
  synonyms: string[];
  // Additional searchable fields
  tags?: string[];
  category?: string;
  drugClass?: string;
  genericName?: string;
  brandNames?: string[];
}

/**
 * Build search index from all content
 * Indexes conditions and medications for both locales
 */
export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const index: SearchIndexEntry[] = [];
  
  // Index conditions
  const conditionSlugs = getAllConditionSlugs();
  for (const slug of conditionSlugs) {
    for (const locale of ['en', 'ar'] as Locale[]) {
      const content = await loadCondition(slug, locale);
      if (content && content.metadata.status === 'published') {
        index.push({
          id: `condition-${slug}-${locale}`,
          type: 'condition',
          slug,
          title: content.metadata.title,
          description: content.metadata.description,
          locale,
          synonyms: content.metadata.synonyms || [],
          tags: content.metadata.tags,
          category: content.metadata.category,
        });
      }
    }
  }
  
  // Index medications
  const medicationSlugs = getAllMedicationSlugs();
  for (const slug of medicationSlugs) {
    for (const locale of ['en', 'ar'] as Locale[]) {
      const content = await loadMedication(slug, locale);
      if (content && content.metadata.status === 'published') {
        index.push({
          id: `medication-${slug}-${locale}`,
          type: 'medication',
          slug,
          title: content.metadata.title,
          description: content.metadata.description,
          locale,
          synonyms: content.metadata.synonyms || [],
          drugClass: content.metadata.drugClass,
          genericName: content.metadata.genericName,
          brandNames: content.metadata.brandNames,
        });
      }
    }
  }
  
  return index;
}

/**
 * Get search index (cached for performance)
 * In production, this could be pre-built at build time
 */
let cachedIndex: SearchIndexEntry[] | null = null;

export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  if (cachedIndex === null) {
    cachedIndex = await buildSearchIndex();
  }
  return cachedIndex;
}

