# Invite Feature Implementation Plan

## Overview

Enable the bank (admin) to invite other players to view the game's ledger and buy-in information. Invited players get read-only access while the bank retains full control.

## Current State

- All data stored in localStorage (`poker-bank-games` key)
- Single-user experience - only the device running the app can see data
- No backend, no authentication

## Proposed Architecture

### Option A: Supabase Backend (Recommended)

**Why Supabase:**
- Free tier sufficient for this use case
- Built-in real-time subscriptions
- Row-level security for access control
- Easy to set up with Vite/React

**Data Model:**

```sql
-- Games table
create table games (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  bank_payment_info jsonb not null,
  is_settled boolean default false,
  invite_code text unique not null,  -- 6-8 char code for sharing
  admin_token text not null          -- Secret token for bank/admin access
);

-- Players table
create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  name text not null,
  is_bank boolean default false,
  cash_out decimal
);

-- Buy-ins table
create table buy_ins (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  amount decimal not null,
  is_paid boolean default false,
  timestamp timestamptz default now()
);
```

**Access Patterns:**
- Bank creates game → gets `admin_token` stored in localStorage
- Bank shares `invite_code` with players
- Players visit `/poker-bank/view/{invite_code}` → read-only view
- Bank visits `/poker-bank/{game_id}` with `admin_token` in localStorage → full edit access

### Option B: URL-Encoded State (Simpler, No Backend)

Encode game state in URL for sharing. Limited by URL length (~2000 chars).

**Pros:** No backend, instant to implement
**Cons:** Read-only snapshot (no real-time updates), long URLs with many players

**Implementation:**
```typescript
// Encode game to shareable URL
function createShareableLink(game: Game): string {
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(game));
  return `${window.location.origin}/poker-bank/view?data=${compressed}`;
}
```

### Option C: Hybrid Approach

Use a simple KV store (Cloudflare KV, Vercel KV, or Upstash Redis) for lightweight persistence:
- Store games by invite code
- No user auth - just invite codes
- Bank "claims" admin by being first to create the game

---

## Recommended Implementation: Option A (Supabase)

### Phase 1: Backend Setup

1. **Create Supabase project**
   - Set up tables as defined above
   - Configure row-level security policies

2. **Add Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Environment variables**
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```

### Phase 2: Data Migration

1. **Create sync service** (`src/services/supabaseSync.ts`)
   - Functions to create/read/update games in Supabase
   - Keep localStorage as fallback for offline use

2. **Update `usePokerBank` hook**
   - Add option to sync to Supabase when creating game
   - Store `admin_token` in localStorage when creating synced game

### Phase 3: Sharing UI

1. **Add "Share" button in ActiveGame/Ledger**
   - Generate invite link: `https://poker-action-opal.vercel.app/poker-bank/view/{invite_code}`
   - Copy to clipboard
   - Optional: Show QR code for easy mobile sharing

2. **Create share modal component**
   ```tsx
   // src/pages/poker-bank/components/ShareModal.tsx
   - Display invite link
   - Copy button
   - QR code (using qrcode.react library)
   - Web Share API integration for mobile
   ```

### Phase 4: Viewer Route

1. **Create read-only view route** (`/poker-bank/view/:inviteCode`)
   - Fetch game by invite code from Supabase
   - Display ledger and player buy-ins
   - No edit controls
   - Real-time updates via Supabase subscriptions

2. **Create `ViewGame` component**
   - Similar to Ledger but read-only
   - Shows bank payment info prominently
   - Shows all player buy-ins and cash-outs
   - Settlement calculations

### Phase 5: Real-time Updates (Optional Enhancement)

1. **Subscribe to game changes**
   ```typescript
   supabase
     .channel('game-updates')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'games',
       filter: `invite_code=eq.${inviteCode}`
     }, handleUpdate)
     .subscribe()
   ```

2. **Show live updates** to viewers when bank makes changes

---

## UI/UX Considerations

### For Bank (Admin)

- "Share Game" button appears after game is created
- First share prompts to sync to cloud (if using localStorage-only before)
- Show QR code + copyable link
- Indicator showing how many people are viewing

### For Viewers

- Clean, read-only interface
- Clear indication this is a shared view
- Bank's payment info displayed prominently
- Option to "Request update" if data seems stale

---

## File Changes Summary

**New Files:**
- `src/services/supabase.ts` - Supabase client setup
- `src/services/gameSync.ts` - Sync functions
- `src/pages/poker-bank/ViewGame.tsx` - Read-only viewer
- `src/pages/poker-bank/components/ShareModal.tsx` - Share UI

**Modified Files:**
- `src/App.tsx` - Add `/poker-bank/view/:inviteCode` route
- `src/pages/PokerBank.tsx` - Add sync option
- `src/pages/poker-bank/usePokerBank.ts` - Add cloud sync methods
- `src/pages/poker-bank/components/ActiveGame.tsx` - Add share button
- `src/pages/poker-bank/components/Ledger.tsx` - Add share button

**New Dependencies:**
- `@supabase/supabase-js`
- `qrcode.react` (optional, for QR codes)

---

## Security Considerations

1. **Invite codes should be:**
   - Random, unguessable (use `crypto.randomUUID()` or similar)
   - Not sequential or predictable

2. **Admin tokens:**
   - Stored only in localStorage of bank's device
   - Used to verify edit permissions
   - Not exposed in URLs or shared data

3. **Row-level security:**
   - Anyone with invite code can read
   - Only requests with valid admin token can write

---

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Supabase** | Real-time, scalable, free tier | Adds dependency, needs account setup |
| **URL encoding** | No backend, instant | No real-time, URL length limits |
| **Firebase** | Similar to Supabase | Requires Google account |
| **Custom backend** | Full control | More work, hosting costs |
| **Peer-to-peer (WebRTC)** | No server | Complex, requires all users online |

---

## Estimated Effort

- Phase 1 (Backend setup): 2-3 hours
- Phase 2 (Data migration): 3-4 hours
- Phase 3 (Sharing UI): 2-3 hours
- Phase 4 (Viewer route): 3-4 hours
- Phase 5 (Real-time): 2-3 hours

**Total: ~15 hours** for full implementation with real-time updates
