import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext } from '@logto/next/server-actions';
import { prisma } from '@/lib/prisma';
import { logtoConfig } from '@/lib/logto';

// Create a new user in the database and return the user ID
// If user is authenticated, return their existing ID
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    if (isAuthenticated) {

      if (claims?.sub) {
        // User is authenticated, find their existing user record
        const user = await prisma.user.findUnique({
          where: { logtoId: claims.sub },
        });

        if (user) {
          return NextResponse.json({
            userId: user.id,
            authenticated: true,
            success: true
          });
        }
      }
    }

    // Create a new anonymous user
    const user = await prisma.user.create({
      data: {}, // All fields are optional, Prisma will generate a CUID
    });

    return NextResponse.json({
      userId: user.id,
      authenticated: false,
      success: true
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', success: false },
      { status: 500 }
    );
  }
}
