# Waitlist Invitation Flow

## Overview

The invitation system allows you to send personalized invitation links to waitlist users. When users click the link, they create their own Logto account with their own password, and the system automatically links their new account to their waitlist entry.

## How It Works

### 1. Waitlist Submission
User submits the waitlist form → Entry created in `WaitlistEntry` table with `status: ACTIVE`

### 2. Send Invitation
**Endpoint:** `POST /api/waitlist/invite`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitationToken": "a1b2c3d4...",
  "expiresAt": "2026-02-02T12:00:00Z"
}
```

**What happens:**
- Generates a secure random token (64 hex characters)
- Sets expiration to 7 days from now
- Stores token in `WaitlistEntry.invitationToken`
- Sends branded email with invitation link

**Email sent to:** `user@example.com`
**Email from:** `KAPTN <onboarding@kaptn.ai>` (configurable via `EMAIL_FROM`)
**Subject:** "Your KAPTN Bridge Access Invitation"

### 3. User Clicks Invitation Link
**URL format:** `https://www.kaptn.ai/invite/{invitationToken}`

**What happens:**
- User lands on invitation page (`/app/invite/[token]/page.tsx`)
- Page calls `POST /api/waitlist/verify-invitation` to check if token is valid
- If valid: Token stored in cookie, user redirected to Logto sign-up
- If expired: Shows expiration message with contact support link
- If invalid: Shows error message with return to landing link

### 4. User Creates Logto Account
**User is redirected to:** Logto sign-up/sign-in page

**User can:**
- Create account with email + password
- Sign in with Google
- Sign in with Discord

**Security:** User sets their own password (never transmitted via email)

### 5. Logto Callback
**Endpoint:** `GET /api/logto/callback`

**What happens:**
- Callback receives authorization code from Logto
- Reads `kaptn_invitation_token` cookie
- Finds `WaitlistEntry` with that token
- Updates the associated `User` record with Logto ID
- Marks `WaitlistEntry.status` as `CONVERTED`
- Sets `WaitlistEntry.convertedAt` to current timestamp
- Deletes invitation cookie
- Redirects user to `/onboarding`

### 6. User Completes Onboarding
User continues with the normal onboarding flow (scenarios, oath, profile, badge)

## Database Schema Changes

### WaitlistEntry Model
```prisma
model WaitlistEntry {
  // ... existing fields ...

  // Invitation system
  invitationToken     String?   @unique
  invitedAt           DateTime?
  invitationExpiresAt DateTime?

  @@index([invitationToken])
}
```

## API Endpoints

### Send Invitation
```typescript
POST /api/waitlist/invite
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Authorization:** Should add admin authentication in production

### Verify Invitation
```typescript
POST /api/waitlist/verify-invitation
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6..."
}
```

**Response (valid):**
```json
{
  "valid": true,
  "name": "John Doe",
  "email": "john@example.com",
  "expiresAt": "2026-02-02T12:00:00Z"
}
```

**Response (expired):**
```json
{
  "error": "Invitation has expired"
}
```

## Environment Variables Required

```bash
# Resend API for sending emails
RESEND_API_KEY=re_...

# Optional: Custom "from" email (defaults to onboarding@kaptn.ai)
EMAIL_FROM=KAPTN <noreply@kaptn.ai>

# Base URL for invitation links
NEXT_PUBLIC_BASE_URL=https://www.kaptn.ai
```

## Security Features

1. **Secure Tokens:** 32-byte random tokens (64 hex characters)
2. **Expiration:** Invitations expire after 7 days
3. **One-Time Use:** Tokens can only be used once (`status: CONVERTED` check)
4. **No Password Transmission:** Users create their own passwords on Logto
5. **HTTPS Only:** Cookies marked as `secure` in production

## Testing the Flow Locally

### 1. Start the development server
```bash
pnpm run dev
```

### 2. Submit a waitlist entry
Navigate to `http://localhost:3000/onboarding` and complete the waitlist form.

### 3. Send an invitation (API call)
```bash
curl -X POST http://localhost:3000/api/waitlist/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 4. Check the response for the invitation token
```json
{
  "invitationToken": "abc123..."
}
```

### 5. Open the invitation link
```
http://localhost:3000/invite/abc123...
```

### 6. Complete Logto sign-up
Follow the Logto authentication flow.

### 7. Verify the user was converted
Check the database:
```sql
SELECT * FROM "WaitlistEntry" WHERE email = 'test@example.com';
-- Should show status: CONVERTED and convertedAt timestamp
```

## Production Deployment

### 1. Add environment variables to Vercel
```bash
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
```

### 2. Deploy the database migration
```bash
DATABASE_URL="your-production-db" bunx prisma db push
```

### 3. Deploy to Vercel
```bash
git push origin main
```

## Admin Interface (Future Enhancement)

Consider adding an admin dashboard to:
- View all waitlist entries
- Send invitations in bulk
- Track conversion rates
- Resend expired invitations
- Export waitlist data

## Email Customization

The invitation email HTML can be customized in `/app/api/waitlist/invite/route.ts`. The current design uses:
- Monospace fonts for "bridge system" aesthetic
- KAPTN brand colors (#00ff88, #ffd700)
- Responsive HTML for mobile devices
- Clear call-to-action button

## Troubleshooting

### Invitation email not sent
- Check `RESEND_API_KEY` is set correctly
- Verify Resend account is active
- Check Vercel logs for error messages

### Invitation link shows "Invalid"
- Token may have expired (7 days limit)
- Token may have already been used
- Database connection issue

### User created but not linked to waitlist
- Check `kaptn_invitation_token` cookie is being set
- Verify callback route is reading the cookie
- Check database logs for conversion

## Migration from Old System

If you had users who submitted the waitlist before this invitation system:
1. They will have `invitationToken: null`
2. You can send them invitations using the `/api/waitlist/invite` endpoint
3. The system will generate tokens for them

## Related Files

- `/app/api/waitlist/invite/route.ts` - Send invitation emails
- `/app/api/waitlist/verify-invitation/route.ts` - Verify token validity
- `/app/invite/[token]/page.tsx` - Invitation landing page
- `/app/api/logto/callback/route.ts` - OAuth callback with invitation linking
- `/prisma/schema.prisma` - Database schema with invitation fields
