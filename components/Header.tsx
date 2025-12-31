'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/lib/i18n/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to defensively strip locale prefix from pathname
  const stripLocale = (path: string): string => {
    return path.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
  };

  // Detect current locale from URL pathname (more reliable than useLocale hook)
  // Use useState + useEffect to avoid hydration mismatch
  const [currentLocale, setCurrentLocale] = useState<'en' | 'ar'>(() => {
    // Initialize with useLocale() for SSR
    return locale as 'en' | 'ar';
  });

  // Update locale from URL after hydration to ensure accuracy
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlPath = window.location.pathname;
      if (urlPath.startsWith('/ar')) {
        setCurrentLocale('ar');
      } else if (urlPath.startsWith('/en')) {
        setCurrentLocale('en');
      }
    }
  }, []);

  // Calculate target locale for toggle
  const nextLocale = currentLocale === 'en' ? 'ar' : 'en';

  const toggleLocale = () => {
    const currentPath = pathname || '/';
    const cleanPath = stripLocale(currentPath);
    
    // Construct the target URL with the new locale
    // Use direct navigation to ensure locale switch works reliably
    const targetPath = cleanPath === '/' ? '' : cleanPath;
    const targetUrl = `/${nextLocale}${targetPath}`;
    
    // Use window.location for reliable navigation when router.push fails
    // This ensures the locale switch works in both directions
    window.location.href = targetUrl;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Use explicit locale path to preserve current locale */}
          <a
            href={`/${currentLocale}`}
            className="text-3xl font-semibold text-text-primary hover:text-text-secondary transition-colors tracking-tight"
            aria-label={t('brand.name')}
          >
            {t('brand.name')}
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('about')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => scrollToSection('vision')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              {t('nav.vision')}
            </button>
            <button
              onClick={() => scrollToSection('ethics')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              {t('nav.ethics')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              {t('nav.contact')}
            </button>

            {/* Language Toggle - Segmented Control */}
            <div className="flex items-center gap-0 bg-background-off border border-border rounded-lg p-1" role="group" aria-label="Language selector">
              <button
                onClick={() => {
                  if (currentLocale !== 'en') {
                    toggleLocale();
                  }
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 ${
                  currentLocale === 'en'
                    ? 'bg-background-light text-text-primary shadow-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                aria-label="Switch to English"
                aria-pressed={currentLocale === 'en'}
              >
                EN
              </button>
              <div className="w-px h-4 bg-border rtl:hidden" aria-hidden="true" />
              <div className="hidden w-px h-4 bg-border rtl:block" aria-hidden="true" />
              <button
                onClick={() => {
                  if (currentLocale !== 'ar') {
                    toggleLocale();
                  }
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 ${
                  currentLocale === 'ar'
                    ? 'bg-background-light text-text-primary shadow-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                aria-label="Switch to Arabic"
                aria-pressed={currentLocale === 'ar'}
              >
                AR
              </button>
            </div>

            {/* Join Waitlist CTA */}
            <button
              onClick={scrollToWaitlist}
              className="px-4 py-2 bg-text-primary text-background-light font-medium rounded hover:bg-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 shadow-subtle"
            >
              {t('hero.cta')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('about')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-2"
              >
                {t('nav.about')}
              </button>
              <button
                onClick={() => scrollToSection('vision')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-2"
              >
                {t('nav.vision')}
              </button>
              <button
                onClick={() => scrollToSection('ethics')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-2"
              >
                {t('nav.ethics')}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded px-2 py-2"
              >
                {t('nav.contact')}
              </button>
              
              {/* Mobile Language Toggle - Segmented Control */}
              <div className="flex items-center gap-0 bg-background-off border border-border rounded-lg p-1 w-fit" role="group" aria-label="Language selector">
                <button
                  onClick={() => {
                    if (currentLocale !== 'en') {
                      toggleLocale();
                    }
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 ${
                    currentLocale === 'en'
                      ? 'bg-background-light text-text-primary shadow-subtle'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-label="Switch to English"
                  aria-pressed={currentLocale === 'en'}
                >
                  EN
                </button>
                <div className="w-px h-4 bg-border rtl:hidden" aria-hidden="true" />
                <div className="hidden w-px h-4 bg-border rtl:block" aria-hidden="true" />
                <button
                  onClick={() => {
                    if (currentLocale !== 'ar') {
                      toggleLocale();
                    }
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 ${
                    currentLocale === 'ar'
                      ? 'bg-background-light text-text-primary shadow-subtle'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-label="Switch to Arabic"
                  aria-pressed={currentLocale === 'ar'}
                >
                  AR
                </button>
              </div>

              {/* Mobile Join Waitlist CTA */}
              <button
                onClick={scrollToWaitlist}
                className="px-4 py-2.5 bg-text-primary text-background-light font-medium rounded hover:bg-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 shadow-subtle w-fit"
              >
                {t('hero.cta')}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

