// Logto Sign-In Route
import { signIn } from '@logto/next/server-actions';
import { NextRequest } from 'next/server';
import { logtoConfig } from '@/lib/logto';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postRedirectUri = searchParams.get('redirectTo') || '/onboarding';

  // Store post-redirect URI in session storage via cookie before signing in
  const cookieStore = cookies();
  cookieStore.set('logto_post_redirect_uri', postRedirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  // signIn() will handle the redirect internally
  await signIn(logtoConfig, `${logtoConfig.baseUrl}/api/logto/callback`);
}
