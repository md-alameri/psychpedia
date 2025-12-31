'use client';

import { useTranslations } from 'next-intl';

export default function Vision() {
  const t = useTranslations();
  const content = t('vision.content');

  // Split content by double newlines to create paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <section id="vision" className="bg-background-light py-section-mobile md:py-section border-t border-border-light" aria-labelledby="vision-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Heading + Content */}
          <div className="lg:order-1 rtl:lg:order-2">
            <h2 id="vision-title" className="text-3xl sm:text-4xl font-semibold text-text-primary mb-8">
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

          {/* Right Column: Principles Card */}
          <div className="lg:sticky lg:top-24 lg:order-2 rtl:lg:order-1">
            <div className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-subtle">
              <h3 className="text-xl font-semibold text-text-primary mb-6">
                {t('vision.principles.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 rtl:flex-row-reverse">
                  <svg className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base text-text-secondary leading-relaxed">
                    {t('vision.principles.evidence')}
                  </span>
                </li>
                <li className="flex items-start gap-3 rtl:flex-row-reverse">
                  <svg className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base text-text-secondary leading-relaxed">
                    {t('vision.principles.clinical')}
                  </span>
                </li>
                <li className="flex items-start gap-3 rtl:flex-row-reverse">
                  <svg className="w-5 h-5 text-text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base text-text-secondary leading-relaxed">
                    {t('vision.principles.safety')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

