// Admin API: Conversion Funnel Analytics
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

    // Build date filter
    const dateFilter = startDate && endDate ? {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } : {};

    // Get funnel metrics by counting events at each phase
    const funnelData = await prisma!.journeyEvent.groupBy({
      by: ['phase'],
      where: {
        eventType: 'PHASE_COMPLETE',
        ...dateFilter,
      },
      _count: {
        id: true,
      },
    });

    // Get total unique users who started the journey
    const totalUsers = await prisma!.journeyEvent.findMany({
      where: {
        phase: 'entrance',
        eventType: 'PHASE_START',
        ...dateFilter,
      },
      distinct: ['sessionId'],
    });

    // Get waitlist conversions
    const waitlistCount = await prisma!.waitlistEntry.count({
      where: startDate && endDate ? {
        submittedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      } : {},
    });

    // Get profiles created
    const profilesCount = await prisma!.userProfile.count({
      where: startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      } : {},
    });

    // Get badges issued
    const badgesCount = await prisma!.badge.count({
      where: startDate && endDate ? {
        issuedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      } : {},
    });

    // Calculate conversion rates
    const entranceCount = totalUsers.length;
    const entranceToWaitlist = entranceCount > 0
      ? ((waitlistCount / entranceCount) * 100).toFixed(2)
      : '0.00';
    const waitlistToProfile = waitlistCount > 0
      ? ((profilesCount / waitlistCount) * 100).toFixed(2)
      : '0.00';
    const overallConversion = entranceCount > 0
      ? ((badgesCount / entranceCount) * 100).toFixed(2)
      : '0.00';

    // Format response
    const funnel = {
      stages: [
        { name: 'Entrance', count: entranceCount, rate: '100.00' },
        { name: 'Waitlist', count: waitlistCount, rate: entranceToWaitlist },
        { name: 'Profile Created', count: profilesCount, rate: waitlistToProfile },
        { name: 'Badge Issued', count: badgesCount, rate: overallConversion },
      ],
      phaseBreakdown: funnelData.reduce((acc, item) => {
        acc[item.phase] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      metrics: {
        totalEntrance: entranceCount,
        totalWaitlist: waitlistCount,
        totalProfiles: profilesCount,
        totalBadges: badgesCount,
        conversionRates: {
          entranceToWaitlist: `${entranceToWaitlist}%`,
          waitlistToProfile: `${waitlistToProfile}%`,
          overall: `${overallConversion}%`,
        },
      },
    };

    return NextResponse.json(funnel);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}
