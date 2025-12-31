'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { MedicationMetadata } from '@/lib/content/schemas/medication';
import type { EvidenceLevel } from '@/lib/content/types';

interface MedicationsIndexProps {
  medications: Array<MedicationMetadata & { slug: string }>;
  locale: Locale;
}

export default function MedicationsIndex({ medications, locale }: MedicationsIndexProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrugClass, setSelectedDrugClass] = useState<string>('');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<EvidenceLevel | ''>('');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'public' | 'student' | 'clinician'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'lastReviewed' | 'evidenceLevel'>('title');
  
  // Get all unique drug classes
  const allDrugClasses = useMemo(() => {
    const classes = new Set<string>();
    medications.forEach((medication) => {
      if (medication.drugClass) {
        classes.add(medication.drugClass);
      }
    });
    return Array.from(classes).sort();
  }, [medications]);
  
  // Filter and sort medications
  const filteredMedications = useMemo(() => {
    let filtered = medications.filter((medication) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          medication.title.toLowerCase().includes(query) ||
          medication.description.toLowerCase().includes(query) ||
          medication.genericName?.toLowerCase().includes(query) ||
          medication.brandNames?.some((name) => name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Drug class filter
      if (selectedDrugClass && medication.drugClass !== selectedDrugClass) {
        return false;
      }
      
      // Evidence level filter
      if (selectedEvidenceLevel && medication.editorial.evidenceLevel !== selectedEvidenceLevel) {
        return false;
      }
      
      // Audience filter
      if (selectedAudience !== 'all') {
        if (selectedAudience === 'public' && !medication.audienceLevel.public) return false;
        if (selectedAudience === 'student' && !medication.audienceLevel.student) return false;
        if (selectedAudience === 'clinician' && !medication.audienceLevel.clinician) return false;
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
  }, [medications, searchQuery, selectedDrugClass, selectedEvidenceLevel, selectedAudience, sortBy]);
  
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
            Medications
          </h1>
          <p className="text-lg text-text-secondary">
            Explore our comprehensive knowledge base of psychiatric medications
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
                placeholder="Search medications..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            {/* Drug class filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Drug Class
              </label>
              <select
                value={selectedDrugClass}
                onChange={(e) => setSelectedDrugClass(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All classes</option>
                {allDrugClasses.map((drugClass) => (
                  <option key={drugClass} value={drugClass}>
                    {drugClass}
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
            Showing {filteredMedications.length} of {medications.length} medications
          </p>
        </div>
        
        {/* Medications grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <Link
              key={medication.slug}
              href={`/${locale}/medications/${medication.slug}`}
              className="bg-background-light border border-border rounded-lg p-6 hover:shadow-soft transition-shadow"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {medication.title}
              </h3>
              {medication.genericName && (
                <p className="text-sm text-text-muted mb-2">
                  {medication.genericName}
                </p>
              )}
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                {medication.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>Level {medication.editorial.evidenceLevel}</span>
                <span>•</span>
                <span>Reviewed {new Date(medication.editorial.lastReviewed).toLocaleDateString()}</span>
              </div>
              {medication.drugClass && (
                <div className="mt-4">
                  <span className="px-2 py-1 bg-background-off text-xs text-text-secondary rounded">
                    {medication.drugClass}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
        
        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No medications found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

