// Verify Invitation Token
import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Find waitlist entry with this token
    const waitlistEntry = await prisma.waitlistEntry.findUnique({
      where: { invitationToken: token },
      include: { user: true },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (waitlistEntry.invitationExpiresAt && waitlistEntry.invitationExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 } // 410 Gone
      );
    }

    // Check if already converted
    if (waitlistEntry.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Invitation has already been used' },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      name: waitlistEntry.name,
      email: waitlistEntry.email,
      expiresAt: waitlistEntry.invitationExpiresAt,
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Failed to verify invitation' },
      { status: 500 }
    );
  }
}
