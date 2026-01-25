# Database Cleanup Scripts

## Duplicate User Cleanup

### Problem
A bug in the Logto callback caused duplicate User records to be created when users signed in. The duplicate records have `name = null` and were created immediately after the original user record.

### Fix Applied
The bug has been fixed in `app/api/logto/callback/route.ts`. The callback now:
1. Automatically links existing users via email matching
2. Prevents duplicate user creation
3. Normalizes all emails to lowercase

### Cleanup Process

#### 1. Analyze Duplicates (Safe)

```bash
# Dry run - analyze what would be deleted
DATABASE_URL="your-production-db-url" npx tsx scripts/cleanup-duplicates.ts
```

This will:
- Identify all users with `name = null` and a `logtoId`
- Classify them as "safe to delete" (no data) or "requires manual review" (has data)
- Show you exactly what would be deleted

#### 2. Delete Safe Duplicates (Destructive)

```bash
# ACTUAL DELETION - only run after reviewing dry run output
DATABASE_URL="your-production-db-url" npx tsx scripts/cleanup-duplicates.ts --execute
```

⚠️ **WARNING**: This will permanently delete users! Only run after:
- Reviewing the dry run output
- Taking a database backup
- Confirming the users have no important data

#### 3. Manual Review for Complex Cases

If some duplicate users have associated data (badges, profiles, waitlist entries), you'll need to manually merge them:

```sql
-- Example: Transfer data from duplicate to original user
-- Replace IDs with actual values from your database

-- 1. Find the original user (the one with a name)
SELECT * FROM "User" WHERE email = 'user@example.com' AND name IS NOT NULL;

-- 2. Find the duplicate (null name, has logtoId)
SELECT * FROM "User" WHERE email = 'user@example.com' AND name IS NULL;

-- 3. Update the original user with the logtoId from duplicate
UPDATE "User"
SET "logtoId" = '<logto_id_from_duplicate>'
WHERE id = '<original_user_id>';

-- 4. Delete the duplicate (cascade will remove related records)
DELETE FROM "User" WHERE id = '<duplicate_user_id>';
```

### SQL Queries

Alternative SQL-based cleanup available in `scripts/cleanup-duplicate-users.sql`.

Use this if you prefer running SQL directly via:
```bash
# Using Prisma
DATABASE_URL="your-url" bunx prisma db execute --stdin < scripts/cleanup-duplicate-users.sql

# Or connect directly with psql
psql "your-connection-string" -f scripts/cleanup-duplicate-users.sql
```

### Prevention

The fix is now deployed in `app/api/logto/callback/route.ts`. Future users will be automatically linked via email, preventing duplicates.

### Verification

After cleanup, verify no duplicates remain:

```sql
-- Should return 0 rows
SELECT "logtoId", COUNT(*)
FROM "User"
WHERE "logtoId" IS NOT NULL
GROUP BY "logtoId"
HAVING COUNT(*) > 1;
```
