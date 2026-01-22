import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext } from '@logto/next/server-actions';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { logtoConfig } from '@/lib/logto';
import { randomBytes } from 'crypto';

// Generate a temporary user ID for when database is not configured
function generateTempUserId(): string {
  return `temp-${randomBytes(16).toString('hex')}`;
}

// Create a new user in the database and return the user ID
// If user is authenticated, return their existing ID
// If database is not configured, generate a temporary ID
export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured || !prisma) {
      console.log('Database not configured, generating temporary user ID');
      return NextResponse.json({
        userId: generateTempUserId(),
        authenticated: false,
        success: true,
        temporary: true
      });
    }

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
    // Return a temporary ID if database operation fails
    return NextResponse.json({
      userId: generateTempUserId(),
      authenticated: false,
      success: true,
      temporary: true,
      error: 'Database unavailable, using temporary ID'
    });
  }
}
