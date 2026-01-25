// Logto Sign-In Route
import { signIn, signOut, getLogtoContext } from '@logto/next/server-actions';
import { NextRequest } from 'next/server';
import { logtoConfig } from '@/lib/logto';
import { cookies } from 'next/headers';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postRedirectUri = searchParams.get('redirectTo') || '/onboarding';
  const userId = searchParams.get('state'); // Get userId from state parameter

  // Check if there's an existing session
  try {
    const { isAuthenticated } = await getLogtoContext(logtoConfig);

    // If already authenticated, sign out first to force a fresh login
    if (isAuthenticated) {
      console.log('[Sign-In] Existing session detected, clearing before fresh sign-in');

      // Clear all Logto cookies to force fresh authentication
      const cookieStore = cookies();
      const allCookies = cookieStore.getAll();
      allCookies.forEach(cookie => {
        if (cookie.name.startsWith('logto_')) {
          cookieStore.delete(cookie.name);
        }
      });
    }
  } catch (error) {
    console.log('[Sign-In] No existing session or error checking:', error);
  }

  // Store post-redirect URI and userId in cookies before signing in
  const cookieStore = cookies();
  cookieStore.set('logto_post_redirect_uri', postRedirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  // Store userId if provided (for linking existing user to Logto account)
  if (userId) {
    cookieStore.set('logto_link_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
  }

  console.log('[Sign-In] Initiating Logto sign-in flow');

  // signIn() will handle the redirect internally
  return await signIn(logtoConfig, `${logtoConfig.baseUrl}/api/logto/callback`);
}
