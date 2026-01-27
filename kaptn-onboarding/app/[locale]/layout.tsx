import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { IBM_Plex_Mono, Rajdhani } from 'next/font/google';
import '../globals.css';
import type { Metadata } from 'next';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'KAPTN - Bridge Command System',
  description: 'Calibrate your command style and assume your position on the bridge.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  // Apply locale-specific font class
  const getFontClass = () => {
    switch (locale) {
      case 'zh':
        return 'font-zh-cn';
      case 'ja':
        return 'font-ja';
      case 'ko':
        return 'font-ko';
      default:
        return '';
    }
  };

  return (
    <html lang={locale} className={`${ibmPlexMono.variable} ${rajdhani.variable} ${getFontClass()}`}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
