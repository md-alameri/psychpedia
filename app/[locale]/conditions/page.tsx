import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getAllConditionSlugs } from '@/lib/content/loader';
import { fetchConditionsIndex } from '@/lib/cms';
import ConditionsIndex from '@/components/content/ConditionsIndex';

interface ConditionsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Removed generateStaticParams to prevent build-time pre-rendering

export async function generateMetadata({
  params,
}: ConditionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'الحالات النفسية | Psychpedia' : 'Conditions | Psychpedia',
    description: locale === 'ar' 
      ? 'استكشف قاعدة معرفية شاملة للحالات النفسية'
      : 'Explore our comprehensive knowledge base of psychiatric conditions',
  };
}

export default async function ConditionsPage({ params }: ConditionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  // Try CMS first, fallback to local files
  let conditions: Array<{ slug: string; title: string; description: string }> = [];
  
  if (process.env.NEXT_PUBLIC_CMS_URL || process.env.CMS_API_BASE) {
    try {
      conditions = await fetchConditionsIndex(locale);
    } catch (error) {
      console.warn('[ConditionsPage] CMS fetch failed, falling back to local files:', error);
      // Fallback to local files
      const slugs = getAllConditionSlugs();
      const { loadCondition } = await import('@/lib/content/loader');
      const localConditions = await Promise.all(
        slugs.map(async (slug) => {
          const content = await loadCondition(slug, locale);
          if (content && content.metadata.status === 'published') {
            return { slug, title: content.metadata.title, description: content.metadata.description };
          }
          return null;
        })
      );
      conditions = localConditions.filter((c): c is NonNullable<typeof c> => c !== null);
    }
  } else {
    // No CMS configured, use local files
    const slugs = getAllConditionSlugs();
    const { loadCondition } = await import('@/lib/content/loader');
    const localConditions = await Promise.all(
      slugs.map(async (slug) => {
        const content = await loadCondition(slug, locale);
        if (content && content.metadata.status === 'published') {
          return { slug, title: content.metadata.title, description: content.metadata.description };
        }
        return null;
      })
    );
    conditions = localConditions.filter((c): c is NonNullable<typeof c> => c !== null);
  }
  
  return <ConditionsIndex conditions={conditions as any} locale={locale} />;
}

