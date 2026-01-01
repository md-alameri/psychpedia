import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getAllMedicationSlugs } from '@/lib/content/loader';
import { fetchMedicationsIndex } from '@/lib/cms';
import MedicationsIndex from '@/components/content/MedicationsIndex';

interface MedicationsPageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export async function generateMetadata({
  params,
}: MedicationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'الأدوية النفسية | Psychpedia' : 'Medications | Psychpedia',
    description: locale === 'ar'
      ? 'استكشف قاعدة معرفية شاملة للأدوية النفسية'
      : 'Explore our comprehensive knowledge base of psychiatric medications',
  };
}

export default async function MedicationsPage({ params }: MedicationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  // Try CMS first, fallback to local files
  let medications: Array<{ slug: string; title: string; description: string; genericName?: string }> = [];
  
  if (process.env.CMS_URL) {
    try {
      medications = await fetchMedicationsIndex(locale);
    } catch (error) {
      console.warn('[MedicationsPage] CMS fetch failed, falling back to local files:', error);
      // Fallback to local files
      const slugs = getAllMedicationSlugs();
      const { loadMedication } = await import('@/lib/content/loader');
      const localMedications = await Promise.all(
        slugs.map(async (slug) => {
          const content = await loadMedication(slug, locale);
          if (content && content.metadata.status === 'published') {
            return { ...content.metadata, slug };
          }
          return null;
        })
      );
      medications = localMedications.filter((m): m is NonNullable<typeof m> => m !== null);
    }
  } else {
    // No CMS configured, use local files
    const slugs = getAllMedicationSlugs();
    const { loadMedication } = await import('@/lib/content/loader');
    const localMedications = await Promise.all(
      slugs.map(async (slug) => {
        const content = await loadMedication(slug, locale);
        if (content && content.metadata.status === 'published') {
          return { ...content.metadata, slug };
        }
        return null;
      })
    );
    medications = localMedications.filter((m): m is NonNullable<typeof m> => m !== null);
  }
  
  return <MedicationsIndex medications={medications as any} locale={locale} />;
}

