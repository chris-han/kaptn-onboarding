// Logto Sign-Out Route
import { signOut } from '@logto/next/server-actions';
import { NextRequest } from 'next/server';
import { logtoConfig } from '@/lib/logto';

// Force dynamic rendering since this route uses cookies via Logto
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return signOut(logtoConfig, `${logtoConfig.baseUrl}/`);
}
