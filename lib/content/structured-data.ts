import type { ConditionContent } from './schemas/condition';
import type { MedicationContent } from './schemas/medication';

/**
 * Generate JSON-LD structured data for condition pages
 */
export function generateConditionStructuredData(
  content: ConditionContent,
  locale: string,
  baseUrl: string = 'https://psychpedia.com'
) {
  const { metadata } = content;
  const url = `${baseUrl}/${locale}/conditions/${metadata.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: metadata.title,
    description: metadata.description,
    url,
    inLanguage: locale,
    dateModified: metadata.editorial.lastReviewed,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: metadata.editorial.reviewer.name,
      jobTitle: metadata.editorial.reviewer.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Psychpedia',
      url: baseUrl,
    },
  };
}

/**
 * Generate JSON-LD structured data for medication pages
 */
export function generateMedicationStructuredData(
  content: MedicationContent,
  locale: string,
  baseUrl: string = 'https://psychpedia.com'
) {
  const { metadata } = content;
  const url = `${baseUrl}/${locale}/medications/${metadata.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: metadata.title,
    description: metadata.description,
    url,
    inLanguage: locale,
    dateModified: metadata.editorial.lastReviewed,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: metadata.editorial.reviewer.name,
      jobTitle: metadata.editorial.reviewer.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Psychpedia',
      url: baseUrl,
    },
    ...(metadata.genericName && {
      genericName: metadata.genericName,
    }),
    ...(metadata.brandNames && metadata.brandNames.length > 0 && {
      brand: metadata.brandNames.map((name) => ({
        '@type': 'Brand',
        name,
      })),
    }),
  };
}

/**
 * Generate Article structured data for content pages
 */
export function generateArticleStructuredData(
  title: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified: string,
  author: { name: string; role: string },
  locale: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    inLanguage: locale,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Psychpedia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://psychpedia.com/logo.png',
      },
    },
  };
}

