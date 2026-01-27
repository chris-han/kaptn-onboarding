// API: Save User Profile
import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      captainName,
      knowledgePattern,
      thesisPattern,
      prioritizePattern,
      actionPattern,
      navigationPattern,
      scenarioResponses,
    } = body;

    // Validate required fields
    if (!userId || !knowledgePattern || !thesisPattern || !prioritizePattern || !actionPattern || !navigationPattern) {
      return NextResponse.json(
        { error: 'Missing required profile fields' },
        { status: 400 }
      );
    }

    // If database is not configured, return success without saving
    if (!isDatabaseConfigured || !prisma) {
      console.log('Database not configured, skipping profile save');
      return NextResponse.json({
        success: true,
        message: 'Profile received (not persisted)',
        temporary: true
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

    // Create or update profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        knowledgePattern,
        thesisPattern,
        prioritizePattern,
        actionPattern,
        navigationPattern,
        captainName: captainName || null,
        scenarioResponses: scenarioResponses || {},
        onboardingCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        knowledgePattern,
        thesisPattern,
        prioritizePattern,
        actionPattern,
        navigationPattern,
        captainName: captainName || null,
        scenarioResponses: scenarioResponses || {},
        onboardingCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    // Return success even if save fails, to not block user flow
    return NextResponse.json({
      success: true,
      message: 'Profile received (save failed)',
      temporary: true,
      error: String(error)
    });
  }
}
