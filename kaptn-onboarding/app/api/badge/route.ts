// API: Issue Badge
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json(
      { error: 'Failed to issue badge' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    );
  }
}
