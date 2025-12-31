import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getAllConditionSlugs } from '@/lib/content/loader';
import { loadCondition } from '@/lib/content/loader';
import ConditionsIndex from '@/components/content/ConditionsIndex';

interface ConditionsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

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
  
  // Load all conditions (only published)
  const slugs = getAllConditionSlugs();
  const conditions = await Promise.all(
    slugs.map(async (slug) => {
      const content = await loadCondition(slug, locale);
      // Only include published content
      if (content && content.metadata.status === 'published') {
        return { ...content.metadata, slug };
      }
      return null;
    })
  );
  
  const validConditions = conditions.filter((c): c is NonNullable<typeof c> => c !== null);
  
  return <ConditionsIndex conditions={validConditions} locale={locale} />;
}

