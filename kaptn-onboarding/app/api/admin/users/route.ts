// Admin API: User Management
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const hasProfile = searchParams.get('hasProfile');
    const hasBadge = searchParams.get('hasBadge');

    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (hasProfile === 'true') {
      where.profile = { isNot: null };
    }
    if (hasBadge === 'true') {
      where.badge = { isNot: null };
    }

    // Get users with full relations
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          waitlistEntry: true,
          profile: true,
          badge: true,
          journeyEvents: {
            orderBy: { timestamp: 'asc' },
            take: 10, // Last 10 events
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get user stats
    const stats = await prisma.user.aggregate({
      _count: { id: true },
    });

    const profileCount = await prisma.userProfile.count();
    const badgeCount = await prisma.badge.count();

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers: stats._count.id,
        usersWithProfiles: profileCount,
        usersWithBadges: badgeCount,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Get single user journey
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        waitlistEntry: true,
        profile: true,
        badge: true,
        journeyEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate journey metrics
    const journeyMetrics = {
      totalEvents: user.journeyEvents.length,
      phasesCompleted: user.journeyEvents.filter(e => e.eventType === 'PHASE_COMPLETE').length,
      totalDuration: user.journeyEvents.reduce((sum, e) => sum + (e.duration || 0), 0),
      startedAt: user.journeyEvents[0]?.timestamp,
      completedAt: user.profile?.completedAt,
    };

    return NextResponse.json({
      user,
      metrics: journeyMetrics,
    });
  } catch (error) {
    console.error('Error fetching user journey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user journey' },
      { status: 500 }
    );
  }
}
