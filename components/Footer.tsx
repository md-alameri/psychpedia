'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer id="contact" className="bg-background py-12 border-t border-border-light">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-sm text-text-muted">
            {t('footer.copyright')}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="mr-2 rtl:ml-2 rtl:mr-0">{t('footer.contact')}:</span>
            <a
              href={`mailto:${t('footer.email')}`}
              className="text-text-primary hover:text-text-secondary transition-colors underline"
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

