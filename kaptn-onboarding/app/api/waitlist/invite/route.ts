// Send Invitation to Waitlist User
import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/admin';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find waitlist entry
    const waitlistEntry = await prisma.waitlistEntry.findUnique({
      where: { email: email.toLowerCase() },
      include: { user: true },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Email not found in waitlist' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (waitlistEntry.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'User has already been converted' },
        { status: 400 }
      );
    }

    // Generate invitation token (32 bytes = 64 hex characters)
    const invitationToken = randomBytes(32).toString('hex');

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update waitlist entry with invitation token
    await prisma.waitlistEntry.update({
      where: { id: waitlistEntry.id },
      data: {
        invitationToken,
        invitedAt: new Date(),
        invitationExpiresAt: expiresAt,
      },
    });

    // Construct invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/invite/${invitationToken}`;

    // Send invitation email
    const emailResult = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'KAPTN <onboarding@kaptn.ai>',
      to: email,
      subject: 'Your KAPTN Bridge Access Invitation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #0a0e1a;
              color: #ffffff;
              padding: 40px 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #1a1f2e;
              border: 1px solid #00ff88;
              padding: 40px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #00ff88;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #00ff88;
              font-size: 24px;
              margin: 0;
              letter-spacing: 2px;
            }
            .content {
              line-height: 1.8;
              font-size: 14px;
            }
            .content p {
              margin: 20px 0;
            }
            .cta {
              text-align: center;
              margin: 40px 0;
            }
            .button {
              display: inline-block;
              background-color: #ffd700;
              color: #000000;
              padding: 15px 40px;
              text-decoration: none;
              font-weight: bold;
              letter-spacing: 1px;
              border: none;
              font-size: 14px;
            }
            .button:hover {
              background-color: #ffed4e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #00ff88;
              font-size: 12px;
              color: #888888;
              text-align: center;
            }
            .expiry {
              color: #ffd700;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>[ KAPTN BRIDGE ACCESS ]</h1>
            </div>

            <div class="content">
              <p>Captain ${waitlistEntry.name},</p>

              <p>Your bridge activation clearance has been granted. You are authorized to assume command of your KAPTN operation system.</p>

              <p><strong>AUTHORIZATION CODE:</strong> ${invitationToken.substring(0, 8).toUpperCase()}-****-****</p>

              <p>This invitation provides secure access to create your command credentials and complete your bridge calibration sequence.</p>

              <div class="cta">
                <a href="${invitationUrl}" class="button">ASSUME COMMAND</a>
              </div>

              <p>For security protocols, this authorization link expires in <span class="expiry">7 days</span>.</p>

              <p>If you did not request bridge access or believe this transmission was sent in error, please disregard this message.</p>

              <p>— KAPTN COMMAND</p>
            </div>

            <div class="footer">
              <p>© 2026 KAPTN SYSTEMS. ALL RIGHTS RESERVED.</p>
              <p>This is an automated transmission. Do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Invitation sent to ${email}:`, emailResult);

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationToken, // For testing/admin purposes
      expiresAt,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
