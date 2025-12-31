'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Ethics() {
  const t = useTranslations();
  const disclaimer = t('ethics.disclaimer');
  const [isExpanded, setIsExpanded] = useState(false);

  // Split content by double newlines to create paragraphs
  const paragraphs = disclaimer.split('\n\n').filter(p => p.trim());

  return (
    <section id="ethics" className="bg-background-light py-section-mobile md:py-section border-t border-border-light" aria-labelledby="ethics-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 id="ethics-title" className="text-3xl sm:text-4xl font-semibold text-text-primary mb-8">
            {t('ethics.title')}
          </h2>

          {/* Not medical advice callout */}
          <div className="bg-background-off border-l-4 rtl:border-l-0 rtl:border-r-4 border-text-primary pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 mb-8 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none">
            <p className="text-base font-semibold text-text-primary">
              {t('ethics.notMedicalAdvice')}
            </p>
          </div>

          {/* Collapsible on mobile, always visible on desktop */}
          <div className="md:block">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden w-full flex items-center justify-between p-4 bg-background-off border border-border rounded-lg mb-4 hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
              aria-expanded={isExpanded}
              aria-controls="ethics-content"
            >
              <span className="text-base font-medium text-text-primary">
                {t('ethics.readMore')}
              </span>
              <svg
                className={`w-5 h-5 text-text-secondary transition-transform rtl:rotate-180 ${isExpanded ? 'rotate-180 rtl:rotate-0' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              id="ethics-content"
              className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-6`}
            >
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

