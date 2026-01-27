# Admin Waitlist Management

## Overview

The admin waitlist management interface allows you to view, filter, and send invitations to users who have joined the KAPTN waitlist.

## Accessing the Admin Panel

**URL:** `https://www.kaptn.ai/admin/waitlist` (or `http://localhost:3000/admin/waitlist` for local development)

**Authentication:** You must be signed in with Logto to access this page. If you're not authenticated, you'll be automatically redirected to the Logto sign-in page.

## Features

### 1. Dashboard Statistics

At the top of the page, you'll see a dashboard with key metrics:

- **TOTAL**: Total number of waitlist entries
- **ACTIVE**: Users on waitlist who haven't been converted yet
- **CONVERTED**: Users who have successfully created accounts via invitation
- **INACTIVE**: Users who have opted out or been deactivated

### 2. Filtering

Filter waitlist entries by status:

- **ALL**: Show all entries regardless of status
- **ACTIVE**: Show only active waitlist users (can receive invitations)
- **CONVERTED**: Show users who have already created accounts
- **INACTIVE**: Show inactive users

### 3. Search

Search across:
- Name
- Email address
- Company name

**Usage:** Type your search query and press Enter or click the "SEARCH" button.

### 4. Sending Individual Invitations

**Steps:**
1. Find the user you want to invite in the table
2. Click the **"INVITE"** button in the Actions column
3. The system will:
   - Generate a secure invitation token
   - Send a branded email to the user
   - Update the "INVITED" column with the sent date

**Who can receive invitations:**
- Users with status: `ACTIVE`
- Users who don't have a Logto account yet (logtoId is null)

**Button states:**
- **INVITE**: Ready to send invitation
- **SENDING...**: Invitation is being sent
- **LINKED**: User already has a Logto account
- **-**: Not eligible for invitation

### 5. Bulk Invitations

**Steps:**
1. Select multiple users by checking the checkboxes in the first column
2. Click **"SEND INVITATIONS"** in the bulk actions bar
3. Confirm the action
4. The system will send invitations to all selected users sequentially

**Features:**
- Select/deselect individual users
- Click the checkbox in the header row to select/deselect all users on the current page
- Counter shows how many users are selected
- **"CLEAR"** button to deselect all

**Rate Limiting:** The system adds a 500ms delay between each invitation to avoid overwhelming the email service.

### 6. Table Columns

| Column | Description |
|--------|-------------|
| **Checkbox** | Select for bulk actions |
| **NAME** | User's full name from waitlist submission |
| **EMAIL** | User's email address |
| **COMPANY** | Company name (if provided) |
| **INTERESTS** | Bridge services they're interested in (COMPASS, LEDGER, SHIELD, SONAR) |
| **STATUS** | Current status (ACTIVE/CONVERTED/INACTIVE) |
| **SUBMITTED** | Date they joined the waitlist |
| **INVITED** | Date invitation was sent (shows EXPIRED if past 7 days) |
| **ACTIONS** | Button to send invitation |

### 7. Pagination

Navigate through pages using:
- **PREV**: Go to previous page
- **NEXT**: Go to next page
- Page indicator shows current page and total pages

Default: 50 entries per page

## API Endpoints Used

### GET /api/admin/waitlist

Fetches waitlist entries with pagination and filtering.

**Query Parameters:**
- `status`: Filter by status (ALL, ACTIVE, CONVERTED, INACTIVE)
- `search`: Search term
- `page`: Page number (default: 1)
- `limit`: Entries per page (default: 50)

**Response:**
```json
{
  "entries": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  },
  "stats": {
    "ACTIVE": 100,
    "CONVERTED": 40,
    "INACTIVE": 10
  }
}
```

### POST /api/waitlist/invite

Sends an invitation to a specific email address.

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
  "invitationToken": "abc123...",
  "expiresAt": "2026-02-02T12:00:00Z"
}
```

## Email Template

When you send an invitation, users receive a branded email with:

- KAPTN bridge system branding
- Personalized greeting with their name
- Secure invitation link
- Authorization code preview (first 8 characters)
- 7-day expiration notice
- Clear call-to-action button: "ASSUME COMMAND"

**Email From:** `KAPTN <onboarding@kaptn.ai>` (configurable via `EMAIL_FROM` env var)
**Subject:** "Your KAPTN Bridge Access Invitation"

## Invitation Flow

1. **Admin sends invitation** → Token generated, email sent
2. **User clicks link** → Lands on `/invite/{token}` page
3. **Token verified** → Page checks if valid and not expired
4. **Redirect to Logto** → User creates their own password
5. **Account linked** → System connects Logto account to waitlist entry
6. **Status updated** → Entry marked as CONVERTED

## Security & Authentication

### Admin Access Control

Currently, the admin panel requires Logto authentication but doesn't check for specific admin roles.

**⚠️ IMPORTANT for Production:**

You should add role-based access control:

```typescript
// In /app/api/admin/waitlist/route.ts
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';

export async function GET(request: NextRequest) {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add role check
  const isAdmin = claims?.roles?.includes('admin') ||
                  claims?.email === 'admin@kaptn.ai';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... rest of the code
}
```

**Recommended approach:**
1. Create an `Admin` model in Prisma (already exists in schema)
2. Check if the authenticated user's email exists in the Admin table
3. Check their role (SUPER_ADMIN, ADMIN, VIEWER)
4. Restrict actions based on role

### Invitation Token Security

- **Length**: 64-character hex tokens (256-bit security)
- **Uniqueness**: Database constraint ensures no duplicates
- **Expiration**: 7 days from generation
- **One-time use**: Marked as CONVERTED after successful use
- **Secure transmission**: HTTPS required in production

## Troubleshooting

### "Unauthorized" error
- You're not signed in with Logto
- Solution: You'll be redirected to sign-in automatically

### Invitation email not received
- Check Resend API key is configured
- Verify email is spelled correctly
- Check spam folder
- Check Vercel logs for error messages

### "Failed to send invitation" error
- Resend API rate limit reached
- Invalid Resend API key
- Check browser console for details

### User shows as "LINKED" but can't see their data
- User may have signed up directly without using invitation
- Email matching will auto-link on next sign-in

### Expired invitations
- Invitations expire after 7 days
- Send a new invitation to the same email
- System will generate a new token

## Keyboard Shortcuts

- **Enter**: Execute search
- **Escape**: Clear search (when focused on search input)

## Best Practices

1. **Filter before bulk actions**: Use status filter to show only ACTIVE users before selecting all
2. **Check invitation status**: Look at the "INVITED" column to avoid re-inviting recently invited users
3. **Monitor conversions**: Regularly check CONVERTED status to measure invitation success rate
4. **Batch invitations**: Select 10-20 users at a time to avoid email service rate limits
5. **Search before invite**: Search for a user's email to check if they've already been invited

## Future Enhancements

Consider adding:
- **Resend invitation button** for expired invitations
- **Export to CSV** functionality
- **Invitation history** log
- **Automatic invitation scheduling**
- **Custom email templates** per user segment
- **Analytics dashboard** with conversion rates
- **Role-based permissions** (read-only vs full access)
- **Webhook integration** for external systems

## Related Documentation

- [Invitation Flow](./INVITATION_FLOW.md) - Technical documentation
- [Prisma + Logto Setup](./PRISMA_LOGTO_SETUP_GUIDE.md) - Database and auth setup
- [User Journey Database](./USER_JOURNEY_DATABASE.md) - Data model overview
