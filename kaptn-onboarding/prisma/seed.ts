import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isAccelerateUrl = databaseUrl.startsWith('prisma+');

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

  prisma = new PrismaClient({
    adapter,
  });
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@kaptn.demo' },
    update: {},
    create: {
      email: 'alice@kaptn.demo',
      name: 'Alice Chen',
      emailVerified: true,
    },
  });
  console.log('✅ Created user:', user1.email);

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@kaptn.demo' },
    update: {},
    create: {
      email: 'bob@kaptn.demo',
      name: 'Bob Martinez',
      emailVerified: true,
    },
  });
  console.log('✅ Created user:', user2.email);

  const user3 = await prisma.user.upsert({
    where: { email: 'carol@kaptn.demo' },
    update: {},
    create: {
      email: 'carol@kaptn.demo',
      name: 'Carol Wong',
      emailVerified: true,
    },
  });
  console.log('✅ Created user:', user3.email);

  // Create waitlist entries
  await prisma.waitlistEntry.upsert({
    where: { email: 'alice@kaptn.demo' },
    update: {},
    create: {
      userId: user1.id,
      name: 'Alice Chen',
      email: 'alice@kaptn.demo',
      company: 'TechStart Inc',
      interests: ['compass', 'ledger'],
      source: 'onboarding',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created waitlist entry for Alice');

  await prisma.waitlistEntry.upsert({
    where: { email: 'bob@kaptn.demo' },
    update: {},
    create: {
      userId: user2.id,
      name: 'Bob Martinez',
      email: 'bob@kaptn.demo',
      company: 'BuildCo',
      interests: ['shield', 'sonar'],
      source: 'onboarding',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created waitlist entry for Bob');

  // Create user profiles
  await prisma.userProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      captainName: 'Alice Chen',
      knowledgePattern: 'ACTIVE_EXPLORER',
      thesisPattern: 'RAPID_UPDATER',
      prioritizePattern: 'FOCUSED_NAVIGATOR',
      actionPattern: 'MOMENTUM_DRIVER',
      navigationPattern: 'QUICK_RECALIBRATOR',
      onboardingCompleted: true,
      completedAt: new Date(),
      scenarioResponses: [
        { protocol: 'K', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'T', selectedOption: 'B', timestamp: Date.now() },
        { protocol: 'P', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'A', selectedOption: 'B', timestamp: Date.now() },
        { protocol: 'N', selectedOption: 'C', timestamp: Date.now() },
      ],
    },
  });
  console.log('✅ Created profile for Alice');

  await prisma.userProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      captainName: 'Bob Martinez',
      knowledgePattern: 'SELECTIVE_SCANNER',
      thesisPattern: 'STABLE_HOLDER',
      prioritizePattern: 'PARALLEL_EXPLORER',
      actionPattern: 'CAREFUL_VALIDATOR',
      navigationPattern: 'PERSISTENT_INVESTIGATOR',
      onboardingCompleted: true,
      completedAt: new Date(),
      scenarioResponses: [
        { protocol: 'K', selectedOption: 'B', timestamp: Date.now() },
        { protocol: 'T', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'P', selectedOption: 'B', timestamp: Date.now() },
        { protocol: 'A', selectedOption: 'A', timestamp: Date.now() },
        { protocol: 'N', selectedOption: 'B', timestamp: Date.now() },
      ],
    },
  });
  console.log('✅ Created profile for Bob');

  await prisma.userProfile.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      captainName: 'Carol Wong',
      knowledgePattern: 'ACTIVE_EXPLORER',
      thesisPattern: 'STABLE_HOLDER',
      prioritizePattern: 'FOCUSED_NAVIGATOR',
      actionPattern: 'BALANCED_LAUNCHER',
      navigationPattern: 'QUICK_RECALIBRATOR',
      onboardingCompleted: true,
      completedAt: new Date(),
      scenarioResponses: [
        { protocol: 'K', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'T', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'P', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'A', selectedOption: 'C', timestamp: Date.now() },
        { protocol: 'N', selectedOption: 'C', timestamp: Date.now() },
      ],
    },
  });
  console.log('✅ Created profile for Carol');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
