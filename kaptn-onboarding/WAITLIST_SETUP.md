# KAPTN Enterprise Bridge Waitlist - Setup Guide

## Overview

The onboarding game now includes a **waitlist registration phase** that appears after the Captain's Oath. This allows users to express interest in the KAPTN Enterprise Bridge services before they officially launch.

---

## The Five Bridge Services

### 1. **COMPASS** - Intelligence & Decision Support
- Real-time AI assistant
- 24/7 business intelligence
- Decision clarity system
- **Protocols:** K (Knowledge) + T (Thesis)

### 2. **GENESIS** - Entity Formation
- China business launch
- Complete entity formation
- Compliance handling
- **Protocols:** P (Prioritize) + A (Action)

### 3. **LEDGER** - Financial Operations
- Professional bookkeeping
- Monthly reconciliation
- Financial clarity & insights
- **Protocols:** K (Knowledge) + N (Navigation)

### 4. **SHIELD** - Tax Compliance
- Tax preparation & filing
- Deduction optimization
- Compliance protection
- **Protocols:** P (Prioritize) + N (Navigation)

### 5. **ORACLE** - Analytics & Intelligence
- Business data analytics
- Ad performance tracking
- Trend identification
- **Protocols:** T (Thesis) + P (Prioritize)

---

## SendGrid Integration

### Why SendGrid?

- Reliable email delivery
- Professional email infrastructure
- Easy integration
- Detailed delivery tracking

### Setup Steps

#### 1. Get Your SendGrid API Key

If you don't have one yet:
1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for free account (100 emails/day free tier)
3. Navigate to Settings > API Keys
4. Create new API key with "Mail Send" permissions
5. Copy the key (starts with `SG.`)

#### 2. Configure Environment Variables

Update `.env.local`:
```bash
SENDGRID_API_KEY=your_actual_key_here
RECIPIENT_EMAIL=your-email@example.com
```

**Important:** 
- Never commit `.env.local` to version control
- The provided key in code is a placeholder
- Replace with your own key before deployment

#### 3. Verify Email Sender

For production:
1. In SendGrid, go to Settings > Sender Authentication
2. Authenticate your domain OR
3. Verify a single sender email address
4. Update the `from` email in `/app/api/waitlist/route.ts`

---

## How It Works

### User Flow

1. User completes 5 decision scenarios
2. User takes the Captain's Oath
3. **Waitlist screen appears**
4. User sees 5 bridge services
5. User selects services of interest
6. User enters: name, email, company (optional)
7. User submits or skips
8. Continues to processing phase

### What Happens on Submit

1. **Frontend validation** - Checks required fields
2. **API call** to `/api/waitlist`
3. **Email sent via SendGrid** to configured recipient
4. **Success confirmation** shown to user
5. **Auto-continue** to next phase after 3 seconds

### Email Format

You receive an email with:
- Captain's name, email, company
- Selected services of interest
- Onboarding completion status
- Formatted in bridge system style
- Both plain text and HTML versions

---

## Customization

### Change Recipient Email

In `.env.local`:
```bash
RECIPIENT_EMAIL=sales@kaptn.ai
```

### Modify Email Template

Edit `/app/api/waitlist/route.ts`:

```typescript
const emailContent = {
  // ... customize subject, from, content
}
```

### Add More Services

Edit `/types/waitlist.ts`:

```typescript
export const bridgeServices = [
  // ... add new service objects
]
```

### Customize Waitlist UI

Edit `/components/Waitlist.tsx` to modify:
- Form fields
- Service grid layout
- Colors and styling
- Button behavior

---

## Testing

### Local Testing

1. Start development server:
```bash
npm run dev
```

2. Complete onboarding flow to oath phase

3. Check console for any errors

4. Verify email arrival in recipient inbox

### Test Email Content

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Captain",
    "company": "Test Venture",
    "interests": ["compass", "oracle"]
  }'
```

---

## Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```
SENDGRID_API_KEY=your_production_key
RECIPIENT_EMAIL=production@kaptn.ai
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### SendGrid Domain Authentication

For production, authenticate your domain:
1. In SendGrid: Settings > Sender Authentication > Authenticate Domain
2. Add DNS records to your domain
3. Verify authentication
4. Update `from` email in API route

---

## Monitoring & Analytics

### Track Registrations

Monitor these metrics:
- Total waitlist signups
- Service interest distribution
- Completion rate (oath → waitlist)
- Skip rate

### SendGrid Dashboard

View in SendGrid:
- Email delivery rate
- Open rate (if tracking enabled)
- Bounce rate
- Spam reports

### Add Database Storage (Optional)

Currently emails go to your inbox. To store in database:

1. Set up database (PostgreSQL, MongoDB, etc.)
2. Modify `/app/api/waitlist/route.ts`
3. Add database write before/after email send
4. Build admin dashboard to view registrations

---

## Troubleshooting

### Email Not Arriving

**Check:**
- SendGrid API key is correct
- Recipient email is verified
- No typos in email address
- Check spam folder
- Review SendGrid activity feed

### API Errors

**Common issues:**
- Missing environment variables
- Invalid SendGrid API key
- Network/CORS issues
- Rate limiting (free tier: 100 emails/day)

### Rate Limiting

SendGrid free tier limits:
- 100 emails/day
- Consider upgrading for production
- Implement queueing for high volume

---

## Security Best Practices

1. **Never expose API keys**
   - Use environment variables
   - Don't commit `.env.local`
   - Rotate keys periodically

2. **Validate input**
   - Email format validation (done)
   - Rate limiting per IP (consider adding)
   - Spam protection (consider adding)

3. **Sanitize data**
   - Escape HTML in emails (done)
   - Validate company name length
   - Prevent injection attacks

---

## Future Enhancements

### Immediate Priorities

- [ ] Add database storage
- [ ] Build admin dashboard
- [ ] Add confirmation email to user
- [ ] Implement drip campaign

### Nice-to-Have

- [ ] A/B test different service descriptions
- [ ] Track service interest patterns
- [ ] Add referral mechanism
- [ ] Create waitlist leaderboard

---

## Support

For issues:
1. Check SendGrid status page
2. Review API logs in Vercel/hosting platform
3. Test with curl command
4. Verify environment variables

---

## Bridge System Naming Convention

All services follow bridge culture:
- Single word names
- Action-oriented
- Mission-clear
- Professional
- Internationally clear

**Format:** `[SYSTEM NAME] - [Function]`

Example:
```
COMPASS - Intelligence & Decision Support
Status: Online
Protocols: K • T
```

---

**"The unknown awaits."**
