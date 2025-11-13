# CLAUDE.md

## Project Overview

OP Atlas is a Next.js application that serves as the home of Optimism Contributors. It enables users to:
- Create and manage project profiles for RetroPGF (Retroactive Public Goods Funding)
- Apply for grants and funding rounds
- Manage team organizations and citizenship status
- Track rewards and attestations on the Optimism Superchain

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with Privy for Web3 auth (wallets, Farcaster, email)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3**: Viem, Wagmi for blockchain interactions
- **Attestations**: Ethereum Attestation Service (EAS) SDK
- **Monitoring**: Sentry, OpenTelemetry, PostHog analytics

## Development Commands

```bash
# Install dependencies (requires pnpm >=9)
pnpm install

# Start development server
cd app && pnpm dev
# OR from root:
pnpm app:dev

# Database commands
cd app
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations in dev
pnpm db:push        # Push schema changes
pnpm studio         # Open Prisma Studio GUI

# Code quality
pnpm lint           # Run ESLint
pnpm lint:fix       # Fix linting issues
pnpm format         # Format with Prettier

# Testing
pnpm test           # Run Jest tests

# Build for production
pnpm build

# GraphQL code generation (runs automatically with dev/build)
pnpm graphql:generate
```

## Architecture

### Directory Structure
- `app/` - Main Next.js application
  - `src/app/` - App Router pages and API routes
  - `src/components/` - Reusable React components
  - `src/db/` - Database queries and Prisma client
  - `src/hooks/` - Custom React hooks for data fetching
  - `src/lib/` - Utility functions and external API clients
  - `src/providers/` - React context providers
  - `prisma/` - Database schema and migrations
  - `public/` - Static assets

### Key Patterns

**Authentication Flow**: The app uses Privy for Web3 authentication, which creates sessions via NextAuth. User data is stored in PostgreSQL with addresses linked via `UserAddress` table.

**Data Fetching**: Server components use direct database queries via Prisma. Client components use custom hooks in `src/hooks/` that call server actions in `src/lib/actions/`.

**Attestations**: The app integrates with EAS for on-chain attestations (citizenship, badgeholder status). There's also an EAS indexer in `eas-indexer/` using Ponder framework.

**Multi-chain Support**: Projects can have contracts across multiple chains. Chain configurations are in `src/components/common/chain.ts`.

## Database Schema

Key models:
- `User` - Core user profile with linked addresses, emails, projects
- `Project` - Project profiles for RetroPGF applications  
- `Organization` - Team organizations that own projects
- `FundingRound` - RetroPGF rounds with applications
- `Reward` - Reward distributions with claiming logic
- `Citizen` - Citizenship attestation tracking

## API Integration Points

- **GitHub API**: User verification, repository fetching
- **Farcaster/Neynar**: Social profile data
- **OSO (Open Source Observer)**: Project metrics and contract verification
- **Superfluid**: Streaming reward payments
- **Persona/World ID**: KYC verification
- **Mailchimp**: Email list management

## Testing

Tests use Jest with TypeScript. Test files follow `*.test.ts` pattern. Key test utilities:
- Mock Prisma client for database tests
- Test reward calculation logic in `src/lib/utils/rewards.test.ts`

## Environment Variables

Required environment variables are documented in `.env.example`. Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication
- `GOOGLE_APPLICATION_CREDENTIALS` - GCS uploads
- Various API keys for external services
