import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  defaultLocale: 'en'
});

export const config = {
  // Match all pathnames except for API routes, static files, and onboarding
  matcher: ['/((?!api|_next|_vercel|onboarding|.*\\..*).*)', '/', '/(en|zh|ja|ko)/:path*']
};
