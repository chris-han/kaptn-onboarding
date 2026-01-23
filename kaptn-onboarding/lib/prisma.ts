// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
// Using binary engine for traditional PostgreSQL connections
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

// Check if DATABASE_URL is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

let prisma: PrismaClient | null = null;

if (isDatabaseConfigured) {
  try {
    // Create Prisma client with binary engine (Prisma 7+)
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
  } catch (error) {
    console.warn('Database connection failed, continuing without database:', error);
    prisma = null;
  }
} else {
  console.warn('DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
