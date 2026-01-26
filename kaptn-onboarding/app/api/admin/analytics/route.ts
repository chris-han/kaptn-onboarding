// Admin API: Analytics & Metrics
import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if database is configured
    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get waitlist submissions over time
    const submissions = await prisma.waitlistEntry.groupBy({
      by: ['submittedAt'],
      _count: { id: true },
      where: {
        submittedAt: {
          gte: startDate,
        },
      },
    });

    // Get invitations sent over time
    const invitations = await prisma.waitlistEntry.groupBy({
      by: ['invitedAt'],
      _count: { id: true },
      where: {
        invitedAt: {
          gte: startDate,
          not: null,
        },
      },
    });

    // Get conversions over time
    const conversions = await prisma.waitlistEntry.groupBy({
      by: ['convertedAt'],
      _count: { id: true },
      where: {
        convertedAt: {
          gte: startDate,
          not: null,
        },
      },
    });

    // Aggregate by day
    const dailyMetrics: Record<string, {
      date: string;
      submissions: number;
      invitations: number;
      conversions: number;
    }> = {};

    // Initialize all days in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMetrics[dateKey] = {
        date: dateKey,
        submissions: 0,
        invitations: 0,
        conversions: 0,
      };
    }

    // Populate submissions
    submissions.forEach((item: any) => {
      if (item.submittedAt) {
        const dateKey = new Date(item.submittedAt).toISOString().split('T')[0];
        if (dailyMetrics[dateKey]) {
          dailyMetrics[dateKey].submissions += item._count.id;
        }
      }
    });

    // Populate invitations
    invitations.forEach((item: any) => {
      if (item.invitedAt) {
        const dateKey = new Date(item.invitedAt).toISOString().split('T')[0];
        if (dailyMetrics[dateKey]) {
          dailyMetrics[dateKey].invitations += item._count.id;
        }
      }
    });

    // Populate conversions
    conversions.forEach((item: any) => {
      if (item.convertedAt) {
        const dateKey = new Date(item.convertedAt).toISOString().split('T')[0];
        if (dailyMetrics[dateKey]) {
          dailyMetrics[dateKey].conversions += item._count.id;
        }
      }
    });

    // Convert to array sorted by date
    const timeSeriesData = Object.values(dailyMetrics).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Calculate overall statistics
    const [
      totalSubmissions,
      totalInvitations,
      totalConversions,
      avgTimeToInvite,
      avgTimeToConvert,
    ] = await Promise.all([
      // Total submissions
      prisma.waitlistEntry.count(),

      // Total invitations sent
      prisma.waitlistEntry.count({
        where: { invitedAt: { not: null } },
      }),

      // Total conversions
      prisma.waitlistEntry.count({
        where: { status: 'CONVERTED' },
      }),

      // Average time from submission to invitation (in days)
      prisma.$queryRaw<Array<{ avg: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("invitedAt" - "submittedAt")) / 86400) as avg
        FROM "WaitlistEntry"
        WHERE "invitedAt" IS NOT NULL
      `.then(result => result[0]?.avg || 0),

      // Average time from invitation to conversion (in days)
      prisma.$queryRaw<Array<{ avg: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("convertedAt" - "invitedAt")) / 86400) as avg
        FROM "WaitlistEntry"
        WHERE "invitedAt" IS NOT NULL AND "convertedAt" IS NOT NULL
      `.then(result => result[0]?.avg || 0),
    ]);

    // Calculate conversion rates
    const invitationRate = totalSubmissions > 0
      ? (totalInvitations / totalSubmissions) * 100
      : 0;

    const conversionRate = totalInvitations > 0
      ? (totalConversions / totalInvitations) * 100
      : 0;

    const overallConversionRate = totalSubmissions > 0
      ? (totalConversions / totalSubmissions) * 100
      : 0;

    // Get interest distribution
    const interestCounts = await prisma.$queryRaw<Array<{ interest: string; count: number }>>`
      SELECT unnest(interests) as interest, COUNT(*) as count
      FROM "WaitlistEntry"
      GROUP BY interest
      ORDER BY count DESC
    `;

    // Get status distribution by submitted date range
    const statusTrends = await prisma.waitlistEntry.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        submittedAt: {
          gte: startDate,
        },
      },
    });

    return NextResponse.json({
      timeSeriesData,
      summary: {
        totalSubmissions,
        totalInvitations,
        totalConversions,
        invitationRate: Math.round(invitationRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        overallConversionRate: Math.round(overallConversionRate * 10) / 10,
        avgTimeToInvite: Math.round(avgTimeToInvite * 10) / 10,
        avgTimeToConvert: Math.round(avgTimeToConvert * 10) / 10,
      },
      interestDistribution: interestCounts,
      statusTrends: statusTrends.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
