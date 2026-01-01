import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from '../lib/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, default to 'en' if not
  const validLocale: Locale = (locale && locales.includes(locale as Locale))
    ? (locale as Locale)
    : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../lib/i18n/messages/${validLocale}.json`)).default
  };
});

