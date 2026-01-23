# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KAPTN Onboarding is an interactive decision-making calibration experience that profiles users through the KAPTN framework (Knowledge, Action, Thesis, Prioritize, Navigation). It's a Next.js 14 app with internationalization support, Logto authentication, Prisma database integration, and a "bridge system" themed UI.

## Development Commands

### Package Management
- **Install dependencies**: `pnpm install`
- **Add package**: `bun add <package>` (per user config)
- Note: Package manager is `pnpm@10.28.0` but user prefers `bun` for operations

### Development Server
- **Run dev server**: `pnpm run dev` (starts on http://localhost:3000)
- **Build for production**: `pnpm run build` (includes `prisma generate`)
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm run lint`

### Database Operations
- **Generate Prisma client**: `prisma generate`
- **Create migration**: `bunx prisma migrate dev --name <migration_name>`
- **Deploy migrations**: `bunx prisma migrate deploy`
- **Initialize Prisma**: `bunx prisma init`
- **View database**: `bunx prisma studio`

### Docker Operations
- **Start services**: `docker-compose up -d` (PostgreSQL database)
- **Stop services**: `docker compose down`
- **View logs**: `docker logs <container_name>`

### Git & Deployment
- **Deploy to Vercel**: `vercel` or `vercel --yes`
- **Configure Vercel env**: `vercel env pull` or `vercel env add`

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion + GSAP
- **i18n**: next-intl (en, zh, ja, ko)
- **Auth**: Logto Cloud (`@logto/next`)
- **Database**: PostgreSQL + Prisma (with Accelerate support)
- **Email**: Resend API

### Directory Structure

```
kaptn-onboarding/
├── app/
│   ├── [locale]/           # Internationalized routes (en/zh/ja/ko)
│   │   ├── landing/        # Landing page
│   │   ├── onboarding/     # Main onboarding game flow
│   │   └── page.tsx        # Locale root
│   ├── api/                # API routes
│   │   ├── admin/          # Admin dashboard endpoints
│   │   ├── badge/          # Badge generation
│   │   ├── logto/          # Logto auth callbacks
│   │   ├── profile/        # User profile operations
│   │   ├── user-id/        # User ID utilities
│   │   └── waitlist/       # Waitlist registration
│   ├── globals.css         # Global styles + Tailwind directives
│   └── layout.tsx          # Root layout
├── components/
│   ├── landing/            # Landing page components
│   ├── AuthButton.tsx      # Logto auth button
│   ├── Brief.tsx           # Onboarding phase: instructions
│   ├── Entrance.tsx        # Onboarding phase: gate
│   ├── KAPTNBadge.tsx      # Badge display component
│   ├── Oath.tsx            # Captain's Oath ceremony
│   ├── Processing.tsx      # Protocol activation sequence
│   ├── Profile.tsx         # Decision style results
│   ├── ProgressBar.tsx     # Multi-step progress indicator
│   ├── Quote.tsx           # Sisko quote display
│   ├── ScenarioView.tsx    # Decision scenario interface
│   ├── Waitlist.tsx        # Waitlist registration form
│   └── Welcome.tsx         # Final activation screen
├── lib/
│   ├── gameData.ts         # Core content: scenarios, descriptions, oath
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
├── messages/               # i18n translation JSON files
│   ├── en.json, zh.json, ja.json, ko.json
├── types/
│   ├── game.ts             # Game-related TypeScript types
│   └── waitlist.ts         # Waitlist types
├── i18n/
│   ├── config.ts           # Supported locales configuration
│   └── request.ts          # next-intl request configuration
├── middleware.ts           # next-intl locale routing middleware
└── next.config.js          # Next.js config with next-intl plugin
```

### Routing & Internationalization

- **Locale routing**: Uses next-intl middleware for automatic locale detection
- **Supported locales**: `en`, `zh`, `ja`, `ko` (default: `en`)
- **Locale detection**: Automatic from cookies/headers
- **Locale prefix**: "as-needed" (default locale has no prefix)
- **Translations**: All user-facing text is in `messages/*.json`

### Database Schema

**Key Models:**
- `User`: Core user identity (supports Logto, Google, WeChat)
- `WaitlistEntry`: Pre-launch registrations with service interests
- `UserProfile`: KAPTN decision patterns (K/T/P/A/N)
- `Badge`: Digital captain's badge with serial number
- `JourneyEvent`: Funnel tracking for analytics
- `DailyStats`: Aggregated metrics
- `Admin`: Dashboard access control

**Database Connection:**
- Production: Uses Prisma Accelerate (`prisma+postgres://...`)
- Development: Direct PostgreSQL connection
- Config: `DATABASE_URL` in `.env` (optional - app degrades gracefully without DB)

### Authentication Flow (Logto)

- **Routes**: `/api/logto/sign-in`, `/api/logto/sign-out`, `/api/logto/callback`
- **Hooks**: `hooks/useLogto.ts` for user state
- **Components**: `AuthButton.tsx` for sign-in/out
- **User sync**: Logto ID stored in `User.logtoId`
- **Setup docs**: See `LOGTO_SETUP.md`

### Onboarding Game Flow

1. **Entrance** → Brief introduction, calibration framing
2. **Brief** → Game philosophy explanation
3. **5 Scenarios** → Decision-making challenges (K/T/P/A/N)
4. **Captain's Oath** → Ceremonial commitment
5. **Waitlist** → Service interest registration (COMPASS/LEDGER/SHIELD/SONAR)
6. **Processing** → Protocol activation animation
7. **Profile** → Decision style results display
8. **Sisko Quote** → Philosophical anchor
9. **Welcome** → Final activation, badge generation

**Data Output:** User receives a decision profile based on scenario choices (e.g., `ACTIVE_EXPLORER`, `RAPID_UPDATER`, etc.)

### Bridge Services (Waitlist)

- **COMPASS**: Intelligence & Decision Support (K + T)
- **LEDGER**: Financial Operations (K + N)
- **SHIELD**: Tax Compliance (P + N)
- **SONAR**: Analytics & Intelligence (T + P)

## Environment Configuration

**Required:**
- `RESEND_API_KEY`: For waitlist email notifications
- `RECIPIENT_EMAIL`: Where waitlist submissions are sent

**Optional:**
- `DATABASE_URL`: PostgreSQL connection (app works without DB)
- `NEXT_PUBLIC_BASE_URL`: Production domain (e.g., https://kaptn.ai)
- `LOGTO_ENDPOINT`: Logto Cloud instance URL
- `LOGTO_APP_ID`: Logto application ID
- `LOGTO_APP_SECRET`: Logto application secret (must get from dashboard)
- `LOGTO_COOKIE_SECRET`: Random secret for session cookies

**Files:**
- `.env.example`: Template with placeholders
- `.env.local`: Local development (not committed)
- `.env.vercel`: Vercel-specific (not committed)

## Design System

### Bridge Theme Principles
- **Tone**: Ceremonial, authoritative, mission-clear, no conversational AI language
- **Typography**: Monospace for system messages, sans-serif for content
- **Colors**: Pure black background (#000), white text (#FFF)
- **Protocol Colors**:
  - K (Knowledge): Blue (#0066FF)
  - T (Thesis): Purple (#6a0dad)
  - P (Prioritize): Gold (#FFD700)
  - A (Action): Red (#FF3333)
  - N (Navigation): Green (#00FF00)

### UI/UX Guidelines
- NEVER use browser `alert()` - use shadcn Dialog components instead (per user config)
- Deliberate pacing with animation delays
- No pressure elements (timers, countdowns)
- Clear visual feedback without judgment
- Responsive design for desktop/tablet/mobile

## Content Management

**Primary content file**: `lib/gameData.ts`

Contains:
- `scenarios`: All 5 decision scenarios with options
- `protocolDescriptions`: Profile result descriptions
- `captainsOath`: Oath text array
- `siskoQuote`: Final quote from Captain Sisko

**To modify scenarios**: Edit `scenarios` array in `gameData.ts`
**To change profile descriptions**: Edit `protocolDescriptions` object
**To update translations**: Edit corresponding `messages/*.json` file

## API Endpoints

- `POST /api/waitlist`: Submit waitlist registration
- `POST /api/profile`: Save user profile
- `GET /api/user-id`: Get current user ID
- `POST /api/badge`: Generate captain's badge
- `GET /api/admin/*`: Admin dashboard data (requires auth)

## Deployment Notes

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Build command: `pnpm run build` (includes Prisma generation)
4. Framework preset: Next.js
5. Root directory: `kaptn-onboarding`

### Docker Considerations
- Always use system proxy in Docker images (per user config)
- PostgreSQL runs via docker-compose for local development
- See `docker-compose.yml` for service configuration

### Build Process
- Prisma client generation is included in build script
- Post-install hook runs `prisma generate`
- TypeScript compilation via Next.js build

## Testing & Quality

- **Type checking**: `bunx tsc --noEmit`
- **Linting**: `pnpm run lint`
- **Manual testing**: Complete full onboarding flow locally
- **Database testing**: Use local PostgreSQL via Docker

## Philosophy & Conventions

**What this app is NOT:**
- A personality test
- A gamified quiz
- An evaluation tool

**What this app IS:**
- A decision style mirror
- A ceremonial calibration
- A bridge qualification protocol
- Pattern recognition, not judgment

**Naming conventions:**
- Bridge services: Single word, action-oriented (COMPASS, LEDGER, SHIELD, SONAR)
- Components: PascalCase, descriptive
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE for protocol IDs

## Common Tasks

### Adding a new locale
1. Add locale code to `i18n/config.ts`
2. Create `messages/<locale>.json` with translations
3. Update middleware matcher in `middleware.ts`

### Adding a new scenario
1. Edit `lib/gameData.ts`
2. Add scenario object with id, title, context, options
3. Add profile descriptions to `protocolDescriptions`
4. Update translations in all `messages/*.json` files

### Modifying waitlist services
1. Edit `types/waitlist.ts` → `bridgeServices` array
2. Update UI in `components/Waitlist.tsx`
3. Add translations to `messages/*.json`

### Adding admin features
1. Create API route in `app/api/admin/`
2. Add authentication check using Logto
3. Update `Admin` model in `schema.prisma` if needed
4. Run `bunx prisma migrate dev`

## Important Context

- Package manager is `pnpm` but user prefers `bun`/`uv` for operations (per user config)
- Database is optional - app gracefully handles missing `DATABASE_URL`
- Prisma Accelerate is used in production for serverless performance
- All user-facing text must be internationalized
- Bridge language is critical - maintain ceremonial, system-level precision
- Never break the immersive "bridge activation" metaphor
