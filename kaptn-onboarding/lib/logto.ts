// Logto Configuration
import { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  cookieSecure: process.env.NODE_ENV === 'production',
  resources: [],
  scopes: [
    'email',
    'profile',
    'openid',
  ],
};
