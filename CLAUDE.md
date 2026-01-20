# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Build
npm run build        # TypeScript check + Vite build (tsc -b && vite build)

# Lint
npm run lint         # ESLint

# Preview production build
npm run preview      # Preview built app
```

## Architecture

This is a React 19 + TypeScript + Vite application for live poker game management, deployed on Vercel.

### Two Main Features

1. **Poker Clock** (`/poker-clock`) - Timer with penalties for slow play
2. **Poker Bank** (`/poker-bank`) - Buy-in/cash-out tracking with settlement calculations

### Key Patterns

**State Management:**
- Custom hooks encapsulate all business logic (`useGameState`, `useTimer`, `usePokerBank`)
- No external state library - uses React hooks + localStorage for persistence
- Immutable state updates throughout

**Poker Clock State Flow:**
- `useGameState` manages players, current street, penalties, and betting round completion
- `useTimer` handles elapsed time with pause support
- Actions (check/call, raise, fold) trigger penalty calculation + state transitions
- Streets progress: preflop → flop → turn → river, with explicit "begin street" step between

**Poker Bank Persistence:**
- Games stored in localStorage under `poker-bank-games` key
- `usePokerBank` hook handles all CRUD operations
- Settlement calculation in `src/pages/poker-bank/settlement.ts`

**Position Logic:**
- `src/utils/positions.ts` - Defines poker positions for 2-9 players
- Handles straddle shifts (single/double/triple affect first-to-act preflop)
- Post-flop action always starts from SB position

### Type Definitions

- `src/types/index.ts` - Poker Clock types (Player, GameState, Street, TimeStructure)
- `src/pages/poker-bank/types.ts` - Poker Bank types (Game, Player, BuyIn, Settlement)

Note: Both features have a `Player` type but they are different - Clock's Player has position/folded status, Bank's Player has buyIns/cashOut.
