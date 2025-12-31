'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer id="contact" className="bg-background py-section-mobile md:py-section border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm text-text-muted">
            {t('footer.copyright')}
          </p>
          <p className="text-base text-text-secondary">
            <span className="mr-2 rtl:ml-2 rtl:mr-0">{t('footer.contact')}:</span>
            <a
              href={`mailto:${t('footer.email')}`}
              className="text-text-primary hover:text-text-secondary transition-colors underline focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
              aria-label={`${t('footer.contact')} ${t('footer.email')}`}
            >
              {t('footer.email')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

