#!/usr/bin/env tsx

/**
 * Migration script to import existing MDX content files into Payload CMS
 * 
 * Usage:
 *   tsx scripts/import-content-to-cms.ts [options]
 * 
 * Options:
 *   --dry-run          Don't actually create documents, just log what would be done
 *   --type=TYPE        Only import specific type (conditions|medications|governance)
 *   --locale=LOCALE    Only import specific locale (en|ar)
 *   --cms-url=URL      Override CMS URL (default: from CMS_URL env var)
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'util';

const CMS_URL = process.env.CMS_URL || 'http://localhost:3000';
const CMS_SECRET = process.env.CMS_SECRET || ''; // Optional: for authenticated requests

interface ImportOptions {
  dryRun: boolean;
  type?: 'conditions' | 'medications' | 'governance';
  locale?: 'en' | 'ar';
  cmsUrl: string;
}

interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
}

/**
 * Parse command line arguments
 */
function parseOptions(): ImportOptions {
  const { values } = parseArgs({
    options: {
      'dry-run': { type: 'boolean', default: false },
      'type': { type: 'string' },
      'locale': { type: 'string' },
      'cms-url': { type: 'string' },
    },
  });

  return {
    dryRun: values['dry-run'] || false,
    type: values['type'] as 'conditions' | 'medications' | 'governance' | undefined,
    locale: values['locale'] as 'en' | 'ar' | undefined,
    cmsUrl: values['cms-url'] || CMS_URL,
  };
}

/**
 * Create or update a document in Payload CMS
 */
async function createOrUpdateDocument(
  collection: string,
  data: Record<string, unknown>,
  options: ImportOptions
): Promise<boolean> {
  if (options.dryRun) {
    console.log(`[DRY RUN] Would create/update ${collection}:`, JSON.stringify(data, null, 2));
    return true;
  }

  try {
    // Check if document exists
    const checkUrl = new URL(`${options.cmsUrl}/api/${collection}`);
    checkUrl.searchParams.set('where[slug][equals]', data.slug as string);
    if (data.locale) {
      checkUrl.searchParams.set('where[locale][equals]', data.locale as string);
    }

    const checkResponse = await fetch(checkUrl.toString());
    if (!checkResponse.ok) {
      throw new Error(`Failed to check existing document: ${checkResponse.status}`);
    }

    const checkData: PayloadResponse<{ id: string }> = await checkResponse.json();
    const existingDoc = checkData.docs[0];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (CMS_SECRET) {
      headers['Authorization'] = `Bearer ${CMS_SECRET}`;
    }

    if (existingDoc) {
      // Update existing document
      const updateUrl = `${options.cmsUrl}/api/${collection}/${existingDoc.id}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        throw new Error(`Failed to update: ${updateResponse.status} ${error}`);
      }

      console.log(`✓ Updated ${collection}/${data.slug} (${data.locale || 'default'})`);
      return true;
    } else {
      // Create new document
      const createUrl = `${options.cmsUrl}/api/${collection}`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Failed to create: ${createResponse.status} ${error}`);
      }

      console.log(`✓ Created ${collection}/${data.slug} (${data.locale || 'default'})`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Failed to create/update ${collection}/${data.slug}:`, error);
    return false;
  }
}

/**
 * Import a condition
 */
async function importCondition(
  slug: string,
  locale: 'en' | 'ar',
  contentDir: string,
  options: ImportOptions
): Promise<boolean> {
  const conditionDir = join(contentDir, 'conditions', slug);
  const localeDir = join(conditionDir, locale);
  const metadataPath = existsSync(join(localeDir, 'metadata.json'))
    ? join(localeDir, 'metadata.json')
    : join(conditionDir, 'metadata.json');
  const mdxPath = existsSync(join(localeDir, 'index.mdx'))
    ? join(localeDir, 'index.mdx')
    : join(conditionDir, 'index.mdx');

  if (!existsSync(metadataPath)) {
    console.warn(`⚠ Skipping ${slug} (${locale}): metadata.json not found`);
    return false;
  }

  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const mdxContent = existsSync(mdxPath) ? readFileSync(mdxPath, 'utf-8') : '';

  // Transform metadata to Payload format
  const payloadData: Record<string, unknown> = {
    slug,
    locale,
    status: metadata.status || 'published',
    title: metadata.title,
    description: metadata.description,
    bodyPublic: mdxContent,
    publicSummary: metadata.publicSummary,
    category: metadata.category,
    evidenceLevel: metadata.editorial?.evidenceLevel || 'D',
    lastReviewed: metadata.editorial?.lastReviewed,
    reviewCadenceMonths: metadata.reviewCadenceMonths || 12,
    reviewer: {
      name: metadata.editorial?.reviewer?.name || '',
      role: metadata.editorial?.reviewer?.role || '',
      credentials: metadata.editorial?.reviewer?.credentials || [],
      institution: metadata.editorial?.reviewer?.institution,
    },
    changelog: metadata.changelog || [],
    citations: metadata.citations || [],
    synonyms: (metadata.synonyms || []).map((s: string) => ({ synonym: s })),
    audienceLevel: {
      public: metadata.audienceLevel?.public ?? true,
      student: metadata.audienceLevel?.student ?? false,
      clinician: metadata.audienceLevel?.clinician ?? false,
    },
  };

  // Handle tags (create if they don't exist)
  if (metadata.tags && metadata.tags.length > 0) {
    const tagIds: string[] = [];
    for (const tagName of metadata.tags) {
      // Try to find or create tag
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tagCheckUrl = new URL(`${options.cmsUrl}/api/tags`);
      tagCheckUrl.searchParams.set('where[slug][equals]', tagSlug);

      const tagCheckResponse = await fetch(tagCheckUrl.toString());
      if (tagCheckResponse.ok) {
        const tagData: PayloadResponse<{ id: string }> = await tagCheckResponse.json();
        if (tagData.docs.length > 0) {
          tagIds.push(tagData.docs[0].id);
        } else if (!options.dryRun) {
          // Create tag
          const createTagResponse = await fetch(`${options.cmsUrl}/api/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tagName, slug: tagSlug }),
          });
          if (createTagResponse.ok) {
            const newTag = await createTagResponse.json();
            tagIds.push(newTag.id);
          }
        }
      }
    }
    payloadData.tags = tagIds;
  }

  return await createOrUpdateDocument('conditions', payloadData, options);
}

/**
 * Import a medication
 */
async function importMedication(
  slug: string,
  locale: 'en' | 'ar',
  contentDir: string,
  options: ImportOptions
): Promise<boolean> {
  const medicationDir = join(contentDir, 'medications', slug);
  const localeDir = join(medicationDir, locale);
  const metadataPath = existsSync(join(localeDir, 'metadata.json'))
    ? join(localeDir, 'metadata.json')
    : join(medicationDir, 'metadata.json');
  const mdxPath = existsSync(join(localeDir, 'index.mdx'))
    ? join(localeDir, 'index.mdx')
    : join(medicationDir, 'index.mdx');

  if (!existsSync(metadataPath)) {
    console.warn(`⚠ Skipping ${slug} (${locale}): metadata.json not found`);
    return false;
  }

  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const mdxContent = existsSync(mdxPath) ? readFileSync(mdxPath, 'utf-8') : '';

  const payloadData: Record<string, unknown> = {
    slug,
    locale,
    status: metadata.status || 'published',
    genericName: metadata.genericName || metadata.title,
    brandNames: (metadata.brandNames || []).map((b: string) => ({ brandName: b })),
    title: metadata.title,
    description: metadata.description,
    bodyPublic: mdxContent,
    publicSummary: metadata.publicSummary,
    evidenceLevel: metadata.editorial?.evidenceLevel || 'D',
    lastReviewed: metadata.editorial?.lastReviewed,
    reviewCadenceMonths: metadata.reviewCadenceMonths || 12,
    reviewer: {
      name: metadata.editorial?.reviewer?.name || '',
      role: metadata.editorial?.reviewer?.role || '',
      credentials: metadata.editorial?.reviewer?.credentials || [],
      institution: metadata.editorial?.reviewer?.institution,
    },
    changelog: metadata.changelog || [],
    citations: metadata.citations || [],
    synonyms: (metadata.synonyms || []).map((s: string) => ({ synonym: s })),
    audienceLevel: {
      public: metadata.audienceLevel?.public ?? true,
      student: metadata.audienceLevel?.student ?? false,
      clinician: metadata.audienceLevel?.clinician ?? false,
    },
  };

  // Handle drug class
  if (metadata.drugClass) {
    const drugClassSlug = metadata.drugClass.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const drugClassCheckUrl = new URL(`${options.cmsUrl}/api/drug-classes`);
    drugClassCheckUrl.searchParams.set('where[slug][equals]', drugClassSlug);

    const drugClassCheckResponse = await fetch(drugClassCheckUrl.toString());
    if (drugClassCheckResponse.ok) {
      const drugClassData: PayloadResponse<{ id: string }> = await drugClassCheckResponse.json();
      if (drugClassData.docs.length > 0) {
        payloadData.drugClass = drugClassData.docs[0].id;
      } else if (!options.dryRun) {
        const createDrugClassResponse = await fetch(`${options.cmsUrl}/api/drug-classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: metadata.drugClass, slug: drugClassSlug }),
        });
        if (createDrugClassResponse.ok) {
          const newDrugClass = await createDrugClassResponse.json();
          payloadData.drugClass = newDrugClass.id;
        }
      }
    }
  }

  return await createOrUpdateDocument('medications', payloadData, options);
}

/**
 * Import a governance page
 */
async function importGovernance(
  slug: string,
  locale: 'en' | 'ar',
  contentDir: string,
  options: ImportOptions
): Promise<boolean> {
  const governanceDir = join(contentDir, 'governance', slug);
  const localeDir = join(governanceDir, locale);
  const metadataPath = existsSync(join(localeDir, 'metadata.json'))
    ? join(localeDir, 'metadata.json')
    : join(governanceDir, 'metadata.json');
  const mdxPath = existsSync(join(localeDir, 'index.mdx'))
    ? join(localeDir, 'index.mdx')
    : join(governanceDir, 'index.mdx');

  if (!existsSync(metadataPath)) {
    console.warn(`⚠ Skipping ${slug} (${locale}): metadata.json not found`);
    return false;
  }

  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const mdxContent = existsSync(mdxPath) ? readFileSync(mdxPath, 'utf-8') : '';

  const payloadData: Record<string, unknown> = {
    slug,
    locale,
    status: 'published',
    title: metadata.title,
    description: metadata.description,
    body: mdxContent,
    lastUpdated: metadata.lastUpdated || new Date().toISOString().split('T')[0],
  };

  return await createOrUpdateDocument('governance-pages', payloadData, options);
}

/**
 * Main import function
 */
async function main() {
  const options = parseOptions();
  const contentDir = join(process.cwd(), 'content');

  console.log('🚀 Starting content migration to Payload CMS');
  console.log(`   CMS URL: ${options.cmsUrl}`);
  console.log(`   Dry run: ${options.dryRun ? 'YES' : 'NO'}`);
  if (options.type) console.log(`   Type filter: ${options.type}`);
  if (options.locale) console.log(`   Locale filter: ${options.locale}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // Import conditions
  if (!options.type || options.type === 'conditions') {
    console.log('📋 Importing conditions...');
    const conditionsDir = join(contentDir, 'conditions');
    if (existsSync(conditionsDir)) {
      const conditionSlugs = readdirSync(conditionsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name !== '_template.mdx');

      for (const slug of conditionSlugs) {
        const locales: ('en' | 'ar')[] = options.locale ? [options.locale] : ['en', 'ar'];
        for (const locale of locales) {
          const success = await importCondition(slug, locale, contentDir, options);
          if (success) successCount++;
          else errorCount++;
        }
      }
    }
    console.log('');
  }

  // Import medications
  if (!options.type || options.type === 'medications') {
    console.log('💊 Importing medications...');
    const medicationsDir = join(contentDir, 'medications');
    if (existsSync(medicationsDir)) {
      const medicationSlugs = readdirSync(medicationsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name !== '_template.mdx');

      for (const slug of medicationSlugs) {
        const locales: ('en' | 'ar')[] = options.locale ? [options.locale] : ['en', 'ar'];
        for (const locale of locales) {
          const success = await importMedication(slug, locale, contentDir, options);
          if (success) successCount++;
          else errorCount++;
        }
      }
    }
    console.log('');
  }

  // Import governance pages
  if (!options.type || options.type === 'governance') {
    console.log('📜 Importing governance pages...');
    const governanceDir = join(contentDir, 'governance');
    if (existsSync(governanceDir)) {
      const governanceSlugs = readdirSync(governanceDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const slug of governanceSlugs) {
        const locales: ('en' | 'ar')[] = options.locale ? [options.locale] : ['en', 'ar'];
        for (const locale of locales) {
          const success = await importGovernance(slug, locale, contentDir, options);
          if (success) successCount++;
          else errorCount++;
        }
      }
    }
    console.log('');
  }

  console.log('✅ Migration complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  if (options.dryRun) {
    console.log('\n⚠️  This was a dry run. No data was actually imported.');
    console.log('   Run without --dry-run to perform the actual import.');
  }
}

main().catch(console.error);

