import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getAllMedicationSlugs } from '@/lib/content/loader';
import { loadMedication } from '@/lib/content/loader';
import MedicationsIndex from '@/components/content/MedicationsIndex';

interface MedicationsPageProps {
  params: Promise<{ locale: Locale }>;
}

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
  
  // Load all medications
  const slugs = getAllMedicationSlugs();
  const medications = await Promise.all(
    slugs.map(async (slug) => {
      const content = await loadMedication(slug, locale);
      return content ? { ...content.metadata, slug } : null;
    })
  );
  
  const validMedications = medications.filter((m): m is NonNullable<typeof m> => m !== null);
  
  return <MedicationsIndex medications={validMedications} locale={locale} />;
}

