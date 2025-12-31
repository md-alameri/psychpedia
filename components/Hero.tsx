'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations();

  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-background-light py-section-mobile md:py-section">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-text-primary mb-6 leading-tight">
            {t('hero.headline')}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <button
            onClick={scrollToWaitlist}
            className="inline-block px-8 py-3 bg-text-primary text-background-light font-medium rounded hover:bg-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
            aria-label={t('hero.cta')}
          >
            {t('hero.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}

