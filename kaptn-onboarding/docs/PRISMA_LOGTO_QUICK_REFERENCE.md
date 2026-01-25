# Prisma 7 + Logto Quick Reference

Quick commands and code snippets for daily development.

---

## Environment Setup

```bash
# .env.local
DATABASE_URL="postgresql://kaptn_admin:kaptn_dev_2024@localhost:15432/pg_kaptn?schema=public"
LOGTO_ENDPOINT="https://[tenant].logto.app"
LOGTO_APP_ID="[app_id]"
LOGTO_APP_SECRET="[secret]"
LOGTO_COOKIE_SECRET="[32_random_chars]"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Common Commands

```bash
# Database
docker-compose up -d                    # Start PostgreSQL
bunx prisma generate                    # Generate client
bunx prisma migrate dev                 # Create migration
bunx prisma migrate deploy              # Deploy to prod
bunx prisma studio                      # Open GUI
bunx prisma db push                     # Push schema (dev only)

# Development
bun run dev                             # Start Next.js
bun add @prisma/client @logto/next     # Add deps

# Production
DATABASE_URL="prod-url" bunx prisma migrate deploy
vercel env pull .env.production         # Get prod env vars
```

---

## Code Snippets

### Prisma Client (lib/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const isAccelerateUrl = databaseUrl?.startsWith('prisma+postgres://');

let prisma: PrismaClient;

if (isAccelerateUrl) {
  prisma = new PrismaClient({ accelerateUrl: databaseUrl });
} else {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

export { prisma };
```

### User Authentication Hook

```typescript
'use client';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logto/user')
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setLoading(false);
      });
  }, []);

  const signIn = () => window.location.href = '/api/logto/sign-in';
  const signOut = () => window.location.href = '/api/logto/sign-out';

  return { user, loading, signIn, signOut };
}
```

### Protected API Route

```typescript
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { NextResponse } from 'next/server';

export async function GET() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
  return NextResponse.json({ userId: claims.sub });
}
```

### Protected Page (Server Component)

```typescript
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);

  if (!isAuthenticated) {
    redirect('/api/logto/sign-in?redirectTo=/protected');
  }

  return <div>Protected Content</div>;
}
```

### User Lookup Patterns

```typescript
// By Logto ID
const user = await prisma.user.findUnique({
  where: { logtoId: 'logto_id_here' },
  include: { profile: true },
});

// By Email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Create User (from callback)
const user = await prisma.user.create({
  data: {
    logtoId: claims.sub,
    email: claims.email?.toLowerCase(),
    emailVerified: claims.email_verified || false,
    name: claims.name || claims.username,
  },
});

// Update User
await prisma.user.update({
  where: { id: userId },
  data: {
    name: 'New Name',
    avatar: 'https://...',
  },
});
```

---

## Troubleshooting

### Can't connect to database

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Check connection
DATABASE_URL="your-url" bunx prisma db execute --stdin <<'EOF'
SELECT 1;
EOF
```

### Duplicate users created

Check callback route includes email-based linking:

```typescript
// In app/api/logto/callback/route.ts
if (!user && claims.email) {
  const emailUser = await prisma.user.findUnique({
    where: { email: claims.email.toLowerCase() }
  });

  if (emailUser && !emailUser.logtoId) {
    user = await prisma.user.update({
      where: { id: emailUser.id },
      data: { logtoId: claims.sub, ... }
    });
  }
}
```

### Prisma Client not found

```bash
bunx prisma generate
# Restart dev server
```

### Migration conflicts

```bash
# Reset database (dev only!)
bunx prisma migrate reset

# Or create a new migration
bunx prisma migrate dev --name fix_conflict
```

---

## User Model Reference

```prisma
model User {
  id            String    @id @default(cuid())

  // Auth providers
  logtoId       String?   @unique
  googleId      String?   @unique
  wechatOpenId  String?   @unique

  // Profile
  email         String?   @unique
  emailVerified Boolean   @default(false)
  name          String?
  avatar        String?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([logtoId])
}
```

---

## Environment Variables Checklist

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `LOGTO_ENDPOINT` - Logto tenant URL
- `LOGTO_APP_ID` - Application ID from Logto
- `LOGTO_APP_SECRET` - Application secret from Logto
- `LOGTO_COOKIE_SECRET` - Random 32-char string

**Optional:**
- `NEXT_PUBLIC_BASE_URL` - Your app's public URL

**Generate cookie secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## File Structure

```
project/
├── app/
│   └── api/
│       └── logto/
│           ├── sign-in/route.ts
│           ├── callback/route.ts
│           ├── sign-out/route.ts
│           └── user/route.ts
├── lib/
│   ├── prisma.ts
│   └── logto.ts
├── hooks/
│   └── useAuth.ts
├── prisma/
│   └── schema.prisma
├── .env.local
└── docker-compose.yml
```

---

## Quick Tests

```typescript
// Test database connection
const count = await prisma.user.count();
console.log(`Total users: ${count}`);

// Test user creation
const testUser = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
  },
});

// Test user query
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
});

// Cleanup
await prisma.user.delete({
  where: { id: testUser.id },
});
```

---

## Links

- **Full Guide:** `docs/PRISMA_LOGTO_SETUP_GUIDE.md`
- **Prisma Docs:** https://www.prisma.io/docs
- **Logto Docs:** https://docs.logto.io
- **Next.js Docs:** https://nextjs.org/docs
