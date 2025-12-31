import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SearchIndexEntry } from '@/lib/search/index';
import { expandQueryWithSynonyms } from '@/lib/search/synonyms';

export interface SearchResult {
  entry: SearchIndexEntry;
  score: number;
  matchedFields: string[];
}

/**
 * Search across indexed content
 * Reads from build-time generated search index
 */
function performSearch(
  index: SearchIndexEntry[],
  query: string,
  locale?: string,
  type?: 'condition' | 'medication'
): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const locale = searchParams.get('locale') || undefined;
  const type = searchParams.get('type') as 'condition' | 'medication' | undefined;
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    // Read search index from build-time generated file
    const indexPath = join(process.cwd(), 'public', 'search-index.json');
    let index: SearchIndexEntry[] = [];
    
    try {
      const fileContent = readFileSync(indexPath, 'utf-8');
      index = JSON.parse(fileContent);
    } catch (error) {
      console.error('Search index not found, returning empty results:', error);
      return NextResponse.json({ results: [] });
    }
    
    // Perform search
    const results = performSearch(index, query, locale, type);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

