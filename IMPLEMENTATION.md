# Product Credibility & Content Ops Foundation - Implementation Summary

This document summarizes the implementation of the Product Credibility & Content Ops Foundation plan, which transforms Psychpedia into a credible medical product with trust & governance pages, improved audience experience, content operations workflow, and global search capabilities.

## Table of Contents

1. [Overview](#overview)
2. [Metadata Extensions & Content Ops](#metadata-extensions--content-ops)
3. [Trust & Governance Pages](#trust--governance-pages)
4. [Audience Experience Improvements](#audience-experience-improvements)
5. [Search & Discoverability](#search--discoverability)
6. [File Structure](#file-structure)
7. [Technical Details](#technical-details)

## Overview

The implementation adds foundational product layers that make Psychpedia feel like a legitimate, trustworthy medical platform. All changes are backward compatible with existing content.

## Metadata Extensions & Content Ops

### Schema Extensions

Extended both `ConditionMetadataSchema` and `MedicationMetadataSchema` with the following fields:

- **`status`**: `'draft' | 'published'` (default: `'published'`)
- **`reviewCadenceMonths`**: `number` (default: `12`)
- **`nextReviewDue`**: `string` (ISO date format, optional, auto-calculated)
- **`changelog`**: Array of changelog entries with `date`, `summary`, and `version`
- **`synonyms`**: Array of strings for search synonyms (default: `[]`)

### Content Loader Updates

**File**: `lib/content/loader.ts`

- Automatically calculates `nextReviewDue` if not provided (based on `lastReviewed` + `reviewCadenceMonths`)
- Validates published content requirements:
  - Must have `lastReviewed` date
  - Must have `reviewer.name`
- Filters drafts from public-facing pages

### Draft Filtering

- **Sitemap**: Updated to exclude draft content (`lib/content/sitemap.ts`)
- **Index Pages**: Conditions and medications index pages filter out drafts
- **Sitemap Route**: Made async to support draft filtering

### Content Health System

**File**: `lib/content/health.ts`

Health check utilities that identify:
- Overdue reviews (with severity based on days overdue)
- Missing citations
- Missing sections
- Missing reviewer information
- Draft content status

**File**: `app/[locale]/admin/content-health/page.tsx`

Admin dashboard showing:
- Summary statistics (total, published, drafts, overdue, with issues)
- Issues by type and severity
- Detailed content health report table
- Review status badges

**Component**: `components/admin/ContentHealthDashboard.tsx`
**Component**: `components/admin/ReviewOverdueBadge.tsx`

## Trust & Governance Pages

### Schema

**File**: `lib/content/schemas/governance.ts`

Created governance page schema with:
- `slug`, `title`, `description`, `locale`
- `status` (always `'published'`)
- `lastUpdated` (ISO date)

### Content Loader

**File**: `lib/content/loader.ts`

Added `loadGovernance()` function that:
- Loads governance pages with locale fallback
- Supports both locale-specific and root-level content

### Governance Pages Created

All pages include EN/AR translations:

1. **About** (`/about`)
   - Mission, vision, approach
   - Who we serve
   - Our commitment

2. **Editorial Policy** (`/editorial-policy`)
   - Editorial standards
   - Review process
   - Editorial board
   - Corrections process

3. **Methodology** (`/methodology`)
   - Evidence grading system (A/B/C/D)
   - Review cadence
   - Update process
   - Changelog documentation

4. **Sources Policy** (`/sources-policy`)
   - Acceptable evidence sources
   - Source quality criteria
   - Citation standards
   - Limitations

5. **Corrections Policy** (`/corrections`)
   - How to report errors
   - Correction process
   - Response times
   - Transparency commitment

**Content Location**: `content/governance/{page-slug}/[locale]/`

### Trust Badges Component

**File**: `components/content/TrustBadges.tsx`

Displays:
- Evidence level (A/B/C/D) with color coding
- Review cadence information
- Review status (overdue, due soon, up to date)
- Last reviewed date

## Audience Experience Improvements

### LocalStorage Persistence

**File**: `components/content/AudienceTabs.tsx`

- Audience preference persists across sessions
- Uses `localStorage` key: `psychpedia-audience-preference`
- Automatically loads saved preference on mount

### Audience Context

**File**: `lib/contexts/AudienceContext.tsx`

- Global audience state management
- `AudienceProvider` component wraps the app
- `useAudience()` hook for accessing audience state
- Integrated into `app/[locale]/layout.tsx`

### Audience-Specific Sections

**Component**: `components/content/UrgentCareSection.tsx`
- For public audience
- Shows red flags and when to seek urgent care
- Styled with red accent colors

**Component**: `components/content/StudentHighlights.tsx`
- For medical students
- Shows high-yield points, differentials, and exam tips
- Styled with blue accent colors

**Translations**: Added to `lib/i18n/messages/en.json` and `ar.json`

## Search & Discoverability

### Search Index

**File**: `lib/search/index.ts`

- Builds search index from all published content
- Indexes both conditions and medications
- Supports both EN and AR locales
- Caches index for performance
- `SearchIndexEntry` includes: id, type, slug, title, description, locale, synonyms, tags, category, drugClass, genericName, brandNames

### Synonyms System

**File**: `lib/search/synonyms.ts`

- Global synonyms mapping for common terms
- Includes abbreviations (MDD, GAD, PTSD, ADHD, etc.)
- Medication class synonyms (SSRIs, SNRIs, etc.)
- `expandQueryWithSynonyms()` function expands search queries
- `getSynonyms()` function retrieves synonyms for a term

### Search Implementation

**File**: `lib/search/search.ts`

- Full-text search with scoring system
- Synonym expansion
- Field-based matching with weights:
  - Title: 10-20 points
  - Description: 5 points
  - Synonyms: 8 points
  - Tags: 3 points
  - Drug class: 7 points
  - Generic name: 9 points
  - Brand names: 6 points
- Results sorted by relevance score
- Supports locale and type filtering

### Search UI

**Component**: `components/search/SearchModal.tsx`
- Modal overlay with backdrop
- Cmd+K (Mac) / Ctrl+K (Windows) keyboard shortcut
- ESC to close
- Debounced search input
- Responsive design

**Component**: `components/search/SearchResults.tsx`
- Displays search results with:
  - Content type badge
  - Locale indicator
  - Title and description
  - Matched fields badges
- Click to navigate to content

**Hook**: `hooks/useSearch.ts`
- Manages search state
- Handles keyboard shortcuts
- Debounces search queries
- Calls search API

**API Route**: `app/api/search/route.ts`
- Server-side search endpoint
- Accepts `q`, `locale`, and `type` query parameters
- Returns search results as JSON

**Integration**: Added `SearchModal` to `app/[locale]/layout.tsx`

## File Structure

### New Files Created

```
lib/
  content/
    schemas/
      governance.ts          # Governance page schema
    health.ts                 # Content health utilities
  contexts/
    AudienceContext.tsx      # Global audience state
  search/
    index.ts                 # Search index builder
    synonyms.ts              # Global synonyms mapping
    search.ts                # Search implementation
components/
  content/
    TrustBadges.tsx          # Trust indicators component
    UrgentCareSection.tsx    # Public audience section
    StudentHighlights.tsx    # Student audience section
  search/
    SearchModal.tsx          # Cmd+K search modal
    SearchResults.tsx        # Search results display
  admin/
    ContentHealthDashboard.tsx # Admin dashboard UI
    ReviewOverdueBadge.tsx   # Review status badge
hooks/
  useSearch.ts               # Search hook with keyboard shortcut
app/
  [locale]/
    about/
      page.tsx               # About page
    editorial-policy/
      page.tsx               # Editorial policy page
    methodology/
      page.tsx               # Methodology page
    sources-policy/
      page.tsx               # Sources policy page
    corrections/
      page.tsx               # Corrections page
    admin/
      content-health/
        page.tsx             # Admin dashboard page
  api/
    search/
      route.ts               # Search API endpoint
content/
  governance/
    about/
      [locale]/
        index.mdx            # About content
        metadata.json        # About metadata
    editorial-policy/
      [locale]/
        index.mdx
        metadata.json
    methodology/
      [locale]/
        index.mdx
        metadata.json
    sources-policy/
      [locale]/
        index.mdx
        metadata.json
    corrections/
      [locale]/
        index.mdx
        metadata.json
```

### Modified Files

```
lib/
  content/
    schemas/
      condition.ts           # Added status, reviewCadenceMonths, nextReviewDue, changelog, synonyms
      medication.ts          # Added status, reviewCadenceMonths, nextReviewDue, changelog, synonyms
    loader.ts                # Added draft filtering, review date calculation, governance loader
    sitemap.ts               # Added draft filtering
  i18n/
    messages/
      en.json                # Added trustBadges, urgentCare, studentHighlights translations
      ar.json                # Added trustBadges, urgentCare, studentHighlights translations
components/
  content/
    AudienceTabs.tsx         # Added localStorage persistence
app/
  [locale]/
    layout.tsx               # Added SearchModal and AudienceProvider
    conditions/
      page.tsx               # Added draft filtering
    medications/
      page.tsx               # Added draft filtering
  sitemap.ts                 # Made async for draft filtering
```

## Technical Details

### Backward Compatibility

All new metadata fields have defaults:
- `status`: defaults to `'published'`
- `reviewCadenceMonths`: defaults to `12`
- `changelog`: defaults to `[]`
- `synonyms`: defaults to `[]`
- `nextReviewDue`: auto-calculated if not provided

Existing content files will continue to work without modification.

### Content Status Workflow

1. **Draft Content**: 
   - Not included in sitemap
   - Not shown on index pages
   - Still accessible via direct URL (for preview purposes)

2. **Published Content**:
   - Must have `lastReviewed` date
   - Must have `reviewer.name`
   - Included in sitemap and index pages
   - `nextReviewDue` auto-calculated if not provided

### Search Performance

- Search index is cached after first build
- Search queries are debounced (300ms)
- API route handles server-side search
- Results are sorted by relevance score

### Audience Persistence

- Uses `localStorage` for cross-session persistence
- Key: `psychpedia-audience-preference`
- Automatically loads on component mount
- Updates immediately when changed

### Review Cadence

- High-priority content: 6 months
- Standard content: 12 months (default)
- Stable content: 18-24 months
- Overdue thresholds:
  - > 90 days: High severity
  - > 30 days: Medium severity
  - < 30 days: Low severity

## Usage Examples

### Adding Synonyms to Content

```json
{
  "slug": "major-depressive-disorder",
  "synonyms": ["mdd", "depression", "clinical depression", "unipolar depression"]
}
```

### Setting Content Status

```json
{
  "status": "draft",
  "reviewCadenceMonths": 6,
  "nextReviewDue": "2025-06-30"
}
```

### Adding Changelog Entry

```json
{
  "changelog": [
    {
      "date": "2025-01-15",
      "summary": "Updated treatment guidelines based on latest APA recommendations",
      "version": 2
    }
  ]
}
```

### Using Audience Context

```tsx
import { useAudience } from '@/lib/contexts/AudienceContext';

function MyComponent() {
  const { audienceDepth, setAudienceDepth } = useAudience();
  
  return (
    <button onClick={() => setAudienceDepth('advanced')}>
      Switch to Clinician View
    </button>
  );
}
```

### Using Search

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) to open the search modal, or use the search API:

```typescript
const response = await fetch('/api/search?q=depression&locale=en');
const { results } = await response.json();
```

## Next Steps

1. **Content Migration**: Update existing content metadata files to include new fields (optional, defaults work)
2. **Search Optimization**: Consider pre-building search index at build time for better performance
3. **Health Monitoring**: Set up automated alerts for overdue reviews
4. **Content Validation**: Add CI/CD checks to ensure published content meets requirements
5. **Analytics**: Track search queries and popular content

## Notes

- All governance pages are published by default (status is always 'published')
- Search index is built on-demand and cached
- Content health dashboard is accessible at `/admin/content-health` (consider adding authentication)
- Audience preference persists across browser sessions
- Draft content is excluded from public-facing pages but still accessible via direct URL

