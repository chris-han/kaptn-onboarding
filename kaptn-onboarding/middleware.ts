import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true // Enable automatic locale detection from cookies and headers
});

export const config = {
  // Match all pathnames except for API routes and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/', '/(en|zh|ja|ko)/:path*']
};
