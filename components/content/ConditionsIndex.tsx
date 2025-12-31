'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ConditionMetadata } from '@/lib/content/schemas/condition';
import type { EvidenceLevel } from '@/lib/content/types';

interface ConditionsIndexProps {
  conditions: Array<ConditionMetadata & { slug: string }>;
  locale: Locale;
}

export default function ConditionsIndex({ conditions, locale }: ConditionsIndexProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<EvidenceLevel | ''>('');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'public' | 'student' | 'clinician'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'lastReviewed' | 'evidenceLevel'>('title');
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    conditions.forEach((condition) => {
      condition.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [conditions]);
  
  // Filter and sort conditions
  const filteredConditions = useMemo(() => {
    let filtered = conditions.filter((condition) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          condition.title.toLowerCase().includes(query) ||
          condition.description.toLowerCase().includes(query) ||
          condition.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Tag filter
      if (selectedTag && !condition.tags?.includes(selectedTag)) {
        return false;
      }
      
      // Evidence level filter
      if (selectedEvidenceLevel && condition.editorial.evidenceLevel !== selectedEvidenceLevel) {
        return false;
      }
      
      // Audience filter
      if (selectedAudience !== 'all') {
        if (selectedAudience === 'public' && !condition.audienceLevel.public) return false;
        if (selectedAudience === 'student' && !condition.audienceLevel.student) return false;
        if (selectedAudience === 'clinician' && !condition.audienceLevel.clinician) return false;
      }
      
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'lastReviewed') {
        return b.editorial.lastReviewed.localeCompare(a.editorial.lastReviewed);
      } else if (sortBy === 'evidenceLevel') {
        const levelOrder = { A: 1, B: 2, C: 3, D: 4 };
        return levelOrder[a.editorial.evidenceLevel] - levelOrder[b.editorial.evidenceLevel];
      }
      return 0;
    });
    
    return filtered;
  }, [conditions, searchQuery, selectedTag, selectedEvidenceLevel, selectedAudience, sortBy]);
  
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
            Conditions
          </h1>
          <p className="text-lg text-text-secondary">
            Explore our comprehensive knowledge base of psychiatric conditions
          </p>
        </header>
        
        {/* Filters */}
        <div className="bg-background-light border border-border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conditions..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            {/* Tag filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Evidence level filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Evidence Level
              </label>
              <select
                value={selectedEvidenceLevel}
                onChange={(e) => setSelectedEvidenceLevel(e.target.value as EvidenceLevel | '')}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All levels</option>
                <option value="A">Level A</option>
                <option value="B">Level B</option>
                <option value="C">Level C</option>
                <option value="D">Level D</option>
              </select>
            </div>
            
            {/* Audience filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Audience
              </label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value as typeof selectedAudience)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All audiences</option>
                <option value="public">Public</option>
                <option value="student">Students</option>
                <option value="clinician">Clinicians</option>
              </select>
            </div>
          </div>
          
          {/* Sort */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium text-text-primary">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="title">Title</option>
              <option value="lastReviewed">Last Reviewed</option>
              <option value="evidenceLevel">Evidence Level</option>
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-text-secondary">
            Showing {filteredConditions.length} of {conditions.length} conditions
          </p>
        </div>
        
        {/* Conditions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConditions.map((condition) => (
            <Link
              key={condition.slug}
              href={`/${locale}/conditions/${condition.slug}`}
              className="bg-background-light border border-border rounded-lg p-6 hover:shadow-soft transition-shadow"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {condition.title}
              </h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                {condition.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>Level {condition.editorial.evidenceLevel}</span>
                <span>•</span>
                <span>Reviewed {new Date(condition.editorial.lastReviewed).toLocaleDateString()}</span>
              </div>
              {condition.tags && condition.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {condition.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background-off text-xs text-text-secondary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
        
        {filteredConditions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No conditions found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

