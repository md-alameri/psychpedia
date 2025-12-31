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
    
    // Debug logs (remove after confirming fix)
    console.log({ 
      locale, 
      currentLocale, 
      pathname, 
      cleanPath, 
      nextLocale,
      windowPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A'
    });
    
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

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-sm border-b border-border-light">
      <nav className="max-w-container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-semibold text-text-primary hover:text-text-secondary transition-colors"
            aria-label={t('brand.name')}
          >
            {t('brand.name')}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => scrollToSection('vision')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
            >
              {t('nav.vision')}
            </button>
            <button
              onClick={() => scrollToSection('ethics')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
            >
              {t('nav.ethics')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
            >
              {t('nav.contact')}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
              aria-label={`Switch to ${nextLocale === 'ar' ? 'Arabic' : 'English'}`}
            >
              {nextLocale.toUpperCase()}
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
          <div className="md:hidden py-4 border-t border-border-light">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('about')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
              >
                {t('nav.about')}
              </button>
              <button
                onClick={() => scrollToSection('vision')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
              >
                {t('nav.vision')}
              </button>
              <button
                onClick={() => scrollToSection('ethics')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
              >
                {t('nav.ethics')}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors text-left rtl:text-right focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 rounded"
              >
                {t('nav.contact')}
              </button>
              <button
                onClick={toggleLocale}
                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 border border-border rounded w-fit focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2"
                aria-label={`Switch to ${nextLocale === 'ar' ? 'Arabic' : 'English'}`}
              >
                {nextLocale.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

