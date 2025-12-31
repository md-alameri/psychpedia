import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { loadGovernance } from '@/lib/content/loader';
import MDXContent from '@/components/content/MDXContent';
import GovernanceLocaleNotice from '@/components/content/GovernanceLocaleNotice';

interface SourcesPolicyPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: SourcesPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = await loadGovernance('sources-policy', locale);
  
  if (!content) {
    return {
      title: 'Sources Policy | Psychpedia',
    };
  }
  
  return {
    title: `${content.metadata.title} | Psychpedia`,
    description: content.metadata.description,
  };
}

export default async function SourcesPolicyPage({ params }: SourcesPolicyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const content = await loadGovernance('sources-policy', locale);
  
  if (!content) {
    notFound();
  }
  
  // Production draft check: drafts are only accessible with preview mode enabled
  // Note: Governance pages are always published, but check for consistency
  if (content.metadata.status === 'draft' && 
      !draftMode().isEnabled && 
      process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
              {content.metadata.title}
            </h1>
            <p className="text-lg text-text-secondary mb-6">
              {content.metadata.description}
            </p>
            
            {/* Show notice if content is not available in requested locale */}
            {!content.isLocaleSpecific && (
              <GovernanceLocaleNotice
                requestedLocale={locale}
                pageSlug="sources-policy"
              />
            )}
          </header>
          
          <MDXContent source={content.rawContent} />
        </article>
      </main>
    </div>
  );
}

