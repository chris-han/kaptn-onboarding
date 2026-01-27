// Logto Configuration
import { LogtoNextConfig } from '@logto/next';

// Validate required environment variables
const requiredEnvVars = {
  LOGTO_ENDPOINT: process.env.LOGTO_ENDPOINT,
  LOGTO_APP_ID: process.env.LOGTO_APP_ID,
  LOGTO_APP_SECRET: process.env.LOGTO_APP_SECRET,
  LOGTO_COOKIE_SECRET: process.env.LOGTO_COOKIE_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(`[Logto] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[Logto] Please check your .env file');
}

// Construct base URL with fallback
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

console.log('[Logto] Configuration:', {
  endpoint: process.env.LOGTO_ENDPOINT,
  appId: process.env.LOGTO_APP_ID,
  baseUrl,
  callbackUrl: `${baseUrl}/api/logto/callback`,
  environment: process.env.NODE_ENV,
});

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  baseUrl,
  cookieSecure: process.env.NODE_ENV === 'production',
  resources: [],
  scopes: [
    'email',
    'profile',
    'openid',
  ],
};
