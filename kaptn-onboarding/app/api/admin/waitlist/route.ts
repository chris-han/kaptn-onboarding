// Admin API: Waitlist Management
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get waitlist entries with user data
    const [entries, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              profile: {
                select: {
                  onboardingCompleted: true,
                  completedAt: true,
                },
              },
              badge: {
                select: {
                  serialNumber: true,
                  issuedAt: true,
                },
              },
            },
          },
        },
      }),
      prisma.waitlistEntry.count({ where }),
    ]);

    // Calculate stats
    const stats = await prisma!.waitlistEntry.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// Update waitlist entry status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const updated = await prisma!.waitlistEntry.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONVERTED' && { convertedAt: new Date() }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}
