# Logto Redirect URI Configuration Guide

## Problem
Getting error: `"redirect_uri did not match any of the client's registered redirect_uris"`

This happens when the redirect URI your app sends to Logto doesn't match the URIs configured in the Logto console.

---

## Required Redirect URIs

You need to configure **BOTH** development and production redirect URIs in your Logto application:

### Development
```
http://localhost:3000/api/logto/callback
```

### Production
```
https://www.kaptn.ai/api/logto/callback
```

### Post Sign-Out Redirect URIs

Also configure these for sign-out:

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://www.kaptn.ai
```

---

## Step-by-Step Configuration

### 1. Log in to Logto Console

Visit: https://cloud.logto.io/

### 2. Select Your Application

1. Go to **Applications**
2. Click on your application (App ID: `yrvem8y0t08ru0k5xa5n5`)

### 3. Configure Redirect URIs

1. Scroll to **Redirect URIs** section
2. Click **+ Add another**
3. Add both URIs:
   ```
   http://localhost:3000/api/logto/callback
   https://www.kaptn.ai/api/logto/callback
   ```

**Screenshot guide:**
```
┌─────────────────────────────────────┐
│ Redirect URIs                       │
├─────────────────────────────────────┤
│ http://localhost:3000/api/logto/   │
│ callback                      [×]   │
│                                     │
│ https://www.kaptn.ai/api/logto/    │
│ callback                      [×]   │
│                                     │
│ [+ Add another]                     │
└─────────────────────────────────────┘
```

### 4. Configure Post Sign-Out Redirect URIs

1. Scroll to **Post sign-out redirect URIs** section
2. Click **+ Add another**
3. Add both URIs:
   ```
   http://localhost:3000
   https://www.kaptn.ai
   ```

### 5. Save Changes

Click **Save Changes** at the bottom of the page.

---

## Verification

### Test Development

1. Start your dev server:
   ```bash
   pnpm run dev
   ```

2. Visit: http://localhost:3000/landing

3. Click **Login** button

4. You should be redirected to Logto (no error)

5. After signing in, you should return to http://localhost:3000/onboarding

### Test Production

1. Visit: https://www.kaptn.ai/landing

2. Click **Login** button

3. You should be redirected to Logto (no error)

4. After signing in, you should return to https://www.kaptn.ai/onboarding

---

## Troubleshooting

### Still Getting Error?

**Check your environment variables:**

```bash
# Development (.env or .env.local)
cat .env | grep NEXT_PUBLIC_BASE_URL
# Should output: NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Production (.env.production)
cat .env.production | grep NEXT_PUBLIC_BASE_URL
# Should output: NEXT_PUBLIC_BASE_URL=https://www.kaptn.ai
```

**Check server logs:**

When you run `pnpm run dev`, you should see:
```
[Logto] Configuration: {
  endpoint: 'https://4a4amr.logto.app',
  appId: 'yrvem8y0t08ru0k5xa5n5',
  baseUrl: 'http://localhost:3000',
  callbackUrl: 'http://localhost:3000/api/logto/callback',
  environment: 'development'
}
```

**Verify callback URL is correct:**

The callback URL should be: `${NEXT_PUBLIC_BASE_URL}/api/logto/callback`

### Different Port?

If you're running on a different port (e.g., 3001), you need to:

1. Update `.env`:
   ```bash
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

2. Add the new redirect URI to Logto console:
   ```
   http://localhost:3001/api/logto/callback
   ```

### Using Custom Domain?

If your production domain is different:

1. Update `.env.production`:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

2. Add the redirect URI to Logto console:
   ```
   https://yourdomain.com/api/logto/callback
   ```

3. Update Vercel environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_BASE_URL production
   # Enter: https://yourdomain.com
   ```

---

## Multiple Environments

If you have staging/preview environments:

### Staging
```bash
# .env.staging
NEXT_PUBLIC_BASE_URL=https://staging.kaptn.ai
```

Add to Logto:
```
https://staging.kaptn.ai/api/logto/callback
```

### Vercel Preview Deployments

For Vercel preview URLs (e.g., `https://kaptn-onboarding-git-main-xxx.vercel.app`):

**Option 1: Wildcard (if Logto supports it)**
```
https://*.vercel.app/api/logto/callback
```

**Option 2: Add each preview URL manually**
```
https://kaptn-onboarding-git-main-xxx.vercel.app/api/logto/callback
```

**Option 3: Use production URL for previews** (recommended)
Set environment variable in Vercel for all preview deployments:
```
NEXT_PUBLIC_BASE_URL=https://www.kaptn.ai
```

---

## Security Notes

✅ **DO:**
- Use HTTPS for production redirect URIs
- Only add redirect URIs you control
- Remove old/unused redirect URIs
- Use specific URLs (not wildcards if possible)

❌ **DON'T:**
- Add redirect URIs from untrusted domains
- Use HTTP in production
- Share your `LOGTO_APP_SECRET`

---

## Common Errors

### Error: "redirect_uri did not match"

**Cause:** Redirect URI not configured in Logto console

**Solution:** Add the exact callback URL to Logto console (see Step 3 above)

### Error: "invalid_client"

**Cause:** Wrong `LOGTO_APP_ID` or `LOGTO_APP_SECRET`

**Solution:** Verify credentials in `.env` match Logto console

### Error: "invalid_grant"

**Cause:** Mismatched callback URL or expired authorization code

**Solution:**
1. Clear cookies
2. Try signing in again
3. Verify redirect URIs are correct

---

## Environment Variables Checklist

**Development (.env or .env.local):**
```bash
LOGTO_ENDPOINT="https://4a4amr.logto.app"
LOGTO_APP_ID="yrvem8y0t08ru0k5xa5n5"
LOGTO_APP_SECRET="[your_dev_secret]"
LOGTO_COOKIE_SECRET="[random_32_chars]"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Production (.env.production or Vercel):**
```bash
LOGTO_ENDPOINT="https://4a4amr.logto.app"
LOGTO_APP_ID="yrvem8y0t08ru0k5xa5n5"
LOGTO_APP_SECRET="[your_prod_secret]"
LOGTO_COOKIE_SECRET="[random_32_chars]"
NEXT_PUBLIC_BASE_URL="https://www.kaptn.ai"
```

---

## Quick Fix Checklist

- [ ] Added `http://localhost:3000/api/logto/callback` to Logto console
- [ ] Added `https://www.kaptn.ai/api/logto/callback` to Logto console
- [ ] Added `http://localhost:3000` to Post sign-out redirect URIs
- [ ] Added `https://www.kaptn.ai` to Post sign-out redirect URIs
- [ ] Saved changes in Logto console
- [ ] Verified `NEXT_PUBLIC_BASE_URL` in `.env`
- [ ] Verified `NEXT_PUBLIC_BASE_URL` in Vercel (production)
- [ ] Restarted dev server
- [ ] Cleared browser cookies
- [ ] Tested login flow

---

## Support

If issues persist:

1. **Check Logto logs:**
   - Go to Logto Console → Logs
   - Look for recent authentication attempts
   - Check for detailed error messages

2. **Check browser console:**
   - Open DevTools → Console
   - Look for any JavaScript errors
   - Check Network tab for failed requests

3. **Check server logs:**
   - Look for `[Logto]` prefixed messages
   - Verify the callback URL being used

4. **Contact Logto support:**
   - Visit: https://docs.logto.io/
   - Join Discord: https://discord.gg/logto

---

**Last Updated:** January 26, 2026
**Status:** ✅ Verified for KAPTN Onboarding
