'use client';

import { useTranslations } from 'next-intl';

export default function Credibility() {
  const t = useTranslations();

  return (
    <section id="about" className="bg-background py-section-mobile md:py-section border-t border-border-light" aria-labelledby="credibility-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 id="credibility-title" className="text-3xl sm:text-4xl font-semibold text-text-primary mb-4 text-center">
            {t('credibility.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Evidence-based */}
          <div className="bg-background-light border border-border rounded-lg p-6 md:p-8 hover:shadow-soft transition-shadow group">
            <div className="mb-4">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              {t('credibility.evidence.title')}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              {t('credibility.evidence.description')}
            </p>
          </div>

          {/* Clinical relevance */}
          <div className="bg-background-light border border-border rounded-lg p-6 md:p-8 hover:shadow-soft transition-shadow group">
            <div className="mb-4">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              {t('credibility.clinical.title')}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              {t('credibility.clinical.description')}
            </p>
          </div>

          {/* Patient safety */}
          <div className="bg-background-light border border-border rounded-lg p-6 md:p-8 hover:shadow-soft transition-shadow group">
            <div className="mb-4">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              {t('credibility.safety.title')}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              {t('credibility.safety.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

