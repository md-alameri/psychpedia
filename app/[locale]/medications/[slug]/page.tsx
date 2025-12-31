import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { loadMedication, getAllMedicationSlugs } from '@/lib/content/loader';
import EditorialMetadata from '@/components/content/EditorialMetadata';
import AudienceTabs from '@/components/content/AudienceTabs';
import ContentSection from '@/components/content/ContentSection';
import MDXContentWithDosingFilter from '@/components/content/MDXContentWithDosingFilter';
import MedicalDisclaimer from '@/components/content/MedicalDisclaimer';
import ReportIssue from '@/components/content/ReportIssue';
import LocaleUnavailableNotice from '@/components/content/LocaleUnavailableNotice';
import { generateMedicationStructuredData, generateArticleStructuredData } from '@/lib/content/structured-data';
import { getCurrentUserRole } from '@/lib/content/gating';

interface MedicationPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllMedicationSlugs();
  const params: { locale: Locale; slug: string }[] = [];
  
  for (const slug of slugs) {
    params.push({ locale: 'en', slug });
    params.push({ locale: 'ar', slug });
  }
  
  return params;
}

export async function generateMetadata({
  params,
}: MedicationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await loadMedication(slug, locale);
  
  if (!content) {
    return {
      title: 'Medication Not Found',
    };
  }
  
  const { metadata } = content;
  
  return {
    title: `${metadata.title} | Psychpedia`,
    description: metadata.description,
    alternates: {
      languages: {
        en: `/en/medications/${slug}`,
        ar: `/ar/medications/${slug}`,
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
    },
  };
}

export default async function MedicationPage({ params }: MedicationPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  
  const content = await loadMedication(slug, locale);
  
  if (!content) {
    notFound();
  }
  
  const { metadata, sections, rawContent, isLocaleSpecific } = content;
  
  // Generate structured data
  const structuredData = generateMedicationStructuredData(content, locale);
  const articleData = generateArticleStructuredData(
    metadata.title,
    metadata.description,
    `https://psychpedia.com/${locale}/medications/${metadata.slug}`,
    metadata.editorial.lastReviewed,
    metadata.editorial.lastReviewed,
    metadata.editorial.reviewer,
    locale
  );
  
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
              {metadata.title}
            </h1>
            <p className="text-lg text-text-secondary mb-6">
              {metadata.description}
            </p>
            
            {/* Show notice if content is not available in requested locale */}
            {!isLocaleSpecific && (
              <LocaleUnavailableNotice
                requestedLocale={locale}
                contentType="medication"
                slug={slug}
              />
            )}
            
            {metadata.publicSummary && (
              <div className="bg-background-off border border-border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-text-primary mb-3">Public Summary</h2>
                <p className="text-text-secondary leading-relaxed">{metadata.publicSummary}</p>
              </div>
            )}
            
            <EditorialMetadata metadata={metadata.editorial} />
            <MedicalDisclaimer />
          </header>
          
          <AudienceTabs defaultDepth="basic" />
          
          {rawContent ? (
            <MDXContentWithDosingFilter 
              source={rawContent} 
              hideDosing={getCurrentUserRole() === 'public' && !metadata.audienceLevel.public}
            />
          ) : (
            <div>
              {Object.values(sections).map((section) => (
                <ContentSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  depth={section.depth}
                  gated={section.gated}
                >
                  <p className="text-text-muted">
                    Content for this section is coming soon.
                  </p>
                </ContentSection>
              ))}
            </div>
          )}
          
          <ReportIssue contentType="medication" contentSlug={slug} locale={locale} />
        </article>
      </main>
    </div>
  );
}

