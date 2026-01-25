// Logto Callback Route
import { getLogtoContext } from '@logto/next/server-actions';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Force dynamic rendering since this route uses cookies and authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user info from Logto
    const { claims } = await getLogtoContext(logtoConfig);
    const cookieStore = cookies();

    if (claims?.sub && isDatabaseConfigured && prisma) {
      try {
        // Check if we're linking to an existing user from waitlist
        const linkUserId = cookieStore.get('logto_link_user_id')?.value;

        if (linkUserId) {
          // Link Logto account to existing user
          const existingUser = await prisma.user.findUnique({
            where: { id: linkUserId },
          });

          if (existingUser && !existingUser.logtoId) {
            // Link the logtoId to the existing user
            await prisma.user.update({
              where: { id: linkUserId },
              data: {
                logtoId: claims.sub,
                email: claims.email ? claims.email.toLowerCase() : existingUser.email,
                emailVerified: claims.email_verified || existingUser.emailVerified,
                name: claims.name || claims.username || existingUser.name,
              },
            });
            console.log(`Linked Logto account ${claims.sub} to existing user ${linkUserId}`);
          } else if (existingUser?.logtoId === claims.sub) {
            // Already linked, just update info
            await prisma.user.update({
              where: { id: linkUserId },
              data: {
                email: claims.email ? claims.email.toLowerCase() : existingUser.email,
                emailVerified: claims.email_verified || existingUser.emailVerified,
                name: claims.name || claims.username || existingUser.name,
              },
            });
          } else {
            console.warn(`Cannot link: user ${linkUserId} already has a different Logto account`);
          }

          // Clear the link cookie
          cookieStore.delete('logto_link_user_id');
        } else {
          // Standard flow: find or create user by logtoId
          let user = await prisma.user.findUnique({
            where: { logtoId: claims.sub },
          });

          if (!user && claims.email) {
            // If no user found by logtoId, try to find by email (for linking)
            const emailUser = await prisma.user.findUnique({
              where: { email: claims.email.toLowerCase() },
            });

            if (emailUser && !emailUser.logtoId) {
              // Link existing email-based user to Logto account
              user = await prisma.user.update({
                where: { id: emailUser.id },
                data: {
                  logtoId: claims.sub,
                  email: claims.email.toLowerCase(),
                  emailVerified: claims.email_verified || emailUser.emailVerified,
                  name: claims.name || claims.username || emailUser.name,
                },
              });
              console.log(`Auto-linked Logto account ${claims.sub} to existing user ${emailUser.id} via email`);
            }
          }

          if (!user) {
            // Create new user only if no existing user found
            user = await prisma.user.create({
              data: {
                logtoId: claims.sub,
                email: claims.email ? claims.email.toLowerCase() : null,
                emailVerified: claims.email_verified || false,
                name: claims.name || claims.username || null,
              },
            });
            console.log(`Created new user ${user.id} for Logto account ${claims.sub}`);
          } else {
            // Update existing user info
            user = await prisma.user.update({
              where: { logtoId: claims.sub },
              data: {
                email: claims.email ? claims.email.toLowerCase() : user.email,
                emailVerified: claims.email_verified || user.emailVerified,
                name: claims.name || claims.username || user.name,
              },
            });
          }
        }
      } catch (dbError) {
        console.error('Error syncing user with database:', dbError);
      }
    } else if (claims?.sub) {
      console.log('Database not configured, skipping user sync');
    }

    // Get post-redirect URI from cookie
    const postRedirectUri = cookieStore.get('logto_post_redirect_uri')?.value || '/onboarding';

    // Clear the cookies and redirect
    cookieStore.delete('logto_post_redirect_uri');
    cookieStore.delete('logto_link_user_id');

    redirect(postRedirectUri);
  } catch (error) {
    console.error('Logto callback error:', error);
    redirect('/?error=auth_failed');
  }
}
