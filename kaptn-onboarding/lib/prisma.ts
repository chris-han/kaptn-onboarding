// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
// Supports both Prisma Accelerate (production) and binary engine (local)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null;
};

// Check if DATABASE_URL is configured (trim whitespace)
const databaseUrl = process.env.DATABASE_URL?.trim();
const isDatabaseConfigured = !!databaseUrl;
const isAccelerateUrl = databaseUrl?.startsWith('prisma+postgres://');

let prisma: PrismaClient | null = null;

if (isDatabaseConfigured) {
  try {
    console.log('[Prisma] Initializing client...', {
      isAccelerateUrl,
      urlPreview: databaseUrl?.substring(0, 50) + '...',
      nodeEnv: process.env.NODE_ENV,
    });

    if (isAccelerateUrl) {
      // Use Prisma Accelerate for production (serverless)
      // Prisma v7: Use accelerateUrl parameter (do NOT use $extends)
      prisma = new PrismaClient({
        accelerateUrl: databaseUrl,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      console.log('[Prisma] Accelerate client initialized');
    } else {
      // Use binary engine for local development
      prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma;
      }
      console.log('[Prisma] Binary engine client initialized');
    }
  } catch (error) {
    console.error('[Prisma] Initialization failed:', error);
    prisma = null;
  }
} else {
  console.warn('[Prisma] DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
