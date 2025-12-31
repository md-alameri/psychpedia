'use client';

import { useTranslations } from 'next-intl';

export default function Credibility() {
  const t = useTranslations();

  return (
    <section id="about" className="bg-background py-section-mobile md:py-section border-t border-border-light" aria-labelledby="credibility-title">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 id="credibility-title" className="text-2xl sm:text-3xl font-semibold text-text-primary mb-12 text-center">
            {t('credibility.title')}
          </h2>

          <div className="space-y-12">
            {/* Evidence-based */}
            <div className="border-b border-border-light pb-8 last:border-b-0 last:pb-0">
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('credibility.evidence.title')}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {t('credibility.evidence.description')}
              </p>
            </div>

            {/* Clinical relevance */}
            <div className="border-b border-border-light pb-8 last:border-b-0 last:pb-0">
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('credibility.clinical.title')}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {t('credibility.clinical.description')}
              </p>
            </div>

            {/* Patient safety */}
            <div className="border-b border-border-light pb-8 last:border-b-0 last:pb-0">
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('credibility.safety.title')}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {t('credibility.safety.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

