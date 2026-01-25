// API: Issue Badge
import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, captainName } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // If database is not configured, generate temporary badge
    if (!isDatabaseConfigured || !prisma) {
      console.log('Database not configured, generating temporary badge');
      const serialNumber = userId.slice(-8).toUpperCase();
      return NextResponse.json({
        success: true,
        badge: {
          userId,
          serialNumber,
          captainName: captainName || null,
          issuedAt: new Date(),
        },
        temporary: true,
        message: 'Temporary badge issued (not persisted)',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if badge already exists
    const existingBadge = await prisma.badge.findUnique({
      where: { userId },
    });

    if (existingBadge) {
      return NextResponse.json({
        success: true,
        badge: existingBadge,
        message: 'Badge already issued',
      });
    }

    // Generate serial number from last 8 chars of userId
    const serialNumber = userId.slice(-8).toUpperCase();

    // Create badge
    const badge = await prisma.badge.create({
      data: {
        userId,
        serialNumber,
        captainName: captainName || null,
      },
    });

    return NextResponse.json({
      success: true,
      badge,
    });
  } catch (error) {
    console.error('Error issuing badge:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      // @ts-ignore - Prisma error codes
      code: error?.code,
      // @ts-ignore - Prisma error metadata
      meta: error?.meta,
    });

    // Return error response instead of fake success
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
      temporary: true,
      message: 'Failed to issue badge'
    }, { status: 500 });
  }
}

// Get badge by userId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // If database is not configured, return temporary badge
    if (!isDatabaseConfigured || !prisma) {
      console.log('Database not configured, returning temporary badge info');
      const serialNumber = userId.slice(-8).toUpperCase();
      return NextResponse.json({
        success: true,
        badge: {
          userId,
          serialNumber,
          issuedAt: new Date(),
        },
        temporary: true,
      });
    }

    const badge = await prisma.badge.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      badge,
    });
  } catch (error) {
    console.error('Error fetching badge:', error);
    // Return temporary badge if database fails
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const serialNumber = userId?.slice(-8).toUpperCase() || 'TEMP0000';
    return NextResponse.json({
      success: true,
      badge: {
        userId,
        serialNumber,
        issuedAt: new Date(),
      },
      temporary: true,
      error: 'Database error'
    });
  }
}
