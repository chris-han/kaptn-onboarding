import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Redirect locale root to landing page
  if (locale === 'en') {
    redirect('/landing');
  } else {
    redirect(`/${locale}/landing`);
  }
}
