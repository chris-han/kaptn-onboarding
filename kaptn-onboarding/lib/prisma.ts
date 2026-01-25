// Prisma Client Singleton
// Prevents multiple instances in development hot-reload
// Supports both Prisma Accelerate (production) and binary engine (local)
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Check if DATABASE_URL is configured (trim whitespace and remove all types of newlines)
const databaseUrl = process.env.DATABASE_URL?.trim().replace(/\\n/g, '').replace(/\n/g, '');
const isDatabaseConfigured = !!databaseUrl;
const isAccelerateUrl = databaseUrl?.startsWith('prisma+postgres://');

let prisma: any = null;

if (isDatabaseConfigured) {
  try {
    console.log('[Prisma] Initializing client...', {
      isAccelerateUrl,
      urlPreview: databaseUrl?.substring(0, 50) + '...',
      nodeEnv: process.env.NODE_ENV,
    });

    if (isAccelerateUrl) {
      // Use Prisma Accelerate for production (serverless)
      // Prisma v7: Use accelerateUrl parameter
      prisma = new PrismaClient({
        accelerateUrl: databaseUrl,
        log: ['query', 'error', 'warn', 'info'],
      });
      console.log('[Prisma] Accelerate client initialized');
    } else {
      // Use adapter for local PostgreSQL development
      // Prisma v7: Requires @prisma/adapter-pg for PostgreSQL connections
      if (!globalForPrisma.prisma) {
        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        prisma = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });

        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prisma;
        }
        console.log('[Prisma] PostgreSQL adapter client initialized');
      } else {
        prisma = globalForPrisma.prisma;
        console.log('[Prisma] Reusing existing client');
      }
    }
  } catch (error) {
    console.error('[Prisma] Initialization failed:', error);
    prisma = null;
  }
} else {
  console.warn('[Prisma] DATABASE_URL not configured, database operations will be skipped');
}

export { prisma, isDatabaseConfigured };
