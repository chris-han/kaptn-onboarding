// Get Current User Info
import { getLogtoContext } from '@logto/next/server-actions';
import { NextRequest, NextResponse } from 'next/server';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated) {
      return NextResponse.json(
        { authenticated: false, user: null }
      );
    }

    if (!claims?.sub) {
      return NextResponse.json(
        { authenticated: false, user: null }
      );
    }

    // Get user from database if configured
    if (!isDatabaseConfigured || !prisma) {
      console.log('Database not configured, returning authenticated user without data');
      return NextResponse.json({
        authenticated: true,
        user: null,
        claims,
        temporary: true,
      });
    }

    const user = await prisma.user.findUnique({
      where: { logtoId: claims.sub },
      include: {
        profile: true,
        badge: true,
        waitlistEntry: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: user || null,
      claims,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', authenticated: false },
      { status: 500 }
    );
  }
}
