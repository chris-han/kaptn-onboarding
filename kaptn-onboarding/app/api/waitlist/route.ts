import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

// Rate limiting: Track submissions (email -> timestamp)
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

// Clean up old entries periodically to prevent memory issues
function cleanupOldSubmissions() {
  const now = Date.now();
  for (const [email, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      recentSubmissions.delete(email);
    }
  }
}

// Check if email was recently submitted
function isRateLimited(email: string): boolean {
  cleanupOldSubmissions();
  const lastSubmission = recentSubmissions.get(email.toLowerCase());
  if (lastSubmission) {
    const timeSinceLastSubmission = Date.now() - lastSubmission;
    return timeSinceLastSubmission < RATE_LIMIT_WINDOW;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, interests } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration already received. Please wait a few minutes before submitting again.",
        },
        { status: 429 }
      );
    }

    // Database is required for the user journey
    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        {
          success: false,
          message: "System temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    try {
      console.log('[Waitlist] Starting database operations...');

      // Find or create user
      console.log('[Waitlist] Finding user with email:', email.toLowerCase());
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      console.log('[Waitlist] User found:', !!user);

      if (!user) {
        console.log('[Waitlist] Creating new user...');
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name,
          },
        });
        console.log('[Waitlist] User created:', user.id);
      }

      // Check if waitlist entry already exists
      console.log('[Waitlist] Checking for existing waitlist entry...');
      const existingEntry = await prisma.waitlistEntry.findUnique({
        where: { email: email.toLowerCase() },
      });
      console.log('[Waitlist] Existing entry found:', !!existingEntry);

      if (existingEntry) {
        // User already on waitlist, return their userId for signup
        return NextResponse.json({
          success: true,
          userId: user.id,
          message: "You're already registered. Proceeding to account creation.",
        });
      }

      // Create waitlist entry
      console.log('[Waitlist] Creating waitlist entry...');
      await prisma.waitlistEntry.create({
        data: {
          userId: user.id,
          name,
          email: email.toLowerCase(),
          company: company || null,
          interests: interests || [],
        },
      });
      console.log('[Waitlist] Waitlist entry created successfully');

      // Track this submission to prevent duplicates
      recentSubmissions.set(email.toLowerCase(), Date.now());

      return NextResponse.json({
        success: true,
        userId: user.id,
        message: "Registration received. Proceeding to account creation.",
      });
    } catch (dbError) {
      console.error('[Waitlist] Database operation failed:', {
        error: dbError,
        errorMessage: dbError instanceof Error ? dbError.message : String(dbError),
        errorStack: dbError instanceof Error ? dbError.stack : undefined,
        errorName: dbError instanceof Error ? dbError.name : undefined,
        prismaAvailable: !!prisma,
        isDatabaseConfigured,
        // @ts-ignore
        errorCode: dbError?.code,
        // @ts-ignore
        errorMeta: dbError?.meta,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Unable to process registration. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "System error. Unable to process registration.",
      },
      { status: 500 }
    );
  }
}
