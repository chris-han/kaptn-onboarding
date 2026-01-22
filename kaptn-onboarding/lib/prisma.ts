// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Check if DATABASE_URL is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

let prisma: PrismaClient | null = null;
let pool: Pool | undefined = undefined;

if (isDatabaseConfigured) {
  try {
    // Create connection pool
    pool = globalForPrisma.pool ?? new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(pool);

    // Create Prisma client with adapter
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
      globalForPrisma.pool = pool;
    }
  } catch (error) {
    console.warn('Database connection failed, continuing without database:', error);
    prisma = null;
  }
} else {
  console.warn('DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
