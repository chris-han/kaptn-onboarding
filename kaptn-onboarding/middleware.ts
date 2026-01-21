import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const config = {
  // Exclude /onboarding from i18n routing
  matcher: ['/((?!api|_next|_vercel|onboarding|.*\\..*).*)']
};
