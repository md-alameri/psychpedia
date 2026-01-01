import type { Locale } from '@/lib/content/types';
import type { ConditionContent, ConditionMetadata } from '@/lib/content/schemas/condition';
import type { MedicationContent, MedicationMetadata } from '@/lib/content/schemas/medication';
import type { GovernanceContent, GovernanceMetadata } from '@/lib/content/schemas/governance';

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8000';
const API_BASE = process.env.CMS_API_BASE || `${CMS_URL}/api/v2`;

/**
 * Helper to check if CMS is explicitly configured
 */
function isCMSExplicitlyConfigured(): boolean {
  return 'NEXT_PUBLIC_CMS_URL' in process.env || 'CMS_API_BASE' in process.env;
}

/**
 * Helper to format fetch errors with more context
 */
function formatFetchError(error: unknown, url: string): string {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return `Network error: Unable to connect to CMS at ${url}. Is the CMS running?`;
  }
  if (error instanceof Error) {
    return `${error.message} (URL: ${url})`;
  }
  return `Unknown error fetching from ${url}`;
}

interface WagtailPageResponse {
  id: number;
  meta: {
    type: string;
    detail_url: string;
    html_url: string;
    slug: string;
    first_published_at: string;
    locale: string;
  };
  title: string;
  [key: string]: any;
}

interface WagtailPagesResponse {
  meta: {
    total_count: number;
  };
  items: WagtailPageResponse[];
}

/**
 * Transform Wagtail condition page to ConditionMetadata format
 */
function transformCondition(wagtail: WagtailPageResponse, locale: Locale): ConditionMetadata {
  return {
    slug: wagtail.meta.slug,
    title: wagtail.title,
    description: wagtail.description || '',
    editorial: {
      lastReviewed: wagtail.last_reviewed || new Date().toISOString().split('T')[0],
      reviewer: {
        name: wagtail.reviewer_name || '',
        role: wagtail.reviewer_role || '',
        credentials: [], // Wagtail doesn't store credentials array
      },
      evidenceStrength: 'guideline',
      evidenceLevel: wagtail.evidence_level || 'C',
      version: 1, // Wagtail doesn't have changelog version
    },
    locale,
    audienceLevel: {
      public: wagtail.audience_public ?? true,
      student: wagtail.audience_student ?? false,
      clinician: wagtail.audience_clinician ?? false,
    },
    publicSummary: wagtail.public_summary,
    category: wagtail.category,
    tags: [], // Tags would need to be fetched separately or included in API
    relatedConditions: [],
    synonyms: [],
    status: (wagtail.meta.type === 'conditions.ConditionPage' ? 'published' : 'draft') as 'published' | 'draft',
    reviewCadenceMonths: wagtail.review_cadence_months || 12,
    nextReviewDue: wagtail.next_review_due,
    changelog: [],
    citations: [],
  };
}

/**
 * Transform Wagtail medication page to MedicationMetadata format
 */
function transformMedication(wagtail: WagtailPageResponse, locale: Locale): MedicationMetadata {
  return {
    slug: wagtail.meta.slug,
    title: wagtail.title,
    description: wagtail.description || '',
    editorial: {
      lastReviewed: wagtail.last_reviewed || new Date().toISOString().split('T')[0],
      reviewer: {
        name: wagtail.reviewer_name || '',
        role: wagtail.reviewer_role || '',
        credentials: [],
      },
      evidenceStrength: 'guideline',
      evidenceLevel: wagtail.evidence_level || 'C',
      version: 1,
    },
    locale,
    audienceLevel: {
      public: wagtail.audience_public ?? true,
      student: wagtail.audience_student ?? false,
      clinician: wagtail.audience_clinician ?? false,
    },
    publicSummary: wagtail.public_summary,
    drugClass: wagtail.drug_class,
    genericName: wagtail.generic_name,
    brandNames: wagtail.brand_names ? wagtail.brand_names.split(',').map((s: string) => s.trim()) : [],
    status: (wagtail.meta.type === 'medications.MedicationPage' ? 'published' : 'draft') as 'published' | 'draft',
    reviewCadenceMonths: wagtail.review_cadence_months || 12,
    nextReviewDue: wagtail.next_review_due,
    changelog: [],
    synonyms: [],
    citations: [],
    relatedMedications: [],
  };
}

/**
 * Transform Wagtail governance page to GovernanceMetadata format
 */
function transformGovernance(wagtail: WagtailPageResponse, locale: Locale): GovernanceMetadata {
  return {
    slug: wagtail.meta.slug,
    title: wagtail.title,
    description: wagtail.description || '',
    locale,
    status: 'published',
    lastUpdated: wagtail.last_updated || new Date().toISOString().split('T')[0],
  };
}

/**
 * Fetch condition from Wagtail CMS
 */
export async function fetchCondition(
  locale: Locale,
  slug: string,
  previewToken?: string
): Promise<ConditionContent | null> {
  if (!isCMSExplicitlyConfigured()) {
    return null;
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('slug', slug);
    url.searchParams.set('type', 'conditions.ConditionPage');
    url.searchParams.set('fields', '*');

    const response = await fetch(url.toString(), {
      headers: previewToken
        ? {
            Authorization: `Bearer ${previewToken}`,
          }
        : {},
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const wagtail = data.items[0];
    const metadata = transformCondition(wagtail, locale);

    return {
      metadata,
      sections: {} as any,
      rawContent: wagtail.body_public || '',
      isLocaleSpecific: wagtail.meta.locale === locale,
    } as ConditionContent;
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching condition:', errorMessage);
    }
    return null;
  }
}

/**
 * Fetch medication from Wagtail CMS
 */
export async function fetchMedication(
  locale: Locale,
  slug: string,
  previewToken?: string
): Promise<MedicationContent | null> {
  if (!isCMSExplicitlyConfigured()) {
    return null;
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('slug', slug);
    url.searchParams.set('type', 'medications.MedicationPage');
    url.searchParams.set('fields', '*');

    const response = await fetch(url.toString(), {
      headers: previewToken
        ? {
            Authorization: `Bearer ${previewToken}`,
          }
        : {},
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const wagtail = data.items[0];
    const metadata = transformMedication(wagtail, locale);

    return {
      metadata,
      sections: {} as any,
      rawContent: wagtail.body_public || '',
      isLocaleSpecific: wagtail.meta.locale === locale,
    } as MedicationContent;
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching medication:', errorMessage);
    }
    return null;
  }
}

/**
 * Fetch governance page from Wagtail CMS
 */
export async function fetchGovernance(
  locale: Locale,
  slug: string,
  previewToken?: string
): Promise<GovernanceContent | null> {
  if (!isCMSExplicitlyConfigured()) {
    return null;
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('slug', slug);
    url.searchParams.set('type', 'governance.GovernancePage');
    url.searchParams.set('fields', '*');

    const response = await fetch(url.toString(), {
      headers: previewToken
        ? {
            Authorization: `Bearer ${previewToken}`,
          }
        : {},
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const wagtail = data.items[0];
    const metadata = transformGovernance(wagtail, locale);

    return {
      metadata,
      rawContent: wagtail.body || '',
      isLocaleSpecific: wagtail.meta.locale === locale,
    } as GovernanceContent;
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching governance page:', errorMessage);
    }
    return null;
  }
}

/**
 * Fetch all condition slugs for a locale
 */
export async function fetchAllConditionSlugs(locale: Locale): Promise<string[]> {
  if (!isCMSExplicitlyConfigured()) {
    return [];
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('type', 'conditions.ConditionPage');
    url.searchParams.set('fields', 'meta.slug');
    url.searchParams.set('limit', '1000');

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();
    return data.items.map(item => item.meta.slug);
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching condition slugs:', errorMessage);
    }
    return [];
  }
}

/**
 * Fetch all medication slugs for a locale
 */
export async function fetchAllMedicationSlugs(locale: Locale): Promise<string[]> {
  if (!isCMSExplicitlyConfigured()) {
    return [];
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('type', 'medications.MedicationPage');
    url.searchParams.set('fields', 'meta.slug');
    url.searchParams.set('limit', '1000');

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();
    return data.items.map(item => item.meta.slug);
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching medication slugs:', errorMessage);
    }
    return [];
  }
}

/**
 * Fetch conditions index with filters
 */
export async function fetchConditionsIndex(
  locale: Locale,
  filters?: {
    category?: string;
    tag?: string;
    search?: string;
  }
): Promise<Array<{ slug: string; title: string; description: string }>> {
  if (!isCMSExplicitlyConfigured()) {
    return [];
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('type', 'conditions.ConditionPage');
    url.searchParams.set('fields', 'title,description,meta.slug');
    url.searchParams.set('limit', '100'); // Always include limit for stable URL

    if (filters?.search) {
      url.searchParams.set('search', filters.search);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      // Log but don't throw - return empty array for build-time safety
      const errorMessage = formatFetchError(
        new Error(`CMS API error: ${response.status}`),
        url.toString()
      );
      console.warn('[CMS] Error fetching conditions index:', errorMessage);
      return [];
    }

    const data: WagtailPagesResponse = await response.json();
    // Ensure data.items exists and is an array
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('[CMS] Invalid response format from conditions index');
      return [];
    }
    return data.items.map(item => ({
      slug: item.meta.slug,
      title: item.title,
      description: item.description || '',
    }));
  } catch (error) {
    // Never throw - always return safe fallback
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    console.warn('[CMS] Error fetching conditions index:', errorMessage);
    return [];
  }
}

/**
 * Fetch medications index with filters
 */
export async function fetchMedicationsIndex(
  locale: Locale,
  filters?: {
    drugClass?: string;
    search?: string;
  }
): Promise<Array<{ slug: string; title: string; description: string; genericName: string }>> {
  if (!isCMSExplicitlyConfigured()) {
    return [];
  }

  try {
    const url = new URL(`${API_BASE}/pages/`);
    url.searchParams.set('type', 'medications.MedicationPage');
    url.searchParams.set('fields', 'title,description,generic_name,meta.slug');
    url.searchParams.set('limit', '100');

    if (filters?.search) {
      url.searchParams.set('search', filters.search);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status}`);
    }

    const data: WagtailPagesResponse = await response.json();
    return data.items.map(item => ({
      slug: item.meta.slug,
      title: item.title,
      description: item.description || '',
      genericName: item.generic_name || '',
    }));
  } catch (error) {
    const errorMessage = formatFetchError(error, `${API_BASE}/pages/`);
    if (process.env.NODE_ENV === 'development' || isCMSExplicitlyConfigured()) {
      console.error('[CMS] Error fetching medications index:', errorMessage);
    }
    return [];
  }
}

