/**
 * KAPTN User Cleanup Script
 * Safely identifies and removes duplicate user records created by the callback bug
 *
 * Run with: DATABASE_URL="your-prod-url" tsx scripts/cleanup-duplicates.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
const isAccelerateUrl = databaseUrl.startsWith('prisma+postgres://');

let prisma: PrismaClient;

if (isAccelerateUrl) {
  // Use Prisma Accelerate for production
  prisma = new PrismaClient({
    accelerateUrl: databaseUrl,
  });
} else {
  // Use adapter for local PostgreSQL
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

async function analyzeDuplicates() {
  console.log('\n=== DUPLICATE USER ANALYSIS ===\n');

  // Find all users with null name and a logtoId (likely duplicates)
  const suspectUsers = await prisma.user.findMany({
    where: {
      name: null,
      logtoId: { not: null },
    },
    include: {
      badge: true,
      profile: true,
      waitlistEntry: true,
      _count: {
        select: {
          journeyEvents: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${suspectUsers.length} users with null name and logtoId\n`);

  const safeToDelete: string[] = [];
  const requiresManualReview: Array<{ id: string; reason: string }> = [];

  for (const user of suspectUsers) {
    const hasData =
      user.badge ||
      user.profile ||
      user.waitlistEntry ||
      user._count.journeyEvents > 0;

    if (hasData) {
      requiresManualReview.push({
        id: user.id,
        reason: `Has associated data: ${[
          user.badge && 'badge',
          user.profile && 'profile',
          user.waitlistEntry && 'waitlist',
          user._count.journeyEvents > 0 && `${user._count.journeyEvents} events`,
        ]
          .filter(Boolean)
          .join(', ')}`,
      });
    } else {
      safeToDelete.push(user.id);
    }

    console.log(`User ${user.id}:`);
    console.log(`  Email: ${user.email || 'none'}`);
    console.log(`  LogtoId: ${user.logtoId}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(`  Has Badge: ${!!user.badge}`);
    console.log(`  Has Profile: ${!!user.profile}`);
    console.log(`  Has Waitlist: ${!!user.waitlistEntry}`);
    console.log(`  Journey Events: ${user._count.journeyEvents}`);
    console.log('');
  }

  console.log('\n=== CLEANUP SUMMARY ===\n');
  console.log(`Safe to delete (no data): ${safeToDelete.length} users`);
  console.log(`Requires manual review: ${requiresManualReview.length} users\n`);

  if (requiresManualReview.length > 0) {
    console.log('Users requiring manual review:');
    requiresManualReview.forEach(({ id, reason }) => {
      console.log(`  - ${id}: ${reason}`);
    });
    console.log('');
  }

  return { safeToDelete, requiresManualReview };
}

async function cleanupSafeUsers(userIds: string[], dryRun = true) {
  if (userIds.length === 0) {
    console.log('No users to delete.');
    return;
  }

  console.log(
    `\n=== ${dryRun ? 'DRY RUN' : 'DELETING'} ${userIds.length} USERS ===\n`
  );

  if (dryRun) {
    console.log('This is a DRY RUN. No actual deletions will occur.');
    console.log('Run with --execute flag to perform actual deletion.\n');
    console.log('Users that would be deleted:');
    userIds.forEach((id) => console.log(`  - ${id}`));
    return;
  }

  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    console.log(`✓ Successfully deleted ${result.count} users`);
  } catch (error) {
    console.error('✗ Error during deletion:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');

  try {
    const { safeToDelete, requiresManualReview } = await analyzeDuplicates();

    if (requiresManualReview.length > 0) {
      console.log(
        '⚠ WARNING: Some users have associated data and require manual review.'
      );
      console.log(
        'Please investigate these users before proceeding with cleanup.\n'
      );
    }

    await cleanupSafeUsers(safeToDelete, !execute);

    if (!execute && safeToDelete.length > 0) {
      console.log('\n✓ Dry run complete. Run with --execute to delete users.');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
