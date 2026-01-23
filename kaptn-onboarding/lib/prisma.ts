// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
// With Prisma 7+, DATABASE_URL is read from prisma.config.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

// Check if DATABASE_URL is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

let prisma: PrismaClient | null = null;

if (isDatabaseConfigured) {
  try {
    // Create Prisma client - reads URL from prisma.config.ts
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
