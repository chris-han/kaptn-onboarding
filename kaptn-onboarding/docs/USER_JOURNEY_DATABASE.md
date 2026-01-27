# KAPTN User Journey & Database Architecture

## Overview

This document explains the complete user journey from onboarding to authentication, and how data flows through the database.

## Key Feature: Integrated Logto Signup

**NEW**: Logto authentication is now integrated directly into the onboarding flow. When users submit the waitlist form, they are immediately redirected to create their account via Logto, with their User record automatically linked to their authentication.

**Flow Summary**:
1. User completes scenarios (anonymous)
2. User submits waitlist form → **User + WaitlistEntry created**
3. Immediate redirect to Logto signup → **logtoId linked to User**
4. User returns authenticated → Complete profile & download badge

**Benefits**:
- Seamless transition from onboarding to authentication
- No email verification required upfront
- User records are created before authentication
- Single continuous flow instead of multiple disconnected steps

## Database Schema

### Core Tables

#### 1. User (Identity Table)
```prisma
model User {
  id            String    @id @default(cuid())  // e.g., "clxxxxx" or temp UUID
  logtoId       String?   @unique               // Linked after signup
  email         String?   @unique
  name          String?
  avatar        String?
  createdAt     DateTime  @default(now())

  // Relations
  profile       UserProfile?
  badge         Badge?
  waitlistEntry WaitlistEntry?
}
```

**Purpose**: Central identity record for all users (authenticated or anonymous)

#### 2. UserProfile (Onboarding Data)
```prisma
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique

  // KAPTN Decision Patterns (K-A-P-T-N)
  knowledgePattern     String  // "ACTIVE_EXPLORER" | "SELECTIVE_SCANNER" | "MISSION_FILTER"
  thesisPattern        String  // "RAPID_UPDATER" | "DATA_ANCHOR" | "COMPLEXITY_HOLDER"
  prioritizePattern    String  // "FOCUSED_NAVIGATOR" | "PARALLEL_PROCESSOR" | "DELIBERATE_STRATEGIST"
  actionPattern        String  // "MOMENTUM_DRIVER" | "COMPLETENESS_SEEKER" | "PROGRESSIVE_BUILDER"
  navigationPattern    String  // "QUICK_RECALIBRATOR" | "DEEP_QUESTIONER" | "ADAPTIVE_CLAIMER"

  captainName          String?
  onboardingCompleted  Boolean  @default(false)
  completedAt          DateTime?
  scenarioResponses    Json     // Full scenario choices
}
```

**Purpose**: Stores personality patterns from onboarding scenarios

#### 3. Badge (Certificate/Ensignia)
```prisma
model Badge {
  id             String   @id @default(cuid())
  userId         String   @unique
  serialNumber   String   @unique          // Last 8 chars of userId (uppercase)
  captainName    String?
  issuedAt       DateTime @default(now())
  downloadCount  Int      @default(0)
  lastDownloadAt DateTime?
}
```

**Purpose**: Digital badge issued after onboarding
- Serial Number: Derived from `userId.slice(-8).toUpperCase()`
- Example: userId `clxxxxx47f47006` → SN `47F47006`

#### 4. WaitlistEntry (Marketing)
```prisma
model WaitlistEntry {
  id          String   @id @default(cuid())
  userId      String   @unique
  name        String
  email       String   @unique
  company     String?
  interests   String[]  // ["compass", "ledger", "shield", "sonar"]
  status      WaitlistStatus @default(ACTIVE)
  submittedAt DateTime @default(now())
  convertedAt DateTime?
}
```

**Purpose**: Tracks users who joined waitlist and their interests

---

## Complete User Journey

### Phase 1: Onboarding Start
```
User visits → /[locale]/onboarding
              ↓
        Complete interactive scenarios
              ↓
        Determine decision patterns
```

**No User record created yet** - User is still anonymous during scenarios

### Phase 2: Waitlist Registration
```
User completes scenarios
              ↓
        Reaches waitlist form
              ↓
        Enters: name, email, company, interests
              ↓
        Call POST /api/waitlist
              ↓
        Create User + WaitlistEntry records
              ↓
        Return userId
              ↓
        Redirect to Logto signup with userId
```

**API Endpoint**: `POST /api/waitlist`
```json
Request:
{
  "name": "KAI HAN",
  "email": "kai@example.com",
  "company": "ACME Corp",
  "interests": ["compass", "ledger"]
}

Response:
{
  "success": true,
  "userId": "clxxxxx47f47006",
  "message": "Registration received. Proceeding to account creation."
}
```

**Database Operations**:
1. Create User record with email and name
2. Create WaitlistEntry record with interests
3. Return userId for Logto linking

### Phase 3: Logto Signup (Integrated)
```
Frontend redirects to /api/logto/sign-in?state={userId}
              ↓
        Store userId in cookie (logto_link_user_id)
              ↓
        Redirect to Logto authentication
              ↓
        User creates account / signs in
              ↓
        Callback: /api/logto/callback
              ↓
        Read userId from cookie
              ↓
        Link logtoId to existing User record
              ↓
        Redirect to /onboarding (authenticated)
```

**Key Change**: Instead of creating a new User, we link the Logto account to the existing User record created during waitlist registration.

**API Flow**:
1. `GET /api/logto/sign-in?state={userId}` - Store userId in cookie, start OAuth
2. User authenticates at Logto
3. `GET /api/logto/callback` - Read userId from cookie, link logtoId to User
4. Clear cookies, redirect to app

### Phase 4: Profile Completion (After Authentication)
```
User returns to onboarding (now authenticated)
              ↓
        Complete remaining onboarding steps
              ↓
        Call POST /api/profile
              ↓
        Create UserProfile record
```

**API Endpoint**: `POST /api/profile`
```json
{
  "userId": "clxxxxx...",
  "captainName": "KAI HAN",
  "knowledgePattern": "ACTIVE_EXPLORER",
  "thesisPattern": "RAPID_UPDATER",
  "prioritizePattern": "FOCUSED_NAVIGATOR",
  "actionPattern": "MOMENTUM_DRIVER",
  "navigationPattern": "QUICK_RECALIBRATOR",
  "scenarioResponses": [...]
}
```

### Phase 5: Badge Download
```
User clicks "Download Badge"
              ↓
        Generate PNG with Canvas API
              ↓
        Call POST /api/badge
              ↓
        Create Badge record
              ↓
        Badge includes QR code → /[locale]/userinfo/[userId]
```

**API Endpoint**: `POST /api/badge`
- Creates Badge record with serial number
- Serial number = last 8 chars of userId (uppercase)
- QR code points to: `https://www.kaptn.ai/[locale]/userinfo/[userId]`

### Phase 6: QR Code Scan (Optional - Marketing)
```
User scans QR code from badge
              ↓
        Navigate to /[locale]/userinfo/[userId]
              ↓
        Call GET /api/userinfo/[userId]
              ↓
        Fetch User + Profile + Badge from DB
              ↓
        Display badge + profile + "Create Account" button
```

**API Endpoint**: `GET /api/userinfo/[userId]`
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    badge: true,
    waitlistEntry: true
  }
})
```

**Page**: `/[locale]/userinfo/[userId]/page.tsx`
- Shows badge with ensignia
- Shows command profile (5 patterns)
- Shows "Create Account" button → Logto signup (if not authenticated)
- Can be used for marketing/sharing badges

### Phase 7: Login & Return User
```
User logs in (future visits)
              ↓
        Authenticate with Logto
              ↓
        Call GET /api/logto/user
              ↓
        Find User by logtoId
              ↓
        Return full user profile
```

**API Endpoint**: `GET /api/logto/user`
```typescript
const user = await prisma.user.findUnique({
  where: { logtoId: claims.sub },
  include: {
    profile: true,
    badge: true,
    waitlistEntry: true
  }
})
```

---

## Database Migration

The initial migration is already created at:
`prisma/migrations/20260121125029_init/migration.sql`

To apply migrations to a new database:

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# (Development) Create new migration
pnpm prisma migrate dev --name <migration_name>
```

---

## Configuration

### Environment Variables

**Production (Prisma Accelerate)**:
```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

**Local Development**:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/kaptn"
```

### Prisma Client Initialization

The client is configured in `lib/prisma.ts`:

- **Accelerate URL** (`prisma+postgres://`): Uses Prisma Accelerate with connection pooling
- **Standard URL** (`postgresql://`): Uses direct binary engine connection

Prisma v7 requires `datasourceUrl` parameter for Accelerate:

```typescript
const baseClient = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // Required for Accelerate
  log: ['error']
});
prisma = baseClient.$extends(withAccelerate());
```

---

## Data Relationships

```
User (1) ──┬── (1) UserProfile
           ├── (1) Badge
           ├── (1) WaitlistEntry
           └── (N) JourneyEvent
```

All child records cascade on User deletion:
```prisma
relation(..., onDelete: Cascade)
```

---

## Analytics & Tracking

### JourneyEvent Table
```prisma
model JourneyEvent {
  id        String   @id @default(cuid())
  userId    String?  // Optional (for anonymous tracking)
  sessionId String   // Tracks sessions before user creation
  eventType EventType
  phase     String   // "entrance", "scenario", "oath", etc.
  metadata  Json?
  timestamp DateTime @default(now())
}
```

**Purpose**: Track user behavior through onboarding funnel

### DailyStats Table
```prisma
model DailyStats {
  date               DateTime @unique
  entranceCount      Int
  scenariosCompleted Int
  waitlistJoined     Int
  profilesCreated    Int
  badgesIssued       Int
  // Conversion rates
  entranceToWaitlist Float?
  overallConversion  Float?
}
```

**Purpose**: Aggregated daily metrics for funnel analysis

---

## Error Handling

All API endpoints implement fallback behavior when database is unavailable:

1. **GET /api/user-id**: Returns `temp-{uuid}` temporary ID
2. **POST /api/profile**: Returns success without persisting
3. **POST /api/badge**: Returns temporary badge object
4. **GET /api/userinfo/[userId]**: Returns 404 if user not found

This ensures the onboarding flow never breaks, even during database outages.

---

## Serial Number System

Serial numbers are derived from the user ID:

```typescript
const serialNumber = userId.slice(-8).toUpperCase();
// userId: "clxxxxx47f47006" → serialNumber: "47F47006"
// userId: "temp-eca7df9d3114388e48ee793e47f47006" → serialNumber: "47F47006"
```

This creates unique 8-character alphanumeric identifiers that appear on the badge.

---

## Next Steps

1. ✅ Database schema designed and migrated
2. ✅ User journey implemented (onboarding → badge → QR → userinfo)
3. ✅ Prisma v7 + Accelerate configuration fixed
4. 🔄 Deploy and verify database connectivity
5. 📊 Implement analytics tracking (JourneyEvent)
6. 🔐 Complete Logto integration (link logtoId on signup)
