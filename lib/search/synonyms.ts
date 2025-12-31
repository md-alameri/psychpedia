/**
 * Global synonyms mapping for search
 * Maps common terms, abbreviations, and alternative names to their canonical forms
 */

export interface SynonymMap {
  [key: string]: string[];
}

/**
 * Global synonyms that apply across all content
 * Key is the canonical term, value is array of synonyms
 */
export const globalSynonyms: SynonymMap = {
  // Common abbreviations
  'major depressive disorder': ['mdd', 'depression', 'clinical depression', 'unipolar depression'],
  'generalized anxiety disorder': ['gad', 'anxiety', 'anxiety disorder'],
  'post-traumatic stress disorder': ['ptsd', 'trauma', 'traumatic stress'],
  'attention deficit hyperactivity disorder': ['adhd', 'add', 'attention deficit'],
  'obsessive-compulsive disorder': ['ocd'],
  'bipolar disorder': ['bipolar', 'manic depression', 'bpd'],
  'selective serotonin reuptake inhibitor': ['ssri', 'ssris'],
  'serotonin-norepinephrine reuptake inhibitor': ['snri', 'snris'],
  'antidepressant': ['antidepressants', 'ad'],
  'antipsychotic': ['antipsychotics', 'neuroleptic', 'neuroleptics'],
  'mood stabilizer': ['mood stabilizers'],
  'benzodiazepine': ['benzodiazepines', 'benzo', 'benzos'],
  'stimulant': ['stimulants'],
  
  // Medication classes
  'ssris': ['selective serotonin reuptake inhibitors', 'ssri'],
  'snris': ['serotonin-norepinephrine reuptake inhibitors', 'snri'],
  'tcas': ['tricyclic antidepressants', 'tca'],
  'maois': ['monoamine oxidase inhibitors', 'maoi'],
  
  // Common terms
  'suicide': ['suicidal', 'suicidality', 'self-harm'],
  'overdose': ['od', 'poisoning'],
  'withdrawal': ['discontinuation', 'tapering'],
  'side effect': ['adverse effect', 'adverse reaction', 'adr'],
  'drug interaction': ['interaction', 'drug-drug interaction', 'ddi'],
  
  // Conditions
  'schizophrenia': ['schizophrenic', 'schizoaffective'],
  'insomnia': ['sleep disorder', 'sleep disturbance'],
  'substance use disorder': ['sud', 'addiction', 'substance abuse', 'substance dependence'],
};

/**
 * Expand search query with synonyms
 * Returns array of search terms including original query and synonyms
 */
export function expandQueryWithSynonyms(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = [normalizedQuery];
  
  // Check if query matches any canonical term
  for (const [canonical, synonyms] of Object.entries(globalSynonyms)) {
    if (canonical.includes(normalizedQuery) || normalizedQuery.includes(canonical)) {
      terms.push(...synonyms);
      terms.push(canonical);
    }
    
    // Check if query matches any synonym
    for (const synonym of synonyms) {
      if (synonym.includes(normalizedQuery) || normalizedQuery.includes(synonym)) {
        terms.push(canonical);
        terms.push(...synonyms);
      }
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(terms));
}

/**
 * Get synonyms for a specific term
 */
export function getSynonyms(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  
  // Direct match
  if (globalSynonyms[normalized]) {
    return globalSynonyms[normalized];
  }
  
  // Check if term is a synonym
  for (const [canonical, synonyms] of Object.entries(globalSynonyms)) {
    if (synonyms.includes(normalized)) {
      return [canonical, ...synonyms.filter(s => s !== normalized)];
    }
  }
  
  return [];
}

