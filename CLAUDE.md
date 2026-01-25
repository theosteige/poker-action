# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

**Union Poker** — A web app for managing university poker games with buy-in tracking, settlements, chat, and stats.

See `PRD.md` for full requirements and `plan.md` for implementation tasks.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (port 3000)

# Build
npm run build        # Production build

# Lint
npm run lint         # ESLint

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open database GUI

# Testing
npm run test         # Run unit tests (vitest)
```

## Tech Stack

- **Frontend/Backend:** Next.js 14+ (App Router) with TypeScript
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Real-time:** Supabase Realtime (for chat)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (free tier)

## Key Patterns

**Immutability:** Always create new objects, never mutate existing state.

**Validation:** Use Zod schemas for all user input validation.

**File Organization:** Many small files over few large files. Keep under 400 lines.

**Error Handling:** Handle errors at API boundaries, show user-friendly messages.

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components organized by feature
├── contexts/      # React contexts (AuthContext)
├── hooks/         # Custom hooks (useAuth, useChat)
└── lib/           # Utilities, database functions, validation schemas
    ├── db/        # Database query functions
    └── validations/  # Zod schemas
```

## Database Models

- **User:** displayName, passwordHash, paymentHandles (Venmo/Zelle/Cash)
- **Game:** host, scheduledTime, location, bigBlindAmount, status, inviteCode
- **GamePlayer:** links users to games
- **BuyIn:** amount, paidToBank status, approval status
- **CashOut:** final chip amount when leaving
- **ChatMessage:** global chat messages

## Settlement Logic

The bank tracks both chip ledger AND cash flow:
```
settlement = cashOut - unpaidBuyIns
If settlement > 0: bank owes player
If settlement < 0: player owes bank
```

See `src/lib/settlement.ts` for implementation.
