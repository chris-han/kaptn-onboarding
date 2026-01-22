// Logto Callback Route
import { getLogtoContext } from '@logto/next/server-actions';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get user info from Logto
    const { claims } = await getLogtoContext(logtoConfig);

    if (claims?.sub && isDatabaseConfigured && prisma) {
      try {
        // Find or create user in database
        let user = await prisma.user.findUnique({
          where: { logtoId: claims.sub },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              logtoId: claims.sub,
              email: claims.email || null,
              emailVerified: claims.email_verified || false,
              name: claims.name || claims.username || null,
            },
          });
        } else {
          // Update existing user info
          user = await prisma.user.update({
            where: { logtoId: claims.sub },
            data: {
              email: claims.email || user.email,
              emailVerified: claims.email_verified || user.emailVerified,
              name: claims.name || claims.username || user.name,
            },
          });
        }
      } catch (dbError) {
        console.error('Error syncing user with database:', dbError);
      }
    } else if (claims?.sub) {
      console.log('Database not configured, skipping user sync');
    }

    // Get post-redirect URI from cookie
    const cookieStore = cookies();
    const postRedirectUri = cookieStore.get('logto_post_redirect_uri')?.value || '/onboarding';

    // Clear the cookie and redirect
    cookieStore.delete('logto_post_redirect_uri');

    redirect(postRedirectUri);
  } catch (error) {
    console.error('Logto callback error:', error);
    redirect('/?error=auth_failed');
  }
}
