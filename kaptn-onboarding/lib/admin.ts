// Admin Access Control Helpers
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export interface AdminCheckResult {
  isAdmin: boolean;
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

/**
 * Check if the current authenticated user has admin access
 * @returns AdminCheckResult with isAdmin flag and admin user data
 */
export async function checkAdminAccess(): Promise<AdminCheckResult> {
  try {
    // Check Logto authentication
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated || !claims?.email) {
      return {
        isAdmin: false,
        error: 'Not authenticated',
      };
    }

    // Check database configuration
    if (!isDatabaseConfigured || !prisma) {
      // In development or if DB is not configured, allow access for authenticated users
      // This is a fallback for local development
      console.warn('[Admin] Database not configured, allowing authenticated user');
      return {
        isAdmin: true,
        adminUser: {
          id: claims.sub || 'dev-user',
          email: claims.email,
          name: claims.name || claims.username || 'Admin',
          role: 'ADMIN',
        },
      };
    }

    // Check if user is in Admin table
    const adminUser = await prisma.admin.findUnique({
      where: { email: claims.email.toLowerCase() },
    });

    if (!adminUser) {
      return {
        isAdmin: false,
        error: 'User is not an admin',
      };
    }

    return {
      isAdmin: true,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    };
  } catch (error) {
    console.error('[Admin] Error checking admin access:', error);
    return {
      isAdmin: false,
      error: 'Failed to check admin access',
    };
  }
}

/**
 * Check if admin has specific role or higher
 * @param role - Minimum required role
 * @returns true if admin has sufficient permissions
 */
export function hasRole(adminRole: string, requiredRole: 'VIEWER' | 'ADMIN' | 'SUPER_ADMIN'): boolean {
  const roleHierarchy = {
    'VIEWER': 1,
    'ADMIN': 2,
    'SUPER_ADMIN': 3,
  };

  const currentLevel = roleHierarchy[adminRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return currentLevel >= requiredLevel;
}
