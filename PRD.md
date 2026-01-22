# Product Requirements Document: Poker Hub

## Overview

Poker Hub is a web application designed to serve as a central management platform for university poker games. It enables players to organize games, track buy-ins and cash-outs, settle debts, and maintain a community through persistent chat and lifetime statistics.

### Objectives

- Simplify poker game organization and money tracking
- Eliminate confusion around who owes whom after games
- Build a sense of community among university poker players
- Provide transparency through ledgers and settlement calculations
- Maintain zero to minimal hosting costs for personal use

### Target Audience

- University students who play regular poker games
- Friend groups needing a centralized way to track poker finances
- Casual poker players who want easy game coordination

---

## Core Features

### 1. User Authentication

**Description**: Simple account system with payment handle integration.

**Requirements**:
- Users register with:
  - Display name (shown in games and chat)
  - Password
  - One or more payment handles (Venmo username, Zelle identifier, or "Cash only")
- No email required (keeps it simple, avoids third-party email services)
- Payment handles visible to other players in shared games

**Acceptance Criteria**:
- User can create account with display name and password
- User can add/edit/remove payment handles (Venmo, Zelle, Cash only)
- User can log in and maintain persistent session
- No email verification or third-party OAuth required

**Technical Considerations**:
- Password hashing with bcrypt or Argon2
- JWT or session-based authentication
- Store payment handles as JSON array: `[{ type: "venmo" | "zelle" | "cash", handle: string }]`

---

### 2. Game Room Management

**Description**: Create and join poker game sessions with invite links.

**Requirements**:
- Host creates a game with:
  - Game time (date and time)
  - Location (text field)
  - Big blind amount (number)
- Host automatically becomes the "bank" for that game
- Shareable invite link generated for each game
- Players must have an account to join via link
- Game states: `upcoming` → `active` → `completed`

**Acceptance Criteria**:
- Host can create game with time, location, BB amount
- System generates unique invite link (e.g., `/game/abc123`)
- Players with accounts can join via link
- Game shows list of joined players
- Host (bank) has admin controls; players have view/request access

**Data Model**:
```typescript
interface Game {
  id: string
  hostId: string // Also the bank
  title?: string
  scheduledTime: Date
  location: string
  bigBlindAmount: number
  status: 'upcoming' | 'active' | 'completed'
  inviteCode: string
  createdAt: Date
}

interface GamePlayer {
  gameId: string
  playerId: string
  joinedAt: Date
}
```

---

### 3. Bank & Ledger System

**Description**: The bank (host) tracks all money flow with settlement calculations.

**Requirements**:

**Buy-ins**:
- Bank can directly add buy-ins for any player
- Players can request buy-ins (bank approves/denies)
- Each buy-in tracks:
  - Amount
  - Whether player has paid the bank (cash handed over)
  - Timestamp

**Cash-outs**:
- Bank enters cash-out amount when player leaves
- Player can only have one cash-out per game

**Settlement Calculation**:
- For each player, calculate: `settlement = cashOut - (unpaid buy-ins)`
- If settlement > 0: bank owes player
- If settlement < 0: player owes bank
- Display shows who owes whom and how much

**Game Completion**:
- Game automatically marked complete when all players are cashed out
- Ledger remains viewable in game history

**Acceptance Criteria**:
- Bank can add buy-in for any player with amount and paid status
- Player can request buy-in; bank sees pending requests and can approve/deny
- Bank can mark buy-ins as paid/unpaid at any time
- Bank can enter cash-out amount for players
- Ledger displays real-time settlement: each player's +/-, who owes whom
- Game completes when all active players have cashed out

**Data Model**:
```typescript
interface BuyIn {
  id: string
  gameId: string
  playerId: string
  amount: number
  paidToBank: boolean
  requestedByPlayer: boolean
  approved: boolean
  timestamp: Date
}

interface CashOut {
  gameId: string
  playerId: string
  amount: number
  timestamp: Date
}
```

**Settlement Algorithm**:
```typescript
// For each player in game:
const totalBuyIns = sum of all approved buy-in amounts
const unpaidBuyIns = sum of buy-ins where paidToBank = false
const cashOut = player's cash-out amount (0 if not cashed out)

const netChips = cashOut - totalBuyIns        // +/- in chips
const settlement = cashOut - unpaidBuyIns     // What bank owes (or is owed)

// If settlement > 0: bank owes player this amount
// If settlement < 0: player owes bank abs(settlement)
```

---

### 4. Site-Wide Chat

**Description**: Persistent chat room for the poker community.

**Requirements**:
- Single global chat room for all registered users
- Real-time message delivery
- Messages persist and are viewable on return
- Display: sender's display name, message, timestamp

**Acceptance Criteria**:
- Any logged-in user can send messages to global chat
- Messages appear in real-time for all connected users
- Chat history persists and loads on page visit
- Messages show display name and timestamp

**Technical Considerations**:
- Use WebSocket connection (Socket.io) or Supabase Realtime
- Paginate chat history (load last 100 messages, load more on scroll)
- Consider rate limiting to prevent spam

**Data Model**:
```typescript
interface ChatMessage {
  id: string
  userId: string
  displayName: string // Denormalized for performance
  content: string
  createdAt: Date
}
```

---

### 5. Statistics & Leaderboard

**Description**: Personal stats dashboard and public leaderboard.

**Requirements**:

**Personal Stats** (private, only visible to the user):
- Total net profit/loss (all-time)
- Average buy-in amount
- Number of games played
- Win/loss record (games ended positive vs negative)

**Public Leaderboard**:
- Top 3 biggest winners (highest all-time profit)
- Top 3 biggest losers (lowest all-time, i.e., biggest loss)
- Display names and amounts

**Acceptance Criteria**:
- User can view their own stats on a dashboard/profile page
- Stats update automatically when games complete
- Public leaderboard visible to all logged-in users
- Leaderboard updates in real-time or on game completion

**Technical Considerations**:
- Calculate stats on-demand from game history, or maintain running totals
- Running totals more performant but require careful updates

---

### 6. Game History

**Description**: View past games and their ledgers.

**Requirements**:
- Users can see list of all games they participated in
- Each past game shows:
  - Date, location, BB amount
  - Full ledger (all players' +/-, settlements)
  - Final paid/owed status
- Games sorted by date (most recent first)

**Acceptance Criteria**:
- User sees list of their past games on profile/history page
- Clicking a game shows full ledger details
- Ledger is read-only for completed games

---

## Technical Architecture

### Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14+ (App Router) | React + TypeScript, SSR, API routes built-in |
| Backend | Next.js API Routes | No separate backend needed, simplifies deployment |
| Database | PostgreSQL via Supabase | Free tier, includes realtime subscriptions |
| Real-time | Supabase Realtime | WebSocket alternative, no extra service, included free |
| Auth | Custom (or Supabase Auth) | Simple username/password, JWT sessions |
| Hosting | Vercel | Free tier, optimized for Next.js |
| ORM | Prisma | Type-safe database access, works great with TypeScript |

### Why This Stack

- **All TypeScript**: Frontend, backend, and database queries in one language
- **Zero cost**: Vercel free tier + Supabase free tier = $0/month for personal use
- **No third-party services**: No email providers, no external auth, no paid real-time services
- **Supabase Realtime**: Provides WebSocket-like functionality for chat without separate infrastructure

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  displayName   String
  passwordHash  String
  paymentHandles Json     // [{ type: "venmo" | "zelle" | "cash", handle: string }]
  createdAt     DateTime  @default(now())

  hostedGames   Game[]    @relation("GameHost")
  gamePlayers   GamePlayer[]
  buyIns        BuyIn[]
  cashOuts      CashOut[]
  chatMessages  ChatMessage[]
}

model Game {
  id              String    @id @default(cuid())
  host            User      @relation("GameHost", fields: [hostId], references: [id])
  hostId          String
  scheduledTime   DateTime
  location        String
  bigBlindAmount  Decimal
  status          String    @default("upcoming") // upcoming, active, completed
  inviteCode      String    @unique @default(cuid())
  createdAt       DateTime  @default(now())

  players         GamePlayer[]
  buyIns          BuyIn[]
  cashOuts        CashOut[]
}

model GamePlayer {
  game      Game     @relation(fields: [gameId], references: [id])
  gameId    String
  player    User     @relation(fields: [playerId], references: [id])
  playerId  String
  joinedAt  DateTime @default(now())

  @@id([gameId, playerId])
}

model BuyIn {
  id                String   @id @default(cuid())
  game              Game     @relation(fields: [gameId], references: [id])
  gameId            String
  player            User     @relation(fields: [playerId], references: [id])
  playerId          String
  amount            Decimal
  paidToBank        Boolean  @default(false)
  requestedByPlayer Boolean  @default(false)
  approved          Boolean  @default(true)
  timestamp         DateTime @default(now())
}

model CashOut {
  game      Game     @relation(fields: [gameId], references: [id])
  gameId    String
  player    User     @relation(fields: [playerId], references: [id])
  playerId  String
  amount    Decimal
  timestamp DateTime @default(now())

  @@id([gameId, playerId])
}

model ChatMessage {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  content   String
  createdAt DateTime @default(now())
}
```

---

## UI/UX Design Principles

### Overall Aesthetic
- Clean and minimal
- High contrast for readability during games
- Mobile-responsive (used on phones at the poker table)
- Fast load times, minimal animations

### Key Screens

1. **Landing/Login Page**
   - Simple login form
   - Link to register

2. **Dashboard (Home)**
   - Upcoming games you've joined
   - Quick stats summary
   - Link to create new game
   - Global chat sidebar or tab

3. **Create Game**
   - Form: date/time picker, location input, BB amount
   - Generate and display invite link

4. **Game Room**
   - Player list with buy-in totals and paid status
   - Live ledger showing +/- and settlements
   - Bank controls (if user is host): add buy-in, approve requests, cash out players
   - Player controls: request buy-in, view payment handles

5. **Profile/Stats**
   - Personal statistics
   - Payment handle management
   - Game history list

6. **Leaderboard**
   - Top 3 winners
   - Top 3 losers

7. **Chat**
   - Full-page or sidebar chat view
   - Message list with timestamps
   - Input field at bottom

---

## Security Considerations

- **Password Storage**: Hash with bcrypt (min 10 rounds) or Argon2
- **Session Management**: HTTP-only cookies or secure JWT storage
- **Input Validation**: Validate all inputs server-side (use Zod schemas)
- **Authorization**: Verify user is game host before allowing bank actions
- **SQL Injection**: Use Prisma ORM (parameterized queries by default)
- **XSS Prevention**: React escapes by default; sanitize any raw HTML if used
- **Rate Limiting**: Apply to login attempts and chat messages

---

## Development Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js, TypeScript, Prisma, Supabase)
- [ ] Database schema and migrations
- [ ] User registration and login
- [ ] Basic UI layout and navigation

### Phase 2: Game Management
- [ ] Create game flow
- [ ] Invite link generation and joining
- [ ] Game room UI with player list
- [ ] Bank controls: add buy-ins, mark as paid

### Phase 3: Ledger & Settlement
- [ ] Buy-in request flow (player requests, bank approves)
- [ ] Cash-out functionality
- [ ] Settlement calculation algorithm
- [ ] Ledger display showing who owes whom
- [ ] Auto-complete game when all cashed out

### Phase 4: Chat
- [ ] Supabase Realtime subscription setup
- [ ] Chat UI component
- [ ] Message persistence and history loading

### Phase 5: Stats & History
- [ ] Personal stats calculation and display
- [ ] Game history page
- [ ] Public leaderboard (top 3 winners/losers)

### Phase 6: Polish
- [ ] Mobile responsiveness
- [ ] Error handling and loading states
- [ ] Edge cases (player leaves mid-game, etc.)
- [ ] Performance optimization

---

## Potential Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Real-time updates without paid services | Use Supabase Realtime (included in free tier) |
| Settlement calculation complexity | Implement clear algorithm; unit test edge cases |
| User forgets password (no email) | Accept this limitation, or add optional email field for recovery later |
| Chat spam | Implement rate limiting (e.g., max 5 messages per 10 seconds) |
| Data consistency during cash-out | Use database transactions when marking game complete |
| Free tier limits | Supabase free tier: 500MB DB, 2GB bandwidth—sufficient for personal use |

---

## Future Expansion Possibilities

- **Multiple poker groups**: Separate communities with their own leaderboards
- **Game types**: Support for tournaments, different poker variants
- **Notifications**: Browser push notifications for game reminders
- **Advanced stats**: Graphs, trends, session history charts
- **Mobile app**: PWA or native app if usage grows
- **Recurring games**: Schedule weekly games automatically
- **Settle-up integration**: Deep links to Venmo/Zelle apps

---

## Cost Analysis

| Service | Free Tier Limits | Expected Usage | Cost |
|---------|------------------|----------------|------|
| Vercel | 100GB bandwidth, serverless functions | Personal use with friends | $0 |
| Supabase | 500MB database, 2GB bandwidth, 50K monthly active users | ~10-20 users, small data | $0 |
| Domain (optional) | N/A | poker.yourdomain.com | ~$10-15/year |

**Total estimated cost: $0/month** (optional ~$12/year for custom domain)

---

## Glossary

- **Bank**: The game host who manages all money transactions
- **Buy-in**: Money/chips a player adds to their stack
- **Cash-out**: Converting chips back to money value when leaving
- **Settlement**: The final calculation of who owes whom
- **BB**: Big blind—the larger of two forced bets in poker
- **Ledger**: Record of all transactions and final standings

---

*Generated for personal use at university poker games. Optimized for zero hosting costs.*
