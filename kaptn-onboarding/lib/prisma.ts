// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
// Supports both Prisma Accelerate (production) and binary engine (local)
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

// Check if DATABASE_URL is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;
const isAccelerateUrl = process.env.DATABASE_URL?.startsWith('prisma+postgres://');

let prisma: PrismaClient | null = null;

if (isDatabaseConfigured) {
  try {
    if (isAccelerateUrl) {
      // Use Prisma Accelerate for production (serverless)
      // Prisma v7 requires datasourceUrl for Accelerate
      const baseClient = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL!, // Safe: checked by isDatabaseConfigured
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      prisma = baseClient.$extends(withAccelerate()) as any;
    } else {
      // Use binary engine for local development
      prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma;
      }
    }
  } catch (error) {
    console.warn('Database connection failed, continuing without database:', error);
    prisma = null;
  }
} else {
  console.warn('DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
