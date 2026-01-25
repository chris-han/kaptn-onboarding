# Vercel Deployment Guide

This guide covers deploying the KAPTN Onboarding application to Vercel using both GitHub integration and CLI.

## Project Structure

This is a **monorepo** with the following structure:
```
/home/chris/repo/KAPTN/           # Git repository root
├── vercel.json                    # (Not used - see note below)
├── README.md
└── kaptn-onboarding/              # Next.js application directory
    ├── package.json
    ├── next.config.js
    ├── app/
    ├── components/
    └── ...
```

**Important**: The Next.js application is in the `kaptn-onboarding/` subdirectory, not the repository root.

## Deployment Methods

### Method 1: GitHub Integration (Recommended for Production)

GitHub integration provides automatic deployments on every push.

#### Initial Setup

1. **Connect Repository to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will detect the Next.js framework automatically

2. **Configure Root Directory**

   This is the **critical step** for monorepo projects:

   - Go to Project Settings → Build & Development Settings
   - Find "Root Directory" setting
   - Set value to: `kaptn-onboarding`
   - Click "Save"

   **Why this matters**: By default, Vercel looks for `package.json` at the repository root. Setting the Root Directory tells Vercel where your Next.js app actually lives.

3. **Configure Environment Variables**

   Go to Project Settings → Environment Variables and add:

   **Required:**
   - `RESEND_API_KEY` - Email service API key
   - `RECIPIENT_EMAIL` - Where waitlist submissions are sent

   **Optional (Database):**
   - `DATABASE_URL` - PostgreSQL connection string (app degrades gracefully without DB)

   **Optional (Authentication):**
   - `NEXT_PUBLIC_BASE_URL` - Production domain (e.g., https://www.kaptn.ai)
   - `LOGTO_ENDPOINT` - Logto Cloud instance URL
   - `LOGTO_APP_ID` - Logto application ID
   - `LOGTO_APP_SECRET` - Logto application secret
   - `LOGTO_COOKIE_SECRET` - Random secret for session cookies

4. **Deploy**

   - Push to your default branch (e.g., `main`)
   - Vercel automatically builds and deploys
   - View deployment status at https://vercel.com/dashboard

#### How GitHub Deployments Work

- **Every push** to any branch triggers a Preview deployment
- **Pushes to production branch** (main/master) create Production deployments
- Build process:
  1. Vercel checks out code from GitHub
  2. Changes to `kaptn-onboarding/` directory
  3. Runs `pnpm install`
  4. Runs `prisma generate` (via postinstall hook)
  5. Runs `pnpm run build`
  6. Deploys to global edge network

#### Troubleshooting GitHub Deployments

**Error: "No Next.js version detected"**

This means Vercel is looking at the repository root instead of the subdirectory.

Solution:
1. Go to Project Settings → Build & Development Settings
2. Set "Root Directory" to `kaptn-onboarding`
3. Click "Save"
4. Next deployment will work correctly

**Why `vercel.json` doesn't work:**

You might think to create a `vercel.json` file with:
```json
{
  "rootDirectory": "kaptn-onboarding"
}
```

**This will fail** with error: "should NOT have additional property `rootDirectory`"

The `rootDirectory` property is only valid in the Vercel dashboard settings, not in `vercel.json`.

### Method 2: CLI Deployment

CLI deployment is useful for manual deploys and testing.

#### Installation

```bash
npm install -g vercel
```

#### Login

```bash
vercel login
```

#### Deploy from Project Directory

**Important**: Deploy from the `kaptn-onboarding/` directory, not the repository root.

```bash
# Navigate to Next.js app directory
cd /home/chris/repo/KAPTN/kaptn-onboarding

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### First Deployment Setup

On your first deployment, Vercel CLI will ask:

```
? Set up and deploy "~/repo/KAPTN/kaptn-onboarding"? [Y/n] y
? Which scope do you want to deploy to? <your-team>
? Link to existing project? [y/N] n
? What's your project's name? kaptn-onboarding
? In which directory is your code located? ./
```

**Key point**: When it asks "In which directory is your code located?", answer `./` because you're already in the `kaptn-onboarding/` directory.

#### Environment Variables via CLI

Pull environment variables from Vercel:
```bash
vercel env pull .env.local
```

Add new environment variable:
```bash
vercel env add RESEND_API_KEY
```

#### Verify Deployment

Check project settings:
```bash
vercel project inspect kaptn-onboarding
```

Expected output:
```
Root Directory    kaptn-onboarding  # For GitHub deployments
Framework Preset  Next.js
Node.js Version   24.x
```

## Production URL

- **Custom Domain**: https://www.kaptn.ai
- **Vercel Domain**: https://kaptn-onboarding.vercel.app

## Build Configuration

### Framework Settings (Auto-detected)

- **Framework**: Next.js
- **Build Command**: `pnpm run build` (includes `prisma generate`)
- **Output Directory**: Next.js default
- **Install Command**: `pnpm install`
- **Development Command**: `next dev`

### Node.js Version

- **Current**: 24.x
- Can be changed in Project Settings → Build & Development Settings

### Build Process

The build runs:
1. `pnpm install` - Install dependencies
2. `prisma generate` - Generate Prisma client (via postinstall hook)
3. `pnpm run build` - Build Next.js application
   - Compiles TypeScript
   - Optimizes assets
   - Generates static pages
   - Bundles for serverless functions

## Deployment Workflow

### Development Workflow

1. Work on feature branch locally
2. Push to GitHub
3. Vercel automatically creates Preview deployment
4. Review deployment at preview URL
5. Merge to main when ready
6. Vercel automatically deploys to Production

### Preview Deployments

- **Trigger**: Any push to any branch
- **URL Format**: `https://kaptn-onboarding-<unique-id>-<team>.vercel.app`
- **Benefits**:
  - Test changes before merging
  - Share with team for review
  - Each commit gets unique URL

### Production Deployments

- **Trigger**: Push to main/master branch (or manual via CLI)
- **URL**: https://www.kaptn.ai (custom domain)
- **Automatic**:
  - SSL certificates
  - Global CDN distribution
  - Edge caching
  - Automatic rollbacks available

## Common Commands

### Check Project Status
```bash
cd kaptn-onboarding
vercel project inspect kaptn-onboarding
```

### View Deployments
```bash
vercel ls
```

### View Logs
```bash
vercel logs <deployment-url>
```

### Rollback to Previous Deployment
Via Vercel dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Troubleshooting

### Build Fails: "Cannot find module '@prisma/client'"

**Cause**: Prisma client not generated

**Solution**: Ensure `postinstall` script in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Build Fails: TypeScript Errors

**Cause**: Type errors in code

**Solution**: Run locally before deploying:
```bash
bunx tsc --noEmit
```

### Database Connection Fails

**Cause**: Missing or incorrect `DATABASE_URL`

**Solution**:
1. Verify environment variable in Vercel dashboard
2. Ensure Prisma connection string format:
   - Production: `prisma+postgres://accelerate.prisma-data.net/...`
   - Development: `postgresql://user:password@host:port/db`

### Fonts Not Loading (403 Error)

**Cause**: External CDN blocking requests

**Solution**: Self-host fonts (already implemented in this project)
- Fonts are in `public/fonts/`
- CSS references local files via `/fonts/` path

## Best Practices

1. **Always Deploy from Subdirectory (CLI)**
   ```bash
   cd kaptn-onboarding  # ← Important!
   vercel --prod
   ```

2. **Set Root Directory (GitHub)**
   - Project Settings → Build & Development → Root Directory: `kaptn-onboarding`

3. **Test Before Production**
   - Deploy to preview first: `vercel`
   - Test thoroughly
   - Then promote or deploy to production: `vercel --prod`

4. **Use Environment Variables**
   - Never commit secrets to Git
   - Use Vercel dashboard or CLI to manage env vars
   - Different values for Preview/Production environments

5. **Monitor Deployments**
   - Check build logs for warnings
   - Review deployment summary
   - Test critical paths after deploy

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Monorepo Guide](https://vercel.com/docs/monorepos)

## Support

- **Vercel Status**: https://vercel-status.com/
- **GitHub Issues**: Report deployment issues in project repository
- **Vercel Support**: https://vercel.com/support
