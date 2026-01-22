# Logto Authentication Setup Guide

## Overview

KAPTN onboarding is now integrated with Logto Cloud for authentication. This guide explains how to complete the setup.

## ✅ What's Already Done

- ✅ Logto SDK installed (`@logto/next`)
- ✅ Authentication routes created (`/api/logto/*`)
- ✅ User hooks and components implemented
- ✅ Database integration configured
- ✅ Navigation sign-in/sign-out button added

## 🔧 Configuration Required

### 1. Get Your App Secret from Logto Cloud

1. Go to your Logto Cloud dashboard: https://4a4amr.logto.app/
2. Navigate to **Applications** in the sidebar
3. Find or create your application (App ID: `pkvzatjo618s71pp93rmz`)
4. Copy the **App Secret** from the application details

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder with your actual app secret:

```bash
# Replace this line:
LOGTO_APP_SECRET=__REPLACE_WITH_YOUR_APP_SECRET_FROM_LOGTO_DASHBOARD__

# With your actual secret:
LOGTO_APP_SECRET=your_actual_secret_here
```

### 3. Configure Redirect URIs in Logto Dashboard

In your Logto application settings, add these redirect URIs:

**Development:**
- Redirect URI: `http://localhost:3000/api/logto/callback`
- Post sign-out redirect URI: `http://localhost:3000`

**Production:**
- Redirect URI: `https://yourdomain.com/api/logto/callback`
- Post sign-out redirect URI: `https://yourdomain.com`

### 4. Configure Social Login Providers (Optional)

#### Google OAuth Setup

1. In Logto dashboard, go to **Connectors** > **Social**
2. Enable **Google** connector
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://4a4amr.logto.app/callback/google`
4. Copy Client ID and Client Secret to Logto Google connector config

#### WeChat OAuth Setup (Web)

1. In Logto dashboard, go to **Connectors** > **Social**
2. Enable **WeChat Web** connector
3. Register your application on [WeChat Open Platform](https://open.weixin.qq.com/)
4. Get your WeChat AppID and AppSecret
5. Add callback URL: `https://4a4amr.logto.app/callback/wechat`
6. Configure in Logto WeChat connector

#### WeChat OAuth Setup (Official Account)

1. In Logto dashboard, enable **WeChat Official Account** connector
2. Register on [WeChat Official Accounts Platform](https://mp.weixin.qq.com/)
3. Get AppID and AppSecret from your official account settings
4. Configure OAuth redirect domain in WeChat settings
5. Add connector configuration in Logto

## 🚀 How It Works

### Authentication Flow

1. **Anonymous Users**: Can complete onboarding without signing in
2. **Authenticated Users**: Get their data synced to Logto
3. **Sign In**: Click "SIGN IN" in navigation → Redirects to Logto → Returns to onboarding
4. **Callback**: User data automatically synced to PostgreSQL database
5. **Sign Out**: Clears session and redirects to homepage

### Database Integration

When users authenticate:
- **New users**: Created in `User` table with `logtoId`, `email`, `name`
- **Existing users**: Profile updated with latest info from Logto
- **Email verification**: `emailVerified` flag synced from Logto
- **Social logins**: IDs stored in `googleId`, `wechatOpenId`, `wechatUnionId` fields

### API Routes

- `GET /api/logto/sign-in` - Initiates sign-in flow
- `GET /api/logto/callback` - Handles OAuth callback
- `GET /api/logto/sign-out` - Signs user out
- `GET /api/logto/user` - Gets current user info

### Client-Side Usage

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { authenticated, user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (authenticated) {
    return (
      <div>
        Welcome {user?.name}!
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return <button onClick={() => signIn('/onboarding')}>Sign In</button>;
}
```

## 📊 User Data Schema

```prisma
model User {
  id            String    @id @default(cuid())
  logtoId       String?   @unique  // Logto user ID
  email         String?   @unique
  emailVerified Boolean   @default(false)

  // Social login identifiers
  googleId      String?   @unique
  wechatOpenId  String?   @unique
  wechatUnionId String?   @unique

  // Profile info
  name          String?
  avatar        String?

  // Relations
  waitlistEntry WaitlistEntry?
  profile       UserProfile?
  badge         Badge?
}
```

## 🔒 Security Notes

- ✅ Cookie encryption enabled (32-byte secret)
- ✅ Secure cookies in production (HTTPS only)
- ✅ CSRF protection via Logto SDK
- ✅ OAuth state validation
- ⚠️ Never commit `.env.local` to version control
- ⚠️ Rotate `LOGTO_COOKIE_SECRET` if exposed

## 🧪 Testing Authentication

1. Start the development server: `bun run dev`
2. Navigate to `http://localhost:3000`
3. Click "SIGN IN" in the navigation
4. You should be redirected to Logto login page
5. After login, you'll return to the onboarding flow
6. Check database to confirm user was created:
   ```bash
   docker exec -it pg_kaptn psql -U kaptn_admin -d pg_kaptn -c "SELECT * FROM \"User\" WHERE \"logtoId\" IS NOT NULL;"
   ```

## 🐛 Troubleshooting

### "App secret is invalid"
- Double-check `LOGTO_APP_SECRET` in `.env.local`
- Ensure no extra spaces or quotes
- Restart dev server after changing env vars

### "Redirect URI mismatch"
- Verify redirect URIs in Logto dashboard match exactly
- Check for trailing slashes
- Ensure protocol is correct (http vs https)

### "User not created in database"
- Check database connection in `.env.local`
- Verify PostgreSQL container is running: `docker ps`
- Check Prisma migrations are applied: `bunx prisma migrate status`

### Social login not working
- Verify connector is enabled in Logto dashboard
- Check client ID/secret are correct
- Ensure callback URLs are whitelisted in OAuth provider settings

## 📚 Additional Resources

- [Logto Documentation](https://docs.logto.io/)
- [Logto Next.js SDK](https://docs.logto.io/quick-starts/next-app-router/)
- [Google OAuth Setup](https://docs.logto.io/integrations/google/)
- [WeChat OAuth Setup](https://docs.logto.io/integrations/wechat/)

## 🎯 Next Steps

After completing the setup:
1. ✅ Get app secret from Logto dashboard
2. ✅ Update `.env.local` with the secret
3. ✅ Configure redirect URIs in Logto
4. ✅ Test authentication flow
5. 🎨 Customize Logto sign-in experience (branding, colors)
6. 🌐 Configure social login providers (Google, WeChat)
7. 📧 Set up email verification templates
8. 🔐 Configure MFA if needed
