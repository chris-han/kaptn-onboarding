/**
 * Clean up orphan users (email=null, name=null, logtoId=null)
 * These were created by the Welcome component bug
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
  prisma = new PrismaClient({ accelerateUrl: databaseUrl });
} else {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

async function analyzeOrphans() {
  console.log('\n=== ORPHAN USER ANALYSIS ===\n');

  // Find all users with null email, null name, and null logtoId
  const orphanUsers = await prisma.user.findMany({
    where: {
      email: null,
      name: null,
      logtoId: null,
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

  console.log(`Found ${orphanUsers.length} orphan users (null email, name, logtoId)\n`);

  const safeToDelete: string[] = [];
  const requiresReview: Array<{ id: string; reason: string }> = [];

  for (const user of orphanUsers) {
    const hasData =
      user.badge ||
      user.profile ||
      user.waitlistEntry ||
      user._count.journeyEvents > 0;

    if (hasData) {
      requiresReview.push({
        id: user.id,
        reason: `Has data: ${[
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

    console.log(`Orphan User ${user.id}:`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(`  Has Badge: ${!!user.badge}`);
    console.log(`  Has Profile: ${!!user.profile}`);
    console.log(`  Has Waitlist: ${!!user.waitlistEntry}`);
    console.log(`  Journey Events: ${user._count.journeyEvents}`);
    console.log('');
  }

  console.log('\n=== CLEANUP SUMMARY ===\n');
  console.log(`Safe to delete: ${safeToDelete.length} orphan users`);
  console.log(`Requires review: ${requiresReview.length} users\n`);

  if (requiresReview.length > 0) {
    console.log('⚠ Users requiring manual review:');
    requiresReview.forEach(({ id, reason }) => {
      console.log(`  - ${id}: ${reason}`);
    });
    console.log('');
  }

  return { safeToDelete, requiresReview };
}

async function deleteOrphans(userIds: string[], dryRun = true) {
  if (userIds.length === 0) {
    console.log('No orphan users to delete.');
    return;
  }

  console.log(
    `\n=== ${dryRun ? 'DRY RUN' : 'DELETING'} ${userIds.length} ORPHAN USERS ===\n`
  );

  if (dryRun) {
    console.log('This is a DRY RUN. No actual deletions will occur.');
    console.log('Run with --execute flag to perform actual deletion.\n');
    console.log('Orphan users that would be deleted:');
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

    console.log(`✓ Successfully deleted ${result.count} orphan users`);
  } catch (error) {
    console.error('✗ Error during deletion:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');

  try {
    const { safeToDelete, requiresReview } = await analyzeOrphans();

    if (requiresReview.length > 0) {
      console.log(
        '⚠ WARNING: Some orphan users have associated data.'
      );
      console.log(
        'Please investigate these before proceeding.\n'
      );
    }

    await deleteOrphans(safeToDelete, !execute);

    if (!execute && safeToDelete.length > 0) {
      console.log('\n✓ Dry run complete. Run with --execute to delete orphan users.');
    } else if (execute && safeToDelete.length > 0) {
      console.log('\n✓ Cleanup complete!');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
