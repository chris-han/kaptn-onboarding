# KAPTN Onboarding Documentation

Welcome to the KAPTN Onboarding documentation. This project serves as the reference implementation for user authentication and management across the KAPTN ecosystem.

---

## 📚 Documentation Index

### Getting Started

1. **[PRISMA_LOGTO_SETUP_GUIDE.md](./PRISMA_LOGTO_SETUP_GUIDE.md)** ⭐
   - **Purpose:** Complete setup guide for Prisma 7 + Logto authentication
   - **Audience:** Developers setting up new projects or migrating existing ones
   - **Contents:**
     - Environment configuration (dev + prod)
     - Prisma 7 setup with adapters
     - Logto Cloud integration
     - API routes implementation
     - Common pitfalls and solutions
     - Migration checklist
     - Cross-ecosystem integration patterns

2. **[PRISMA_LOGTO_QUICK_REFERENCE.md](./PRISMA_LOGTO_QUICK_REFERENCE.md)** 🚀
   - **Purpose:** Quick commands and code snippets for daily development
   - **Audience:** Developers already familiar with the setup
   - **Contents:**
     - Environment setup
     - Common commands
     - Code snippets
     - Troubleshooting quick fixes
     - User model reference

### Architecture & Design

3. **[USER_JOURNEY_DATABASE.md](./USER_JOURNEY_DATABASE.md)**
   - **Purpose:** User journey tracking and database architecture
   - **Audience:** Product managers, data analysts, backend developers
   - **Contents:**
     - User journey phases
     - Database schema design
     - Analytics and funnel tracking
     - Conversion metrics

### Deployment & Operations

4. **[LOGTO_REDIRECT_URI_SETUP.md](./LOGTO_REDIRECT_URI_SETUP.md)** ⚠️ **CRITICAL**
   - **Purpose:** Fix "redirect_uri did not match" errors
   - **Audience:** All developers
   - **Contents:**
     - Step-by-step redirect URI configuration
     - Development and production URIs
     - Troubleshooting guide
     - Environment-specific setup

5. **[../LOGTO_SETUP.md](../LOGTO_SETUP.md)**
   - **Purpose:** Logto-specific configuration instructions
   - **Audience:** DevOps, system administrators
   - **Contents:**
     - Logto Cloud account setup
     - Application configuration
     - Environment variables

6. **[../VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md)**
   - **Purpose:** Deployment guide for Vercel
   - **Audience:** DevOps, developers
   - **Contents:**
     - Vercel project setup
     - Environment variable configuration
     - Build settings
     - Custom domain setup

### Maintenance & Troubleshooting

7. **[../scripts/README.md](../scripts/README.md)**
   - **Purpose:** Database cleanup and maintenance scripts
   - **Audience:** Developers, database administrators
   - **Contents:**
     - Script usage instructions
     - Bug fixes documentation
     - Cleanup history
     - Prevention strategies

---

## 🎯 Use Cases

### "I want to set up a new project with Prisma + Logto"

Start here:
1. Read [PRISMA_LOGTO_SETUP_GUIDE.md](./PRISMA_LOGTO_SETUP_GUIDE.md)
2. Follow the migration checklist
3. Refer to [PRISMA_LOGTO_QUICK_REFERENCE.md](./PRISMA_LOGTO_QUICK_REFERENCE.md) for commands

Or use the Claude skill:
```bash
# In Claude Code
"Set up Prisma and Logto for my Next.js project"
```

### "I have Prisma 5/6 and want to upgrade to Prisma 7"

Follow:
1. [PRISMA_LOGTO_SETUP_GUIDE.md](./PRISMA_LOGTO_SETUP_GUIDE.md) - Section: "Prisma 7 Setup"
2. Pay attention to "Common Pitfalls" section
3. Update your `lib/prisma.ts` to use adapters

### "I want to integrate my app with KAPTN's user system"

Follow:
1. [PRISMA_LOGTO_SETUP_GUIDE.md](./PRISMA_LOGTO_SETUP_GUIDE.md) - Section: "Cross-Ecosystem Integration"
2. Use the same Logto tenant
3. Use the same User schema
4. Implement email-based linking in callback

### "I have duplicate users in my database"

Follow:
1. [../scripts/README.md](../scripts/README.md) - "Available Scripts"
2. Run `cleanup-orphan-users.ts` for orphans
3. Run `cleanup-duplicates.ts` for Logto duplicates
4. Check "Bugs That Were Fixed" to prevent future issues

### "I need to troubleshoot Prisma connection issues"

Check:
1. [PRISMA_LOGTO_QUICK_REFERENCE.md](./PRISMA_LOGTO_QUICK_REFERENCE.md) - "Troubleshooting"
2. [PRISMA_LOGTO_SETUP_GUIDE.md](./PRISMA_LOGTO_SETUP_GUIDE.md) - "Common Pitfalls"
3. Verify your DATABASE_URL format
4. Check if you're using Prisma 7 adapters

---

## 🛠️ Claude Skills

A reusable Claude skill is available for guided setup:

**Location:** `~/.claude/skills/prisma-logto-setup.md`

**Usage:** Ask Claude to:
- "Set up Prisma and Logto"
- "Add authentication to my Next.js app"
- "Integrate with KAPTN user system"
- "Fix Prisma 7 adapter issues"

The skill will interactively guide you through the entire setup process.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│         KAPTN Ecosystem                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Project A│  │ Project B│  │ Project C│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │        │
│       └─────────────┴──────────────┘        │
│                     │                        │
│         ┌───────────▼──────────┐            │
│         │   Logto Cloud (SSO)  │            │
│         └───────────┬──────────┘            │
│                     │                        │
│         ┌───────────▼──────────┐            │
│         │  Shared User Schema  │            │
│         │  (PostgreSQL + Prisma)│           │
│         └──────────────────────┘            │
└─────────────────────────────────────────────┘
```

### Key Principles

1. **Single Sign-On** - One Logto tenant for all projects
2. **Email as Identifier** - Always link users by email
3. **Graceful Degradation** - Apps work without database
4. **Adapter Pattern** - Prisma 7 requires adapters for PostgreSQL
5. **Duplicate Prevention** - Email-based linking in callbacks

---

## 📦 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7
- **Auth:** Logto Cloud
- **Hosting:** Vercel
- **Connection Pool:** Prisma Accelerate (production)

---

## 🔐 Security Best Practices

✅ **DO:**
- Use HTTPS in production
- Set `httpOnly: true` on auth cookies
- Normalize emails to lowercase
- Validate email format
- Rate limit sign-in attempts
- Use environment variables for secrets
- Use `sslmode=verify-full` for PostgreSQL

❌ **DON'T:**
- Hardcode credentials
- Expose `LOGTO_APP_SECRET` or `LOGTO_COOKIE_SECRET`
- Skip email validation
- Use `sslmode=require` (insecure in Prisma 7)
- Create users without checking for duplicates

---

## 🐛 Known Issues & Fixes

### ✅ Fixed Issues

1. **Duplicate User Creation (Logto Callback)**
   - **Status:** Fixed in `app/api/logto/callback/route.ts:63-82`
   - **Solution:** Email-based linking before creating new users

2. **Orphan User Creation (Welcome Component)**
   - **Status:** Fixed in `components/Welcome.tsx:12-19`
   - **Solution:** Pass userId via props instead of fetching

3. **Prisma 7 Adapter Issues**
   - **Status:** Fixed in `lib/prisma.ts`
   - **Solution:** Use `PrismaPg` adapter for PostgreSQL

### 🔍 Monitoring

Run these commands monthly to check for issues:

```bash
# Check for duplicates
DATABASE_URL="prod-url" npx tsx scripts/check-specific-users.ts

# Check for orphan users
DATABASE_URL="prod-url" npx tsx scripts/cleanup-orphan-users.ts
```

---

## 📞 Support

### Internal Resources
- **Working Implementation:** `/home/chris/repo/KAPTN/kaptn-onboarding`
- **Claude Skill:** `~/.claude/skills/prisma-logto-setup.md`
- **Project CLAUDE.md:** `../CLAUDE.md`

### External Documentation
- **Prisma Docs:** https://www.prisma.io/docs
- **Logto Docs:** https://docs.logto.io
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 🚀 Quick Start

For developers starting a new project:

```bash
# 1. Clone or reference this project
cd /path/to/new-project

# 2. Copy the setup files
cp ../kaptn-onboarding/lib/prisma.ts lib/
cp ../kaptn-onboarding/lib/logto.ts lib/
cp -r ../kaptn-onboarding/app/api/logto app/api/

# 3. Install dependencies
bun add @prisma/client @prisma/adapter-pg pg @logto/next
bun add -D prisma

# 4. Set up environment
cp ../kaptn-onboarding/.env.example .env.local
# Edit .env.local with your credentials

# 5. Initialize Prisma
bunx prisma init
# Copy User model from kaptn-onboarding/prisma/schema.prisma
bunx prisma generate
bunx prisma migrate dev --name init

# 6. Start development
bun run dev
```

Or ask Claude: "Set up Prisma and Logto using KAPTN patterns"

---

## 📝 Contributing

When making changes to the authentication system:

1. Update the relevant documentation
2. Test in both dev and prod environments
3. Run duplicate checks before and after
4. Update CHANGELOG if fixing a bug
5. Update Claude skill if changing setup process

---

## 📅 Changelog

### v1.0 (Jan 2026)
- Initial documentation suite
- Prisma 7 migration complete
- Logto integration stable
- Duplicate user bugs fixed
- Claude skill created
- Cross-ecosystem patterns established

---

**Last Updated:** January 26, 2026
**Maintained By:** KAPTN Engineering Team
**Status:** Production Ready ✅
