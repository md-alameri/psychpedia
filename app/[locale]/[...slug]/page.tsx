import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getPageByPath, getPageBySlug } from '@/lib/cms/api';
import type { WagtailPageItem } from '@/lib/cms/types';

interface GenericPageProps {
  params: Promise<{ locale: Locale; slug: string[] }>;
}

/**
 * ISR: Revalidate every 60 seconds
 */
export const revalidate = 60;

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: GenericPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;
  
  // Build full pathname for path-based resolution
  const fullPath = `/${locale}/${slugPath}`;

  // Try path-based resolution first (more reliable for nested paths)
  let page = await getPageByPath(fullPath, locale);
  
  // Fallback to slug-based resolution
  if (!page) {
    page = await getPageBySlug(slugPath);
  }

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const title = page.seo_title || page.title;
  const description = page.search_description || '';
  const baseUrl = 'https://www.psychpedia.com';
  const pageUrl = `${baseUrl}/${locale}/${slugPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Psychpedia',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generic catch-all route for Wagtail CMS pages
 * 
 * This route handles any page that doesn't match more specific routes
 * (e.g., /conditions/[slug], /medications/[slug], etc.)
 * 
 * It fetches the page from Wagtail CMS by slug and renders it.
 */
export default async function GenericPage({ params }: GenericPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Convert slug array to path string
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;
  
  // Build full pathname for path-based resolution
  // Handle homepage (empty slug array)
  const fullPath = slugPath ? `/${locale}/${slugPath}` : `/${locale}`;

  // Try path-based resolution first (more reliable for nested paths and homepage)
  let page = await getPageByPath(fullPath, locale);
  
  // Fallback to slug-based resolution if path-based fails
  if (!page && slugPath) {
    page = await getPageBySlug(slugPath);
  }

  if (!page) {
    notFound();
  }

  // Check draft mode
  const draft = await draftMode();
  
  // In production, drafts are only accessible with preview mode enabled
  // Note: Wagtail doesn't expose a draft status in the API by default,
  // so we rely on the page not being published if it's a draft
  // This is a basic check - you may need to enhance based on your Wagtail setup

  const title = page.title;
  const description = page.search_description || '';
  
  // For now, render a basic page structure
  // StreamField blocks would be rendered here in a full implementation
  const bodyContent = page.body || page.body_public || '';

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {description && (
            <p className="text-xl text-muted-foreground">{description}</p>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          {bodyContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: bodyContent }}
              className="cms-content"
            />
          ) : (
            <div className="text-muted-foreground">
              <p>Content is being prepared.</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm">
                    Debug Info (dev only)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(page, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {draft.isEnabled && (
          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Preview Mode: You are viewing draft content
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

