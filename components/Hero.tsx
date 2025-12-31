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

  const scrollToEthics = () => {
    const element = document.getElementById('ethics');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-background-light py-section-mobile md:py-section overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-pattern-grid opacity-30 pointer-events-none" aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge/Kicker */}
          <div className="inline-flex items-center px-4 py-1.5 bg-background-off border border-border rounded-full mb-6">
            <span className="text-sm font-medium text-text-secondary">
              {t('hero.badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-text-primary mb-6 leading-tight tracking-tight max-w-3xl mx-auto">
            {t('hero.headline')}
          </h1>

          {/* Supporting paragraph */}
          <p className="text-lg sm:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Value proposition paragraph */}
          <p className="text-base text-text-secondary mb-10 leading-relaxed max-w-xl mx-auto">
            {t('hero.value')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToWaitlist}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-text-primary text-background-light font-medium rounded-lg hover:bg-text-secondary transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 shadow-soft hover:shadow-subtle"
            aria-label={t('hero.cta')}
          >
            {t('hero.cta')}
          </button>
            <button
              onClick={scrollToEthics}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-text-primary font-medium rounded-lg border border-border hover:bg-background-off hover:border-text-secondary transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
              aria-label={t('hero.ctaSecondary')}
            >
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

