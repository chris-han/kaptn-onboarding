import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from '@/lib/prisma';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || "your-email@example.com";

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(RESEND_API_KEY);

// Rate limiting: Track email submissions (email -> timestamp)
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

    // Save to database
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
        },
      });
    }

    // Check if waitlist entry already exists
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "You're already on the waitlist.",
        },
        { status: 409 }
      );
    }

    // Create waitlist entry
    await prisma.waitlistEntry.create({
      data: {
        userId: user.id,
        name,
        email: email.toLowerCase(),
        company: company || null,
        interests: interests || [],
      },
    });

    // Create email content
    const interestsList = interests?.length
      ? interests.join(", ")
      : "No specific interests selected";

    const textContent = `
BRIDGE SIGNAL RECEIVED
Status: New Captain Registration

======================
CAPTAIN PROFILE
======================
Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}

======================
SYSTEMS OF INTEREST
======================
${interestsList}

======================
ONBOARDING STATUS
======================
Decision Profile: Calibrated
Bridge Oath: Affirmed
Waitlist Status: Active

This Captain has completed the bridge activation protocol and is ready for mission assignment.

---
KAPTN Enterprise Bridge
"The unknown awaits."
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; background: #000; color: #fff; padding: 20px; }
    .header { border-bottom: 2px solid #0066FF; padding-bottom: 10px; margin-bottom: 20px; }
    .section { margin: 20px 0; padding: 15px; border-left: 3px solid #00FF00; }
    .label { color: #FFD700; font-weight: bold; }
    .value { color: #fff; margin-left: 10px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h2>BRIDGE SIGNAL RECEIVED</h2>
    <p>Status: <span style="color: #00FF00;">New Captain Registration</span></p>
  </div>

  <div class="section">
    <h3>CAPTAIN PROFILE</h3>
    <p><span class="label">Name:</span><span class="value">${name}</span></p>
    <p><span class="label">Email:</span><span class="value">${email}</span></p>
    <p><span class="label">Company:</span><span class="value">${company || "Not provided"}</span></p>
  </div>

  <div class="section">
    <h3>SYSTEMS OF INTEREST</h3>
    <p>${interestsList}</p>
  </div>

  <div class="section">
    <h3>ONBOARDING STATUS</h3>
    <p><span class="label">Decision Profile:</span><span class="value">Calibrated</span></p>
    <p><span class="label">Bridge Oath:</span><span class="value">Affirmed</span></p>
    <p><span class="label">Waitlist Status:</span><span class="value" style="color: #00FF00;">Active</span></p>
  </div>

  <div class="footer">
    <p>This Captain has completed the bridge activation protocol and is ready for mission assignment.</p>
    <br/>
    <p>KAPTN Enterprise Bridge<br/>"The unknown awaits."</p>
  </div>
</body>
</html>
    `;

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: "KAPTN Enterprise Bridge <noreply@kaptn.ai>",
      to: RECIPIENT_EMAIL,
      subject: `New KAPTN Waitlist Registration: ${name}`,
      text: textContent,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    // Track this submission to prevent duplicates
    recentSubmissions.set(email.toLowerCase(), Date.now());

    return NextResponse.json({
      success: true,
      message: "Registration received. Welcome to the bridge.",
    });
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
