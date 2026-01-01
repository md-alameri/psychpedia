import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { loadGovernance } from '@/lib/content/loader';
import MDXContent from '@/components/content/MDXContent';
import RichTextRenderer from '@/components/content/RichTextRenderer';
import GovernanceLocaleNotice from '@/components/content/GovernanceLocaleNotice';

interface CorrectionsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: CorrectionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = await loadGovernance('corrections', locale);
  
  if (!content) {
    return {
      title: 'Corrections Policy | Psychpedia',
    };
  }
  
  return {
    title: `${content.metadata.title} | Psychpedia`,
    description: content.metadata.description,
  };
}

export default async function CorrectionsPage({ params }: CorrectionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const content = await loadGovernance('corrections', locale);
  
  if (!content) {
    notFound();
  }
  
  // Production draft check: drafts are only accessible with preview mode enabled
  // Governance pages are always published, no draft check needed
  
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
                pageSlug="corrections"
              />
            )}
          </header>
          
          {(() => {
            // Check if content is richText JSON (object) or markdown string
            const rawContentTyped = content.rawContent as any;
            const isRichText = rawContentTyped && typeof rawContentTyped === 'object' && 'root' in rawContentTyped;
            const bodyContent = (content as any).body || content.rawContent;
            
            if (isRichText || (bodyContent && typeof bodyContent === 'object' && 'root' in bodyContent)) {
              return (
                <RichTextRenderer
                  content={bodyContent || content.rawContent}
                  locale={locale}
                  audience="public"
                />
              );
            }
            
            return <MDXContent source={content.rawContent || ''} />;
          })()}
        </article>
      </main>
    </div>
  );
}

