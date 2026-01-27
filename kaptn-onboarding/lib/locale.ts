/**
 * Utility functions for locale management
 */

/**
 * Gets the current locale from the NEXT_LOCALE cookie
 * This is the cookie set by next-intl middleware and our LanguageSwitcher
 */
export function getLocaleFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));

  if (localeCookie) {
    return localeCookie.split('=')[1].trim();
  }

  return null;
}

/**
 * Sets the locale cookie
 * @param locale - The locale code (en, zh, ja, ko)
 */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Gets a locale-aware path
 * If user has a locale preference, prepends it to the path
 * @param path - The path to make locale-aware (e.g., '/onboarding')
 * @returns The locale-aware path (e.g., '/zh/onboarding' if locale is 'zh')
 */
export function getLocaleAwarePath(path: string): string {
  const locale = getLocaleFromCookie();

  // If no locale or locale is default (en), return path as-is
  if (!locale || locale === 'en') {
    return path;
  }

  // Prepend locale to path
  return `/${locale}${path}`;
}
