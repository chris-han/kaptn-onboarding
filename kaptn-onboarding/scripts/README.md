# Database Cleanup & Maintenance Scripts

## Overview

This directory contains TypeScript scripts for database maintenance, user cleanup, and debugging. All scripts work with both local PostgreSQL (via `PrismaPg` adapter) and Prisma Accelerate in production.

---

## Available Scripts

### 1. cleanup-duplicates.ts
Identifies and removes duplicate User records based on null name + logtoId.

**Use case:** Users created during the Logto callback bug (before fix was applied).

**Usage:**
```bash
# Dry run (analysis only)
DATABASE_URL="your-db-url" npx tsx scripts/cleanup-duplicates.ts

# Execute deletion
DATABASE_URL="your-db-url" npx tsx scripts/cleanup-duplicates.ts --execute
```

### 2. cleanup-orphan-users.ts
Cleans up orphan users with null email, null name, and null logtoId.

**Use case:** Users created by the Welcome component bug (before fix was applied).

**Usage:**
```bash
# Dry run
DATABASE_URL="your-db-url" npx tsx scripts/cleanup-orphan-users.ts

# Execute deletion
DATABASE_URL="your-db-url" npx tsx scripts/cleanup-orphan-users.ts --execute
```

### 3. check-specific-users.ts
Inspects specific users and identifies duplicates.

**Use case:** Debugging user issues, finding duplicate emails, analyzing user creation patterns.

**Usage:**
```bash
DATABASE_URL="your-db-url" npx tsx scripts/check-specific-users.ts
```

**Output:**
- Specific user details
- All users by creation time
- Duplicate email detection
- Users with null names

### 4. cleanup-duplicate-users.sql
SQL queries for manual duplicate inspection and cleanup.

**Use case:** Direct database access, custom cleanup queries.

**Usage:**
```bash
# Using Prisma
DATABASE_URL="your-url" bunx prisma db execute --stdin < scripts/cleanup-duplicate-users.sql

# Or with psql
psql "your-connection-string" -f scripts/cleanup-duplicate-users.sql
```

---

## Bugs That Were Fixed

### Bug 1: Logto Callback Duplicate Creation (FIXED)
**Problem:** Every Logto sign-in created a new User record, even if user already existed.

**Root Cause:** Callback only checked by `logtoId`, not by email.

**Fix Location:** `app/api/logto/callback/route.ts:63-82`

**Fix Applied:**
```typescript
// Now checks by email before creating new user
if (!user && claims.email) {
  const emailUser = await prisma.user.findUnique({
    where: { email: claims.email.toLowerCase() }
  });

  if (emailUser && !emailUser.logtoId) {
    // Link existing user instead of creating duplicate
    user = await prisma.user.update({
      where: { id: emailUser.id },
      data: { logtoId: claims.sub, ... }
    });
  }
}
```

### Bug 2: Welcome Component Orphan Creation (FIXED)
**Problem:** Welcome component created orphan users (null email/name/logtoId) even when userId already existed.

**Root Cause:** Component didn't receive `userId` prop, always fetched new ID from `/api/user-id`.

**Fix Location:**
- `app/[locale]/onboarding/page.tsx:237` - Pass `userId` prop
- `components/Welcome.tsx:12,15,19` - Accept and use `userId` prop

**Fix Applied:**
```typescript
// Parent passes userId
<Welcome userId={userId} captainName={captainName} />

// Child uses it
function Welcome({ userId: initialUserId }: Props) {
  const [userId, setUserId] = useState(initialUserId || null);
  // Only fetch as fallback if not provided
}
```

---

## Cleanup History

### Production Database Cleanup (Jan 26, 2026)
- **Before:** 7 total users (5 real + 2 orphans)
- **After:** 5 total users (orphans removed)
- **Orphans Removed:**
  - `cmktmp65l0009fk1682bnh8ym` (null email/name/logtoId)
  - `cmktmfgec0004fk16tls7r3ph` (null email/name/logtoId)

### Development Database
- No duplicates found (already clean)

---

## Verification

After cleanup, verify no duplicates remain:

```sql
-- Check for duplicate logtoIds
SELECT "logtoId", COUNT(*)
FROM "User"
WHERE "logtoId" IS NOT NULL
GROUP BY "logtoId"
HAVING COUNT(*) > 1;

-- Check for duplicate emails
SELECT email, COUNT(*)
FROM "User"
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Check for orphan users
SELECT COUNT(*)
FROM "User"
WHERE email IS NULL
  AND name IS NULL
  AND "logtoId" IS NULL;
```

Expected results: All queries should return 0 rows.

---

## Prevention

The fixes prevent future duplicates by:

1. **Email-based linking** - Callback always checks for existing users by email
2. **Prop passing** - Components receive userId instead of fetching new one
3. **Lowercase normalization** - All emails normalized to lowercase
4. **Cookie-based linking** - Support for linking via userId cookie

---

## Troubleshooting

### Script fails with "PrismaClientInitializationError"

**Problem:** Prisma 7 requires adapters for PostgreSQL.

**Solution:** Scripts include adapter logic:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### "Unknown property datasources" error

**Problem:** Using Prisma 5/6 syntax with Prisma 7.

**Solution:** Use `accelerateUrl` parameter:
```typescript
// Prisma 7 syntax
new PrismaClient({ accelerateUrl: url })
```

### SSL warnings in production

**Problem:** Using `sslmode=require` instead of `sslmode=verify-full`.

**Solution:** Update DATABASE_URL:
```bash
DATABASE_URL="...?sslmode=verify-full&pool=true"
```

---

## Future Maintenance

To check for new duplicates:

```bash
# Run check script monthly
DATABASE_URL="prod-url" npx tsx scripts/check-specific-users.ts

# If duplicates found, analyze and cleanup
DATABASE_URL="prod-url" npx tsx scripts/cleanup-orphan-users.ts
DATABASE_URL="prod-url" npx tsx scripts/cleanup-orphan-users.ts --execute
```

---

## Related Documentation

- **Setup Guide:** `docs/PRISMA_LOGTO_SETUP_GUIDE.md`
- **Quick Reference:** `docs/PRISMA_LOGTO_QUICK_REFERENCE.md`
- **User Journey:** `docs/USER_JOURNEY_DATABASE.md`
