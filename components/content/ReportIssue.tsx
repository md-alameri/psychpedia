'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ReportIssueProps {
  contentType: 'condition' | 'medication';
  contentSlug: string;
  locale: string;
}

/**
 * Report an issue CTA component
 * Allows users to report content issues, errors, or concerns via API
 */
export default function ReportIssue({ contentType, contentSlug, locale }: ReportIssueProps) {
  const t = useTranslations('content.reportIssue');
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: contentSlug,
          type: contentType,
          locale,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit report');
      }
      
      setSuccess(true);
      setMessage('');
      setEmail('');
      
      // Close form after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <div className="border-t border-border pt-6 mt-8">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              {t('title')}
            </h4>
            <p className="text-xs text-text-secondary">
              {t('description')}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 text-sm font-medium text-accent border border-border rounded-lg hover:bg-background-off transition-colors whitespace-nowrap"
          >
            {t('button')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-t border-border pt-6 mt-8">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            {t('title')}
          </h4>
          <p className="text-xs text-text-secondary mb-4">
            {t('description')}
          </p>
          
          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('success')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-text-primary mb-1">
                  {t('emailLabel')} <span className="text-text-muted">({t('emailOptional')})</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-xs font-medium text-text-primary mb-1">
                  {t('messageLabel')} *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder={t('messagePlaceholder')}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || message.trim().length < 10}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('submitting') : t('submit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setMessage('');
                    setEmail('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-background-off transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

