import { getSearchIndex, type SearchIndexEntry } from './index';
import { expandQueryWithSynonyms } from './synonyms';

export interface SearchResult {
  entry: SearchIndexEntry;
  score: number;
  matchedFields: string[];
}

/**
 * Search across all indexed content
 * Supports synonyms and full-text matching
 */
export async function search(
  query: string,
  locale?: string,
  type?: 'condition' | 'medication'
): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const index = await getSearchIndex();
  const normalizedQuery = query.toLowerCase().trim();
  const searchTerms = expandQueryWithSynonyms(normalizedQuery);
  
  const results: SearchResult[] = [];
  
  for (const entry of index) {
    // Filter by locale if specified
    if (locale && entry.locale !== locale) {
      continue;
    }
    
    // Filter by type if specified
    if (type && entry.type !== type) {
      continue;
    }
    
    let score = 0;
    const matchedFields: string[] = [];
    
    // Check each search term
    for (const term of searchTerms) {
      // Title match (highest weight)
      if (entry.title.toLowerCase().includes(term)) {
        score += 10;
        if (!matchedFields.includes('title')) {
          matchedFields.push('title');
        }
      }
      
      // Exact title match (even higher weight)
      if (entry.title.toLowerCase() === term) {
        score += 20;
      }
      
      // Description match
      if (entry.description.toLowerCase().includes(term)) {
        score += 5;
        if (!matchedFields.includes('description')) {
          matchedFields.push('description');
        }
      }
      
      // Synonym match
      if (entry.synonyms.some(syn => syn.toLowerCase().includes(term))) {
        score += 8;
        if (!matchedFields.includes('synonyms')) {
          matchedFields.push('synonyms');
        }
      }
      
      // Tag match
      if (entry.tags?.some(tag => tag.toLowerCase().includes(term))) {
        score += 3;
        if (!matchedFields.includes('tags')) {
          matchedFields.push('tags');
        }
      }
      
      // Drug class match (for medications)
      if (entry.drugClass?.toLowerCase().includes(term)) {
        score += 7;
        if (!matchedFields.includes('drugClass')) {
          matchedFields.push('drugClass');
        }
      }
      
      // Generic name match (for medications)
      if (entry.genericName?.toLowerCase().includes(term)) {
        score += 9;
        if (!matchedFields.includes('genericName')) {
          matchedFields.push('genericName');
        }
      }
      
      // Brand name match (for medications)
      if (entry.brandNames?.some(name => name.toLowerCase().includes(term))) {
        score += 6;
        if (!matchedFields.includes('brandNames')) {
          matchedFields.push('brandNames');
        }
      }
    }
    
    // Only include results with matches
    if (score > 0) {
      results.push({
        entry,
        score,
        matchedFields,
      });
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Get search suggestions based on query
 * Returns top N results for autocomplete
 */
export async function getSearchSuggestions(
  query: string,
  locale?: string,
  limit: number = 5
): Promise<SearchIndexEntry[]> {
  const results = await search(query, locale);
  return results.slice(0, limit).map(r => r.entry);
}

