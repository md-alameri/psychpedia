'use client';

import { useTranslations } from 'next-intl';

export default function Vision() {
  const t = useTranslations();
  const content = t('vision.content');

  // Split content by double newlines to create paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <section id="vision" className="bg-background-light py-section-mobile md:py-section border-t border-border-light" aria-labelledby="vision-title">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 id="vision-title" className="text-2xl sm:text-3xl font-semibold text-text-primary mb-8">
            {t('vision.title')}
          </h2>
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base text-text-secondary leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

