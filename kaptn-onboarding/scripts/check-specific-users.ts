/**
 * Check specific users mentioned by the user
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

async function checkUsers() {
  console.log('\n=== CHECKING SPECIFIC USERS ===\n');

  // Check the specific user IDs mentioned
  const userIds = ['cmktmp65l0009fk1682bnh8ym', 'cmktmooh50005fk16k9yh2ku8'];

  for (const userId of userIds) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badge: true,
        profile: true,
        waitlistEntry: true,
      },
    });

    if (user) {
      console.log(`User ${userId}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  LogtoId: ${user.logtoId}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('');
    } else {
      console.log(`User ${userId}: NOT FOUND\n`);
    }
  }

  // Find all users ordered by creation time
  console.log('\n=== ALL USERS (by creation time) ===\n');
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      logtoId: true,
      createdAt: true,
    },
    take: 20, // Last 20 users
  });

  console.log(`Total users found: ${allUsers.length}\n`);
  allUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.id}`);
    console.log(`   Email: ${user.email || 'null'}`);
    console.log(`   Name: ${user.name || 'null'}`);
    console.log(`   LogtoId: ${user.logtoId || 'null'}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('');
  });

  // Check for users with same email
  console.log('\n=== CHECKING FOR DUPLICATE EMAILS ===\n');
  const emailGroups = await prisma.user.groupBy({
    by: ['email'],
    _count: true,
    having: {
      email: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  if (emailGroups.length > 0) {
    console.log(`Found ${emailGroups.length} emails with duplicates:\n`);
    for (const group of emailGroups) {
      if (group.email) {
        console.log(`Email: ${group.email} (${group._count} users)`);
        const users = await prisma.user.findMany({
          where: { email: group.email },
          orderBy: { createdAt: 'asc' },
        });
        users.forEach((u, idx) => {
          console.log(`  ${idx + 1}. ${u.id} - name: ${u.name || 'null'}, logtoId: ${u.logtoId || 'null'}, created: ${u.createdAt}`);
        });
        console.log('');
      }
    }
  } else {
    console.log('No duplicate emails found.');
  }

  // Check for users with null name (regardless of logtoId)
  console.log('\n=== USERS WITH NULL NAME ===\n');
  const nullNameUsers = await prisma.user.findMany({
    where: { name: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Found ${nullNameUsers.length} users with null name\n`);
  nullNameUsers.forEach((user) => {
    console.log(`- ${user.id}`);
    console.log(`  Email: ${user.email || 'null'}`);
    console.log(`  LogtoId: ${user.logtoId || 'null'}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log('');
  });
}

async function main() {
  try {
    await checkUsers();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
