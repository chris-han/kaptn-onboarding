// Admin API: Daily Statistics & Analytics
import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured. Admin features require database access.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const granularity = searchParams.get('granularity') || 'daily'; // daily, weekly, monthly

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get daily stats
    const dailyStats = await prisma!.dailyStats.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // If no stats exist, calculate them on the fly
    if (dailyStats.length === 0) {
      const stats = await calculateStats(start, end);
      return NextResponse.json({
        data: stats,
        calculated: true,
      });
    }

    // Get aggregate metrics
    const totalEntrance = dailyStats.reduce((sum, s) => sum + s.entranceCount, 0);
    const totalWaitlist = dailyStats.reduce((sum, s) => sum + s.waitlistJoined, 0);
    const totalBadges = dailyStats.reduce((sum, s) => sum + s.badgesIssued, 0);

    const avgEntranceToWaitlist = totalEntrance > 0
      ? ((totalWaitlist / totalEntrance) * 100).toFixed(2)
      : '0.00';
    const avgOverallConversion = totalEntrance > 0
      ? ((totalBadges / totalEntrance) * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      data: dailyStats,
      aggregates: {
        totalEntrance,
        totalWaitlist,
        totalBadges,
        avgEntranceToWaitlist: `${avgEntranceToWaitlist}%`,
        avgOverallConversion: `${avgOverallConversion}%`,
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Helper function to calculate stats from events
async function calculateStats(start: Date, end: Date) {
  const events = await prisma!.journeyEvent.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
    select: {
      timestamp: true,
      phase: true,
      eventType: true,
    },
  });

  // Group by date
  const statsByDate = events.reduce((acc, event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        entranceCount: 0,
        waitlistJoined: 0,
        badgesIssued: 0,
      };
    }

    if (event.phase === 'entrance' && event.eventType === 'PHASE_START') {
      acc[dateKey].entranceCount++;
    }
    if (event.phase === 'waitlist' && event.eventType === 'PHASE_COMPLETE') {
      acc[dateKey].waitlistJoined++;
    }
    if (event.phase === 'welcome' && event.eventType === 'PHASE_COMPLETE') {
      acc[dateKey].badgesIssued++;
    }

    return acc;
  }, {} as Record<string, any>);

  return Object.values(statsByDate);
}

// Update daily stats (cron job endpoint)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Calculate stats for the day
    const [
      entranceEvents,
      waitlistEntries,
      profilesCreated,
      badgesIssued,
    ] = await Promise.all([
      prisma!.journeyEvent.count({
        where: {
          phase: 'entrance',
          eventType: 'PHASE_START',
          timestamp: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      }),
      prisma!.waitlistEntry.count({
        where: {
          submittedAt: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      }),
      prisma!.userProfile.count({
        where: {
          createdAt: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      }),
      prisma!.badge.count({
        where: {
          issuedAt: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      }),
    ]);

    // Calculate conversion rates
    const entranceToWaitlist = entranceEvents > 0
      ? (waitlistEntries / entranceEvents)
      : 0;
    const overallConversion = entranceEvents > 0
      ? (badgesIssued / entranceEvents)
      : 0;

    // Upsert daily stats
    const stats = await prisma!.dailyStats.upsert({
      where: { date: targetDate },
      update: {
        entranceCount: entranceEvents,
        waitlistJoined: waitlistEntries,
        profilesCreated,
        badgesIssued,
        entranceToWaitlist,
        overallConversion,
      },
      create: {
        date: targetDate,
        entranceCount: entranceEvents,
        waitlistJoined: waitlistEntries,
        profilesCreated,
        badgesIssued,
        entranceToWaitlist,
        overallConversion,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    );
  }
}
