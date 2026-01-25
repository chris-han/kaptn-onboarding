# Prisma 7 + Logto User Management System
## Complete Setup Guide for Next.js Projects

This document provides a production-ready setup for user authentication and management using Prisma 7 and Logto, designed to be reused across multiple projects in the KAPTN ecosystem.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [Prisma 7 Setup](#prisma-7-setup)
4. [Database Schema](#database-schema)
5. [Logto Integration](#logto-integration)
6. [API Routes](#api-routes)
7. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
8. [Migration Checklist](#migration-checklist)

---

## Architecture Overview

### Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: Logto Cloud
- **Connection Pooling**: Prisma Accelerate (production) / PrismaPg adapter (local)

### Key Features
- Single Sign-On (SSO) across KAPTN ecosystem
- Email-based user linking
- Graceful fallback when database is unavailable
- Support for multiple auth providers (Logto, Google, WeChat)
- Anonymous user tracking with conversion to authenticated users

### User Flow
```
1. User visits app → Anonymous user created (optional)
2. User registers/signs in → Logto authentication
3. Callback links Logto account to existing user by email (if exists)
4. User profile synced across ecosystem
```

---

## Environment Configuration

### Development (.env.local)

```bash
# Database - Local PostgreSQL via Docker
DATABASE_URL="postgresql://kaptn_admin:kaptn_dev_2024@localhost:15432/pg_kaptn?schema=public"

# Logto Authentication
LOGTO_ENDPOINT="https://your-tenant.logto.app"
LOGTO_APP_ID="your_app_id"
LOGTO_APP_SECRET="your_app_secret"
LOGTO_COOKIE_SECRET="your_random_32_char_secret"

# App Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Production (.env.production)

```bash
# Database - Prisma Accelerate or Direct Connection
# Option 1: Prisma Accelerate (recommended for serverless)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"

# Option 2: Direct connection with pooling
DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=verify-full&pool=true"

# Logto Authentication (same credentials, different domain)
LOGTO_ENDPOINT="https://your-tenant.logto.app"
LOGTO_APP_ID="your_production_app_id"
LOGTO_APP_SECRET="your_production_app_secret"
LOGTO_COOKIE_SECRET="your_production_random_secret"

# App Configuration
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Docker Setup (Local Development)

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pg_kaptn
    restart: unless-stopped
    environment:
      POSTGRES_USER: kaptn_admin
      POSTGRES_PASSWORD: kaptn_dev_2024
      POSTGRES_DB: pg_kaptn
    ports:
      - "15432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kaptn_admin -d pg_kaptn"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**Start Database:**
```bash
docker-compose up -d
```

---

## Prisma 7 Setup

### 1. Install Dependencies

```bash
# Using bun (preferred)
bun add @prisma/client @prisma/adapter-pg pg
bun add -D prisma

# Using pnpm
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add -D prisma
```

### 2. Initialize Prisma

```bash
bunx prisma init
```

### 3. Create Prisma Client Singleton

**lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Check if DATABASE_URL is configured
const databaseUrl = process.env.DATABASE_URL?.trim().replace(/\\n/g, '').replace(/\n/g, '');
const isDatabaseConfigured = !!databaseUrl;
const isAccelerateUrl = databaseUrl?.startsWith('prisma+postgres://');

let prisma: any = null;

if (isDatabaseConfigured) {
  try {
    console.log('[Prisma] Initializing client...', {
      isAccelerateUrl,
      urlPreview: databaseUrl?.substring(0, 50) + '...',
      nodeEnv: process.env.NODE_ENV,
    });

    if (isAccelerateUrl) {
      // Production: Prisma Accelerate (serverless-optimized)
      prisma = new PrismaClient({
        accelerateUrl: databaseUrl,
        log: ['query', 'error', 'warn', 'info'],
      });
      console.log('[Prisma] Accelerate client initialized');
    } else {
      // Development: PostgreSQL adapter
      if (!globalForPrisma.prisma) {
        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        prisma = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });

        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prisma;
        }
        console.log('[Prisma] PostgreSQL adapter client initialized');
      } else {
        prisma = globalForPrisma.prisma;
        console.log('[Prisma] Reusing existing client');
      }
    }
  } catch (error) {
    console.error('[Prisma] Initialization failed:', error);
    prisma = null;
  }
} else {
  console.warn('[Prisma] DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
```

**Key Points:**
- ✅ Uses `PrismaPg` adapter for local PostgreSQL (Prisma 7 requirement)
- ✅ Uses `accelerateUrl` parameter for Prisma Accelerate (Prisma 7 syntax)
- ✅ Singleton pattern prevents multiple instances in development
- ✅ Graceful degradation when DATABASE_URL is missing
- ✅ Connection pooling handled by adapter

### 4. Prisma Schema

**prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// User Model - Core identity across ecosystem
model User {
  id            String    @id @default(cuid())

  // Authentication providers
  logtoId       String?   @unique  // Logto SSO
  googleId      String?   @unique  // Google OAuth
  wechatOpenId  String?   @unique  // WeChat
  wechatUnionId String?   @unique  // WeChat UnionID

  // Profile
  email         String?   @unique
  emailVerified Boolean   @default(false)
  name          String?
  avatar        String?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  waitlistEntry WaitlistEntry?
  profile       UserProfile?
  badge         Badge?
  journeyEvents JourneyEvent[]

  @@index([email])
  @@index([logtoId])
  @@index([createdAt])
}

// Add your app-specific models here...
```

### 5. Generate Prisma Client

```bash
bunx prisma generate
```

### 6. Create and Run Migrations

```bash
# Create migration
bunx prisma migrate dev --name init

# Deploy to production
bunx prisma migrate deploy
```

---

## Logto Integration

### 1. Install Logto SDK

```bash
bun add @logto/next
```

### 2. Configure Logto Console (CRITICAL!)

Before writing any code, you MUST configure redirect URIs in the Logto console:

**Go to:** https://cloud.logto.io/ → Applications → Your App

**Add these Redirect URIs:**
```
http://localhost:3000/api/logto/callback
https://www.kaptn.ai/api/logto/callback
```
(Replace `www.kaptn.ai` with your production domain)

**Add these Post Sign-Out Redirect URIs:**
```
http://localhost:3000
https://www.kaptn.ai
```

**⚠️ IMPORTANT:** If you skip this step, you'll get error: `"redirect_uri did not match any of the client's registered redirect_uris"`

For detailed instructions, see: [LOGTO_REDIRECT_URI_SETUP.md](./LOGTO_REDIRECT_URI_SETUP.md)

### 3. Logto Configuration

**lib/logto.ts**

```typescript
import { LogtoNextConfig } from '@logto/next';

// Validate required environment variables
const requiredEnvVars = {
  LOGTO_ENDPOINT: process.env.LOGTO_ENDPOINT,
  LOGTO_APP_ID: process.env.LOGTO_APP_ID,
  LOGTO_APP_SECRET: process.env.LOGTO_APP_SECRET,
  LOGTO_COOKIE_SECRET: process.env.LOGTO_COOKIE_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(`[Logto] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[Logto] Please check your .env file');
}

// Construct base URL with fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

console.log('[Logto] Configuration:', {
  endpoint: process.env.LOGTO_ENDPOINT,
  appId: process.env.LOGTO_APP_ID,
  baseUrl,
  callbackUrl: `${baseUrl}/api/logto/callback`,
  environment: process.env.NODE_ENV,
});

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  baseUrl,
  cookieSecure: process.env.NODE_ENV === 'production',
  resources: [],
  scopes: ['email', 'profile', 'openid'],
};
```

### 3. API Routes

#### Sign In Route

**app/api/logto/sign-in/route.ts**

```typescript
import { signIn } from '@logto/next/server-actions';
import { NextRequest } from 'next/server';
import { logtoConfig } from '@/lib/logto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postRedirectUri = searchParams.get('redirectTo') || '/';
  const userId = searchParams.get('state'); // For linking existing users

  const cookieStore = cookies();

  // Store redirect URI
  cookieStore.set('logto_post_redirect_uri', postRedirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  // Store userId for linking (if provided)
  if (userId) {
    cookieStore.set('logto_link_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });
  }

  await signIn(logtoConfig, `${logtoConfig.baseUrl}/api/logto/callback`);
}
```

#### Callback Route (Critical - Prevents Duplicates)

**app/api/logto/callback/route.ts**

```typescript
import { getLogtoContext } from '@logto/next/server-actions';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { claims } = await getLogtoContext(logtoConfig);
    const cookieStore = cookies();

    if (claims?.sub && isDatabaseConfigured && prisma) {
      try {
        const linkUserId = cookieStore.get('logto_link_user_id')?.value;

        if (linkUserId) {
          // FLOW 1: Link to existing user (from waitlist or previous registration)
          const existingUser = await prisma.user.findUnique({
            where: { id: linkUserId },
          });

          if (existingUser && !existingUser.logtoId) {
            await prisma.user.update({
              where: { id: linkUserId },
              data: {
                logtoId: claims.sub,
                email: claims.email ? claims.email.toLowerCase() : existingUser.email,
                emailVerified: claims.email_verified || existingUser.emailVerified,
                name: claims.name || claims.username || existingUser.name,
              },
            });
            console.log(`Linked Logto account ${claims.sub} to existing user ${linkUserId}`);
          } else if (existingUser?.logtoId === claims.sub) {
            // Already linked, just update
            await prisma.user.update({
              where: { id: linkUserId },
              data: {
                email: claims.email ? claims.email.toLowerCase() : existingUser.email,
                emailVerified: claims.email_verified || existingUser.emailVerified,
                name: claims.name || claims.username || existingUser.name,
              },
            });
          }

          cookieStore.delete('logto_link_user_id');
        } else {
          // FLOW 2: Standard sign-in/sign-up
          let user = await prisma.user.findUnique({
            where: { logtoId: claims.sub },
          });

          if (!user && claims.email) {
            // CRITICAL: Check for existing user by email to prevent duplicates
            const emailUser = await prisma.user.findUnique({
              where: { email: claims.email.toLowerCase() },
            });

            if (emailUser && !emailUser.logtoId) {
              // Auto-link via email
              user = await prisma.user.update({
                where: { id: emailUser.id },
                data: {
                  logtoId: claims.sub,
                  email: claims.email.toLowerCase(),
                  emailVerified: claims.email_verified || emailUser.emailVerified,
                  name: claims.name || claims.username || emailUser.name,
                },
              });
              console.log(`Auto-linked Logto account ${claims.sub} to user ${emailUser.id} via email`);
            }
          }

          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                logtoId: claims.sub,
                email: claims.email ? claims.email.toLowerCase() : null,
                emailVerified: claims.email_verified || false,
                name: claims.name || claims.username || null,
              },
            });
            console.log(`Created new user ${user.id} for Logto account ${claims.sub}`);
          } else {
            // Update existing user
            user = await prisma.user.update({
              where: { logtoId: claims.sub },
              data: {
                email: claims.email ? claims.email.toLowerCase() : user.email,
                emailVerified: claims.email_verified || user.emailVerified,
                name: claims.name || claims.username || user.name,
              },
            });
          }
        }
      } catch (dbError) {
        console.error('Error syncing user with database:', dbError);
      }
    }

    const postRedirectUri = cookieStore.get('logto_post_redirect_uri')?.value || '/';
    cookieStore.delete('logto_post_redirect_uri');
    cookieStore.delete('logto_link_user_id');

    redirect(postRedirectUri);
  } catch (error) {
    console.error('Logto callback error:', error);
    redirect('/?error=auth_failed');
  }
}
```

#### Sign Out Route

**app/api/logto/sign-out/route.ts**

```typescript
import { signOut } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';

export const dynamic = 'force-dynamic';

export async function GET() {
  await signOut(logtoConfig, `${logtoConfig.baseUrl}/`);
}
```

#### Get User Route

**app/api/logto/user/route.ts**

```typescript
import { getLogtoContext } from '@logto/next/server-actions';
import { NextRequest, NextResponse } from 'next/server';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated || !claims?.sub) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    if (!isDatabaseConfigured || !prisma) {
      return NextResponse.json({
        authenticated: true,
        user: null,
        claims,
        temporary: true,
      });
    }

    const user = await prisma.user.findUnique({
      where: { logtoId: claims.sub },
      include: {
        profile: true,
        badge: true,
        waitlistEntry: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: user || null,
      claims,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', authenticated: false },
      { status: 500 }
    );
  }
}
```

### 4. React Hook for Auth

**hooks/useAuth.ts**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  logtoId: string;
}

interface AuthState {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('/api/logto/user');
      const data = await response.json();

      setAuthState({
        authenticated: data.authenticated,
        user: data.user,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching auth status:', error);
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const signIn = (redirectTo?: string) => {
    const url = redirectTo
      ? `/api/logto/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/api/logto/sign-in';
    window.location.href = url;
  };

  const signOut = () => {
    window.location.href = '/api/logto/sign-out';
  };

  return {
    ...authState,
    signIn,
    signOut,
    refresh: fetchAuthStatus,
  };
}
```

---

## Common Pitfalls & Solutions

### 1. ❌ Prisma 7 Initialization Error

**Error:**
```
PrismaClientInitializationError: `PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions`
```

**Solution:**
Use the adapter for PostgreSQL connections:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### 2. ❌ Wrong Prisma 7 Accelerate Syntax

**Error:**
```
PrismaClientConstructorValidationError: Unknown property datasources provided to PrismaClient constructor
```

**Old (Prisma 5/6):**
```typescript
new PrismaClient({
  datasources: {
    db: { url: accelerateUrl }
  }
})
```

**New (Prisma 7):**
```typescript
new PrismaClient({
  accelerateUrl: accelerateUrl
})
```

### 3. ❌ Duplicate User Creation

**Problem:** Every user login creates a new User record.

**Root Cause:** Not checking for existing users by email before creating.

**Solution:** See callback route above - always check by email first!

### 4. ❌ SSL Mode Warnings

**Warning:**
```
SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'
```

**Solution:**
```bash
# Change from:
DATABASE_URL="...?sslmode=require"

# To:
DATABASE_URL="...?sslmode=verify-full"
```

### 5. ❌ Email Case Sensitivity

**Problem:** User can't sign in because `user@email.com` ≠ `User@Email.com`

**Solution:** Always normalize to lowercase:
```typescript
email: claims.email ? claims.email.toLowerCase() : null
```

### 6. ❌ Missing userId Prop Causes Duplicates

**Problem:** Component creates anonymous user even though user already exists.

**Solution:** Always pass userId through component props:
```typescript
// Parent
const [userId, setUserId] = useState('');
<ChildComponent userId={userId} />

// Child
interface Props {
  userId?: string;
}
function ChildComponent({ userId: initialUserId }: Props) {
  const [userId, setUserId] = useState(initialUserId || null);

  // Only fetch as fallback
  if (!userId) {
    // fetch user ID
  }
}
```

---

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:push": "prisma db push",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate"
  }
}
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create Logto account and application
- [ ] Set up PostgreSQL database (local + production)
- [ ] Install dependencies (`@prisma/client`, `@prisma/adapter-pg`, `pg`, `@logto/next`)
- [ ] Configure environment variables

### Phase 2: Database
- [ ] Create `lib/prisma.ts` with adapter logic
- [ ] Define `prisma/schema.prisma` with User model
- [ ] Run `bunx prisma generate`
- [ ] Run `bunx prisma migrate dev --name init`
- [ ] Verify connection: `bunx prisma studio`

### Phase 3: Authentication
- [ ] **Configure Logto Console redirect URIs** (CRITICAL - see [LOGTO_REDIRECT_URI_SETUP.md](./LOGTO_REDIRECT_URI_SETUP.md))
  - [ ] Add `http://localhost:3000/api/logto/callback`
  - [ ] Add `https://your-domain.com/api/logto/callback`
  - [ ] Add post sign-out URIs
- [ ] Create `lib/logto.ts` config
- [ ] Implement `/api/logto/sign-in` route
- [ ] Implement `/api/logto/callback` route (with email linking!)
- [ ] Implement `/api/logto/sign-out` route
- [ ] Implement `/api/logto/user` route
- [ ] Create `hooks/useAuth.ts`

### Phase 4: Testing
- [ ] Test new user sign-up
- [ ] Test email-based linking (create user without Logto, then sign in)
- [ ] Test cookie-based linking (userId in state)
- [ ] Test sign-out
- [ ] Verify no duplicate users created

### Phase 5: Deployment
- [ ] Set up Prisma Accelerate (if using serverless)
- [ ] Configure production environment variables in Vercel/hosting
- [ ] Run `bunx prisma migrate deploy` in production
- [ ] Test production auth flow

---

## Cross-Ecosystem Integration

### Sharing Users Across Projects

All projects in the KAPTN ecosystem should use:

1. **Same Logto tenant** - Single sign-on across all apps
2. **Same User schema** - Consistent user model with `logtoId`
3. **Same database** (optional) - Share user table, or sync via API
4. **Email as unique identifier** - Always link by email

### Example: Project A → Project B

**Project A (this app):**
- User completes onboarding
- Gets `logtoId` + user profile

**Project B (new app):**
- User signs in with same Logto account
- Callback finds existing user by `logtoId`
- Loads existing profile from shared database
- ✅ Seamless experience!

### Shared Database Schema

All projects should include:
```prisma
model User {
  id            String    @id @default(cuid())
  logtoId       String?   @unique
  email         String?   @unique
  emailVerified Boolean   @default(false)
  name          String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Add app-specific relations below
}
```

---

## Troubleshooting

### Check Database Connection

```bash
DATABASE_URL="your-url" bunx prisma db execute --stdin <<'EOF'
SELECT current_database(), current_user;
EOF
```

### Check User Count

```bash
DATABASE_URL="your-url" bunx prisma db execute --stdin <<'EOF'
SELECT COUNT(*) FROM "User";
EOF
```

### Find Duplicate Users

```typescript
// Run in scripts/check-duplicates.ts
const duplicates = await prisma.user.groupBy({
  by: ['email'],
  _count: true,
  having: {
    email: { _count: { gt: 1 } }
  }
});
```

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Secure cookies** - `httpOnly: true`, `secure: true` in production
3. **Validate email format** before saving
4. **Rate limit** sign-in attempts
5. **Sanitize user input** (name, email)
6. **Never expose** `LOGTO_APP_SECRET` or `LOGTO_COOKIE_SECRET`
7. **Use environment variables** - never hardcode credentials

---

## Support & Resources

- **Prisma 7 Docs**: https://www.prisma.io/docs/orm/prisma-client
- **Logto Docs**: https://docs.logto.io/
- **Next.js Docs**: https://nextjs.org/docs
- **This Implementation**: `/home/chris/repo/KAPTN/kaptn-onboarding`

---

## Changelog

- **v1.0** - Initial setup guide (Jan 2026)
  - Prisma 7 with adapter support
  - Logto Cloud integration
  - Email-based user linking
  - Production-ready code patterns
