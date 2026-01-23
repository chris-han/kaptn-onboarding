// Prisma Client Singleton with Prisma Accelerate
// Prevents multiple instances in development hot-reload
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

// Check if DATABASE_URL is configured (should use Prisma Accelerate URL)
const isDatabaseConfigured = !!process.env.DATABASE_URL;

let prisma: any = null;

if (isDatabaseConfigured) {
  try {
    // Create Prisma client (Accelerate URL detected from DATABASE_URL env var)
    const baseClient = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Extend with Accelerate for connection pooling and caching
    prisma = baseClient.$extends(withAccelerate());

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = baseClient;
    }
  } catch (error) {
    console.warn('Database connection failed, continuing without database:', error);
    prisma = null;
  }
} else {
  console.warn('DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
