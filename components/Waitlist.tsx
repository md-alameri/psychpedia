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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="waitlist-title" className="text-3xl sm:text-4xl font-semibold text-text-primary mb-4">
            {t('waitlist.title')}
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            {t('waitlist.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                className="flex-1 px-5 py-3.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-text-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background-light text-text-primary text-base transition-all"
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'email-error' : undefined}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-8 py-3.5 bg-text-primary text-background-light font-medium rounded-lg hover:bg-text-secondary transition-all focus:outline-none focus:ring-2 focus:ring-text-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-subtle hover:shadow-soft"
              >
                {status === 'submitting' ? t('waitlist.submitting') : t('waitlist.submit')}
              </button>
            </div>

            {errorMessage && (
              <div id="email-error" className="p-4 bg-red-50 border border-red-200 rounded-lg text-left rtl:text-right" role="alert" aria-live="polite">
                <p className="text-sm text-red-700 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg" role="alert" aria-live="polite">
                <p className="text-sm text-green-700 font-medium">
                  {t('waitlist.success')}
                </p>
              </div>
            )}

            {/* Trust line */}
            <p className="text-xs text-text-muted pt-2">
              {t('waitlist.trust')}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

