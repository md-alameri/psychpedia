import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { loadCondition, getAllConditionSlugs } from '@/lib/content/loader';
import { fetchAllConditionSlugs } from '@/lib/cms';
import EditorialMetadata from '@/components/content/EditorialMetadata';
import AudienceTabs from '@/components/content/AudienceTabs';
import ContentSection from '@/components/content/ContentSection';
import MDXContent from '@/components/content/MDXContent';
import RichTextRenderer from '@/components/content/RichTextRenderer';
import CitationsSection from '@/components/content/CitationsSection';
import MedicalDisclaimer from '@/components/content/MedicalDisclaimer';
import ReportIssue from '@/components/content/ReportIssue';
import LocaleUnavailableNotice from '@/components/content/LocaleUnavailableNotice';
import { generateConditionStructuredData, generateArticleStructuredData } from '@/lib/content/structured-data';
import { getCurrentUserRole } from '@/lib/content/gating';

interface ConditionPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateStaticParams() {
  // Try CMS first, fallback to local files
  let slugs: string[] = [];
  
  if (process.env.CMS_URL) {
    try {
      const enSlugs = await fetchAllConditionSlugs('en');
      const arSlugs = await fetchAllConditionSlugs('ar');
      slugs = [...new Set([...enSlugs, ...arSlugs])];
    } catch (error) {
      console.warn('[generateStaticParams] CMS fetch failed, using local files:', error);
      slugs = getAllConditionSlugs();
    }
  } else {
    slugs = getAllConditionSlugs();
  }
  
  const params: { locale: Locale; slug: string }[] = [];
  
  for (const slug of slugs) {
    params.push({ locale: 'en', slug });
    params.push({ locale: 'ar', slug });
  }
  
  return params;
}

export async function generateMetadata({
  params,
}: ConditionPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = await loadCondition(slug, locale);
  
  if (!content) {
    return {
      title: 'Condition Not Found',
    };
  }
  
  const { metadata } = content;
  
  return {
    title: `${metadata.title} | Psychpedia`,
    description: metadata.description,
    alternates: {
      languages: {
        en: `/en/conditions/${slug}`,
        ar: `/ar/conditions/${slug}`,
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
    },
  };
}

export default async function ConditionPage({ params }: ConditionPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  
  const content = await loadCondition(slug, locale);
  
  if (!content) {
    notFound();
  }
  
  // Production draft check: drafts are only accessible with preview mode enabled
  const draft = await draftMode();
  if (content.metadata.status === 'draft' && 
      !draft.isEnabled && 
      process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  const { metadata, sections, rawContent, isLocaleSpecific } = content;
  
  // Generate structured data
  const structuredData = generateConditionStructuredData(content, locale);
  const articleData = generateArticleStructuredData(
    metadata.title,
    metadata.description,
    `https://psychpedia.com/${locale}/conditions/${metadata.slug}`,
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
                contentType="condition"
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
          
          {(() => {
            // Check if content is richText JSON (object) or markdown string
            const rawContentTyped = rawContent as any;
            const isRichText = rawContentTyped && typeof rawContentTyped === 'object' && 'root' in rawContentTyped;
            const bodyContent = (content as any).bodyPublic || rawContent;
            // Always hide dosing for public audience (server-side, no hydration issues)
            const hideDosing = true; // Public pages always hide dosing
            
            if (isRichText || (bodyContent && typeof bodyContent === 'object' && 'root' in bodyContent)) {
              return (
                <RichTextRenderer
                  content={bodyContent || rawContent}
                  locale={locale}
                  audience="public"
                  hideDosing={hideDosing}
                />
              );
            }
            
            if (rawContent) {
              return <MDXContent source={rawContent} />;
            }
            
            return (
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
            );
          })()}
          
          {/* Citations section - authoritative list from citations[] array */}
          {metadata.citations && metadata.citations.length > 0 && (
            <CitationsSection citations={metadata.citations} locale={locale} />
          )}
          
          <ReportIssue contentType="condition" contentSlug={slug} locale={locale} />
        </article>
      </main>
    </div>
  );
}

