'use client';

import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';

export default function Waitlist() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(t('waitlist.email.required'));
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage(t('waitlist.email.invalid'));
      return;
    }

    setStatus('submitting');

    try {
      const formData = new FormData();
      formData.append('email', email.trim().toLowerCase());

      // Use Next.js API route (works with all deployment platforms)
      // To use existing CGI backend, change to: '/cgi-bin/waitlist.py'
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || t('waitlist.error'));
      }
    } catch {
      setStatus('error');
      setErrorMessage(t('waitlist.error'));
    }
  };

  return (
    <section id="waitlist" className="bg-background py-section-mobile md:py-section border-t border-border-light" aria-labelledby="waitlist-title">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h2 id="waitlist-title" className="text-2xl sm:text-3xl font-semibold text-text-primary mb-4">
            {t('waitlist.title')}
          </h2>
          <p className="text-base text-text-secondary mb-8">
            {t('waitlist.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="email" className="sr-only">
                {t('waitlist.email.label')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('waitlist.email.placeholder')}
                disabled={status === 'submitting'}
                className="flex-1 px-4 py-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-text-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background-light text-text-primary"
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'email-error' : undefined}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-6 py-3 bg-text-primary text-background-light font-medium rounded hover:bg-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'submitting' ? t('waitlist.submitting') : t('waitlist.submit')}
              </button>
            </div>

            {errorMessage && (
              <p id="email-error" className="text-sm text-red-600 text-left rtl:text-right" role="alert" aria-live="polite">
                {errorMessage}
              </p>
            )}

            {status === 'success' && (
              <p className="text-sm text-green-600" role="alert" aria-live="polite">
                {t('waitlist.success')}
              </p>
            )}

            <p className="text-sm text-text-muted mt-4">
              {t('waitlist.privacy')}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

