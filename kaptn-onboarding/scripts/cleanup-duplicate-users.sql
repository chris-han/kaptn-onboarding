-- KAPTN User Cleanup Script
-- Identifies and helps clean up duplicate user records where name = null

-- Step 1: Identify potential duplicates (users with null name that have a logtoId)
-- These are likely the "second" users created during the bug
SELECT
  id,
  "logtoId",
  email,
  name,
  "createdAt"
FROM "User"
WHERE name IS NULL
  AND "logtoId" IS NOT NULL
ORDER BY "createdAt" DESC;

-- Step 2: For each duplicate, find the "real" user (with same email but has a name)
-- Replace '<logtoId_from_above>' with actual logtoId from Step 1
SELECT
  id,
  "logtoId",
  email,
  name,
  "createdAt"
FROM "User"
WHERE email = (
  SELECT email FROM "User" WHERE "logtoId" = '<logtoId_from_above>'
)
ORDER BY "createdAt";

-- Step 3: Before deleting, check what would be deleted
-- This shows related records that would be cascade deleted
SELECT
  u.id AS user_id,
  u.email,
  u.name,
  COUNT(DISTINCT b.id) AS badge_count,
  COUNT(DISTINCT p.id) AS profile_count,
  COUNT(DISTINCT w.id) AS waitlist_count,
  COUNT(DISTINCT j.id) AS journey_events_count
FROM "User" u
LEFT JOIN "Badge" b ON b."userId" = u.id
LEFT JOIN "UserProfile" p ON p."userId" = u.id
LEFT JOIN "WaitlistEntry" w ON w."userId" = u.id
LEFT JOIN "JourneyEvent" j ON j."userId" = u.id
WHERE u.name IS NULL AND u."logtoId" IS NOT NULL
GROUP BY u.id, u.email, u.name
ORDER BY u."createdAt" DESC;

-- Step 4: SAFE DELETE - Only delete users with:
-- - name IS NULL
-- - logtoId IS NOT NULL
-- - No associated records (no badge, profile, waitlist, or journey events)
--
-- UNCOMMENT AND RUN CAREFULLY:
-- DELETE FROM "User"
-- WHERE id IN (
--   SELECT u.id
--   FROM "User" u
--   LEFT JOIN "Badge" b ON b."userId" = u.id
--   LEFT JOIN "UserProfile" p ON p."userId" = u.id
--   LEFT JOIN "WaitlistEntry" w ON w."userId" = u.id
--   LEFT JOIN "JourneyEvent" j ON j."userId" = u.id
--   WHERE u.name IS NULL
--     AND u."logtoId" IS NOT NULL
--     AND b.id IS NULL
--     AND p.id IS NULL
--     AND w.id IS NULL
--     AND j.id IS NULL
-- );

-- Step 5: For duplicates with data, you'll need to manually merge
-- This query helps identify which duplicates have important data:
SELECT
  u.id,
  u.email,
  u.name,
  u."logtoId",
  b.id AS badge_id,
  b."serialNumber",
  p.id AS profile_id,
  p."onboardingCompleted",
  w.id AS waitlist_id
FROM "User" u
LEFT JOIN "Badge" b ON b."userId" = u.id
LEFT JOIN "UserProfile" p ON p."userId" = u.id
LEFT JOIN "WaitlistEntry" w ON w."userId" = u.id
WHERE u.name IS NULL AND u."logtoId" IS NOT NULL
  AND (b.id IS NOT NULL OR p.id IS NOT NULL OR w.id IS NOT NULL)
ORDER BY u."createdAt" DESC;
