# Project Plan: Union Poker

## Overview
A web application for managing university poker games. Users can create game rooms, track buy-ins/cash-outs with a bank system, settle debts automatically, chat in a community room, and view lifetime statistics.

**Reference:** `PRD.md`, `fontend-design-SAAS.md`

**Tech Stack:**
- Frontend/Backend: Next.js 14+ (App Router) with TypeScript
- Database: PostgreSQL via Supabase
- Real-time: Supabase Realtime (for chat)
- ORM: Prisma
- Hosting: Vercel (free tier)
- Styling: Tailwind CSS (clean, minimal UI)

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize Next.js project with TypeScript and core dependencies",
    "steps": [
      "Create new Next.js 14 project with App Router: npx create-next-app@latest poker-hub --typescript --tailwind --eslint --app --src-dir",
      "Install Prisma and initialize: npm install prisma @prisma/client && npx prisma init",
      "Install Supabase client: npm install @supabase/supabase-js",
      "Install authentication dependencies: npm install bcryptjs jsonwebtoken && npm install -D @types/bcryptjs @types/jsonwebtoken",
      "Install form/validation libraries: npm install zod react-hook-form @hookform/resolvers",
      "Install date utilities: npm install date-fns",
      "Create .env.local file with placeholders: DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, JWT_SECRET",
      "Verify project runs with npm run dev"
    ],
    "passes": true
  },
  {
    "category": "setup",
    "description": "Set up Supabase project and configure database connection",
    "steps": [
      "Create new Supabase project at supabase.com (free tier)",
      "Copy DATABASE_URL (connection pooling) and DIRECT_URL (direct connection) from Supabase dashboard > Settings > Database",
      "Copy SUPABASE_URL and SUPABASE_ANON_KEY from Supabase dashboard > Settings > API",
      "Update .env.local with actual values",
      "Generate a random JWT_SECRET (use: openssl rand -base64 32)",
      "Create src/lib/supabase.ts with Supabase client initialization using createClient from @supabase/supabase-js",
      "Test database connection by running npx prisma db pull (should connect without error)"
    ],
    "passes": true
  },
  {
    "category": "database",
    "description": "Create Prisma schema with all data models",
    "steps": [
      "Open prisma/schema.prisma and set provider to postgresql",
      "Add User model: id (cuid), displayName (String), passwordHash (String), paymentHandles (Json), createdAt (DateTime)",
      "Add Game model: id (cuid), hostId (String, relation to User), scheduledTime (DateTime), location (String), bigBlindAmount (Decimal), status (String, default 'upcoming'), inviteCode (String, unique, default cuid), createdAt (DateTime)",
      "Add GamePlayer model: gameId + playerId composite primary key, joinedAt (DateTime)",
      "Add BuyIn model: id (cuid), gameId, playerId, amount (Decimal), paidToBank (Boolean, default false), requestedByPlayer (Boolean, default false), approved (Boolean, default true), timestamp (DateTime)",
      "Add CashOut model: gameId + playerId composite primary key, amount (Decimal), timestamp (DateTime)",
      "Add ChatMessage model: id (cuid), userId, content (String), createdAt (DateTime)",
      "Add all relations between models as specified in PRD.md",
      "Run npx prisma migrate dev --name init to create tables",
      "Run npx prisma generate to generate Prisma client"
    ],
    "passes": true
  },
  {
    "category": "database",
    "description": "Create Prisma client singleton and database utility functions",
    "steps": [
      "Create src/lib/prisma.ts with singleton pattern to prevent multiple Prisma instances in development",
      "Export prisma client instance for use across the app",
      "Create src/lib/db/users.ts with functions: createUser, getUserByDisplayName, getUserById, updateUserPaymentHandles",
      "Create src/lib/db/games.ts with functions: createGame, getGameByInviteCode, getGameById, getGamesByUserId, updateGameStatus",
      "Create src/lib/db/game-players.ts with functions: addPlayerToGame, getPlayersInGame, isPlayerInGame",
      "Create src/lib/db/buy-ins.ts with functions: createBuyIn, getBuyInsForGame, approveBuyIn, markBuyInAsPaid, getPendingBuyInRequests",
      "Create src/lib/db/cash-outs.ts with functions: createCashOut, getCashOutsForGame, hasPlayerCashedOut",
      "Create src/lib/db/chat.ts with functions: createMessage, getRecentMessages (paginated)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement user authentication - registration and login",
    "steps": [
      "Create src/lib/auth.ts with functions: hashPassword (bcrypt), verifyPassword, generateToken (JWT), verifyToken",
      "Create Zod schemas in src/lib/validations/auth.ts: registerSchema (displayName, password, confirmPassword), loginSchema (displayName, password)",
      "Create API route POST /api/auth/register: validate input, check displayName uniqueness, hash password, create user, return JWT token",
      "Create API route POST /api/auth/login: validate input, find user by displayName, verify password, return JWT token",
      "Create API route GET /api/auth/me: verify JWT from cookie/header, return current user data",
      "Create API route POST /api/auth/logout: clear auth cookie",
      "Create src/hooks/useAuth.ts hook: manages auth state, provides login/logout/register functions, stores token in httpOnly cookie",
      "Create src/contexts/AuthContext.tsx: provides auth state to entire app, checks for existing session on mount"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create authentication UI components and pages",
    "steps": [
      "Create src/components/ui/Input.tsx: styled input component with label, error state, Tailwind classes",
      "Create src/components/ui/Button.tsx: styled button with variants (primary, secondary, danger), loading state",
      "Create src/components/ui/Card.tsx: container component with padding and shadow",
      "Create src/components/auth/LoginForm.tsx: form with displayName, password fields, uses react-hook-form + zod validation",
      "Create src/components/auth/RegisterForm.tsx: form with displayName, password, confirmPassword fields, validation",
      "Create src/app/login/page.tsx: login page with LoginForm, link to register",
      "Create src/app/register/page.tsx: register page with RegisterForm, link to login",
      "Create src/middleware.ts: protect routes, redirect unauthenticated users to /login, redirect authenticated users away from /login and /register"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement payment handles management",
    "steps": [
      "Create Zod schema in src/lib/validations/payment-handles.ts: paymentHandleSchema (type: 'venmo' | 'zelle' | 'cash', handle: string)",
      "Create API route PUT /api/users/payment-handles: update current user's payment handles array",
      "Create src/components/profile/PaymentHandlesForm.tsx: form to add/edit/remove payment handles, supports multiple handles",
      "Display payment handles on user profile page",
      "Show other players' payment handles in game room (only for players in same game)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create main layout and navigation components",
    "steps": [
      "Create src/components/layout/Header.tsx: logo/title, navigation links (Dashboard, Leaderboard, Chat), user menu with logout",
      "Create src/components/layout/Sidebar.tsx: navigation for mobile, slides in from left",
      "Create src/components/layout/MainLayout.tsx: combines Header, main content area, handles responsive layout",
      "Create src/app/layout.tsx: root layout with AuthProvider, MainLayout wrapper",
      "Create src/app/page.tsx: landing page, redirects to /dashboard if authenticated, shows login/register buttons if not",
      "Add Tailwind configuration for clean, minimal design: neutral colors, good contrast, readable typography"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement dashboard page",
    "steps": [
      "Create API route GET /api/games: returns user's games (both hosted and joined), sorted by scheduledTime",
      "Create src/components/dashboard/GameCard.tsx: displays game info (time, location, BB, status, player count), link to game room",
      "Create src/components/dashboard/UpcomingGames.tsx: list of upcoming games user has joined",
      "Create src/components/dashboard/QuickStats.tsx: shows user's total +/-, games played (fetches from stats API)",
      "Create src/app/dashboard/page.tsx: main dashboard with UpcomingGames, QuickStats, 'Create Game' button",
      "Add empty state for users with no games yet"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement game creation flow",
    "steps": [
      "Create Zod schema in src/lib/validations/game.ts: createGameSchema (scheduledTime, location, bigBlindAmount)",
      "Create API route POST /api/games: create game with current user as host, generate unique inviteCode, return game with invite link",
      "Create src/components/game/CreateGameForm.tsx: form with datetime picker, location input, BB amount input",
      "Create src/app/games/new/page.tsx: page with CreateGameForm",
      "After creation, show modal/page with shareable invite link (copy to clipboard button)",
      "Invite link format: {baseUrl}/games/join/{inviteCode}"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement game joining flow",
    "steps": [
      "Create API route GET /api/games/join/[inviteCode]: returns game info if valid invite code",
      "Create API route POST /api/games/join/[inviteCode]: adds current user to game if not already joined",
      "Create src/app/games/join/[inviteCode]/page.tsx: shows game details, 'Join Game' button, or 'Already Joined' message",
      "After joining, redirect to game room page",
      "Handle edge cases: invalid invite code (404), game already completed (show message), user already in game (redirect to game room)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement game room page - player view",
    "steps": [
      "Create API route GET /api/games/[gameId]: returns full game data with players, buy-ins, cash-outs, calculated settlements",
      "Create src/lib/settlement.ts: calculateSettlement function that computes each player's +/- and who owes whom (accounting for paid/unpaid buy-ins as specified in PRD)",
      "Create src/components/game/PlayerList.tsx: displays all players with their total buy-ins, cash-out amount, net +/-, settlement status",
      "Create src/components/game/Ledger.tsx: shows who owes whom money with amounts, displays payment handles for easy settling",
      "Create src/components/game/GameInfo.tsx: displays game time, location, BB amount, status",
      "Create src/app/games/[gameId]/page.tsx: game room page combining all components",
      "Add 'Request Buy-In' button for players (not host)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement game room page - bank (host) controls",
    "steps": [
      "Create src/components/game/BankControls.tsx: only visible to host, contains all bank actions",
      "Add 'Add Buy-In' form: select player dropdown, amount input, paid checkbox, creates buy-in directly",
      "Create API route POST /api/games/[gameId]/buy-ins: creates buy-in (host only, or player request)",
      "Add pending buy-in requests list: shows player requests with approve/deny buttons",
      "Create API route PATCH /api/games/[gameId]/buy-ins/[buyInId]: approve/deny request, or mark as paid",
      "Add 'Cash Out Player' form: select player dropdown, amount input",
      "Create API route POST /api/games/[gameId]/cash-outs: creates cash-out for player (host only)",
      "Add 'Mark as Paid' toggle for each buy-in entry",
      "Automatically update game status to 'completed' when all players have cashed out"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement buy-in request flow for players",
    "steps": [
      "Create src/components/game/RequestBuyInForm.tsx: simple form with amount input",
      "When player submits: creates buy-in with requestedByPlayer=true, approved=false",
      "Show pending requests to the player with 'Pending' status",
      "When host approves: update approved=true, buy-in becomes active",
      "When host denies: delete the buy-in request",
      "Notify player of approval/denial (can be simple UI update on page refresh, or real-time with Supabase)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement settlement calculation and display",
    "steps": [
      "In src/lib/settlement.ts, implement full settlement algorithm from PRD:",
      "  - For each player: totalBuyIns = sum of approved buy-ins",
      "  - unpaidBuyIns = sum of buy-ins where paidToBank = false",
      "  - netChips = cashOut - totalBuyIns (their +/- in the game)",
      "  - settlement = cashOut - unpaidBuyIns (what bank owes or is owed)",
      "  - If settlement > 0: bank owes player this amount",
      "  - If settlement < 0: player owes bank abs(settlement)",
      "Create src/components/game/SettlementView.tsx: displays settlement in clear format",
      "Show each player's row: name, total buy-in, cash-out, net +/-, settlement amount, owes/owed status",
      "At bottom, show simplified 'Who Pays Whom' list with payment handle links",
      "Write unit tests for settlement calculation covering edge cases"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement real-time chat with Supabase",
    "steps": [
      "Enable Realtime on chat_messages table in Supabase dashboard (or via SQL: alter publication supabase_realtime add table chat_messages)",
      "Create src/hooks/useChat.ts: subscribes to Supabase Realtime channel for chat_messages inserts",
      "Create API route POST /api/chat: creates new chat message, validates content length",
      "Create API route GET /api/chat: returns paginated chat history (last 100 messages, with cursor for 'load more')",
      "Create src/components/chat/ChatMessage.tsx: displays single message with displayName, content, timestamp",
      "Create src/components/chat/ChatInput.tsx: text input with send button, handles Enter key",
      "Create src/components/chat/ChatRoom.tsx: combines message list and input, auto-scrolls on new messages",
      "Create src/app/chat/page.tsx: full-page chat view",
      "Add rate limiting: max 5 messages per 10 seconds per user"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement personal statistics",
    "steps": [
      "Create API route GET /api/stats/me: calculates and returns current user's stats",
      "Calculate from completed games: total net +/- (sum of all settlements), average buy-in, games played, games won (positive net), games lost (negative net)",
      "Create src/components/stats/PersonalStats.tsx: displays all personal statistics in clean cards",
      "Create src/app/profile/page.tsx: shows PersonalStats, PaymentHandlesForm, account info",
      "Consider caching stats or storing running totals for performance (optional optimization)"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement public leaderboard",
    "steps": [
      "Create API route GET /api/leaderboard: returns top 3 winners and top 3 losers by all-time net profit/loss",
      "Query all users, calculate their total net from completed games, sort and return top/bottom 3",
      "Create src/components/leaderboard/WinnersBoard.tsx: displays top 3 winners with rank, displayName, total profit",
      "Create src/components/leaderboard/LosersBoard.tsx: displays top 3 losers with rank, displayName, total loss",
      "Create src/app/leaderboard/page.tsx: shows both boards side by side",
      "Style with appropriate colors (green for winners, red for losers)",
      "Handle edge case: fewer than 3 users with completed games"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement game history",
    "steps": [
      "Create API route GET /api/games/history: returns user's completed games with full ledger data",
      "Create src/components/history/GameHistoryCard.tsx: shows game date, location, BB, player count, user's net +/-",
      "Create src/components/history/GameHistoryList.tsx: paginated list of past games",
      "Clicking a game card navigates to /games/[gameId] (same game room page, but read-only for completed games)",
      "Add 'History' tab/section to profile page or create src/app/history/page.tsx",
      "In game room, disable all actions if game status is 'completed', show ledger as read-only"
    ],
    "passes": true
  },
  {
    "category": "polish",
    "description": "Implement responsive design and mobile optimization",
    "steps": [
      "Review all pages on mobile viewport (375px width)",
      "Ensure navigation works on mobile: hamburger menu or bottom nav",
      "Make game room usable on phone: stack player list and controls vertically",
      "Ensure forms are touch-friendly: large tap targets, appropriate input types",
      "Test chat on mobile: input should not be covered by keyboard",
      "Add proper viewport meta tag and prevent zoom on input focus if desired",
      "Test on actual mobile device or thorough browser dev tools emulation"
    ],
    "passes": true
  },
  {
    "category": "polish",
    "description": "Add loading states and error handling",
    "steps": [
      "Create src/components/ui/Spinner.tsx: loading spinner component",
      "Create src/components/ui/ErrorMessage.tsx: displays error messages consistently",
      "Add loading states to all data-fetching components (show spinner while loading)",
      "Add error boundaries for critical sections",
      "Handle API errors gracefully: show user-friendly messages, don't expose internal errors",
      "Add toast notifications for actions: 'Buy-in added', 'Player cashed out', etc. (use simple custom toast or react-hot-toast)",
      "Handle network errors: show retry button when appropriate"
    ],
    "passes": true
  },
  {
    "category": "polish",
    "description": "Handle edge cases and game state transitions",
    "steps": [
      "Handle player leaving mid-game: they remain in player list, can be cashed out by bank",
      "Prevent duplicate cash-outs: check if player already cashed out before allowing",
      "Validate buy-in/cash-out amounts: must be positive numbers, reasonable limits",
      "Handle game time in different timezones: store in UTC, display in user's local time",
      "Add confirmation dialogs for destructive actions: cash-out, deny buy-in request",
      "Prevent bank from cashing themselves out until last (or handle self-settlement)",
      "Test game completion logic: only mark complete when ALL players cashed out"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Write unit tests for critical business logic",
    "steps": [
      "Install testing dependencies: npm install -D vitest @testing-library/react @testing-library/jest-dom",
      "Configure vitest in vitest.config.ts",
      "Write tests for settlement calculation: basic cases, unpaid buy-ins, multiple buy-ins, edge cases",
      "Write tests for auth utilities: password hashing, JWT token generation/verification",
      "Write tests for validation schemas: ensure invalid inputs are rejected",
      "Write tests for game state transitions: upcoming -> active -> completed",
      "Aim for high coverage on src/lib/* files"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Manual end-to-end testing",
    "steps": [
      "Test full user flow: register -> create game -> share link -> another user joins",
      "Test bank flow: add buy-ins, approve requests, mark as paid, cash out players",
      "Test settlement display: verify calculations match expected values",
      "Test chat: send messages, verify real-time delivery, check history loads",
      "Test stats: play multiple games, verify stats update correctly",
      "Test leaderboard: verify top 3 winners/losers display correctly",
      "Test on multiple browsers: Chrome, Firefox, Safari",
      "Test auth edge cases: wrong password, duplicate displayName"
    ],
    "passes": true
  },
  {
    "category": "deployment",
    "description": "Deploy to Vercel",
    "steps": [
      "Push code to GitHub repository",
      "Connect repository to Vercel (vercel.com)",
      "Add environment variables in Vercel dashboard: DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, JWT_SECRET",
      "Deploy and verify production build succeeds",
      "Test production URL: all features working",
      "Set up custom domain if desired (optional)",
      "Verify Supabase connection works from Vercel's servers"
    ],
    "passes": true
  },
  {
    "category": "refactor",
    "description": "Rename application from 'Poker Hub' to 'Union Poker'",
    "steps": [
      "Update all references to 'Poker Hub' in source code to 'Union Poker'",
      "Update page titles, meta tags, and document head",
      "Update Header component logo/title text",
      "Update any branding in landing page and auth pages",
      "Update README.md, CLAUDE.md, and documentation files",
      "Verify all user-facing text uses new branding"
    ],
    "passes": true
  },
  {
    "category": "refactor",
    "description": "Update UI to follow B2B SaaS minimal design guidelines",
    "steps": [
      "Apply system font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      "Establish consistent typography hierarchy: 3-4 type sizes max, use weight for emphasis",
      "Implement 4px/8px spacing scale consistently across all components",
      "Apply semantic color usage: green=success, amber=warning, red=error, blue=primary",
      "Use low saturation, muted tones to reduce visual fatigue",
      "Ensure 4.5:1 minimum contrast ratios for all text and data",
      "Remove unnecessary borders, use spacing and background colors instead",
      "Add proper loading states and empty states to all data-fetching components",
      "Ensure all transitions are 100-200ms maximum",
      "Right-align numbers in tables, left-align text",
      "Use monospace fonts for numbers, codes, timestamps in data displays",
      "Remove any decorative elements that don't serve a function",
      "Verify dark mode support with CSS variables"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Allow editing game location and time after creation",
    "steps": [
      "Create API route PATCH /api/games/[gameId]: allows host to update scheduledTime and location",
      "Add Zod schema for updateGameSchema (scheduledTime, location) in src/lib/validations/game.ts",
      "Create src/components/game/EditGameForm.tsx: form to edit game time and location",
      "Add 'Edit Game' button in GameInfo component (visible only to host)",
      "Show edit form in modal or inline when host clicks edit",
      "Validate that only the host can edit the game",
      "Allow editing regardless of game status (upcoming, active, or completed)",
      "Update game room page to reflect changes immediately after edit"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Allow host to delete upcoming games",
    "steps": [
      "Create API route DELETE /api/games/[gameId]: allows host to delete game if status is 'upcoming'",
      "Validate that only the host can delete the game",
      "Validate that game status is 'upcoming' before allowing deletion",
      "Delete all related records (GamePlayer, BuyIn entries) via cascade or explicit deletion",
      "Add 'Delete Game' button in GameInfo component (visible only to host, only for upcoming games)",
      "Show confirmation dialog before deletion with warning about permanent action",
      "After successful deletion, redirect host to dashboard",
      "Update dashboard to reflect game removal immediately"
    ],
    "passes": true
  },
  {
    "category": "database",
    "description": "Add JoinRequest model to database schema",
    "steps": [
      "Add JoinRequest model to prisma/schema.prisma with fields: id, gameId, playerId, status (pending/approved/denied), requestedAt, respondedAt",
      "Add relations to Game and User models",
      "Run npx prisma migrate dev --name add-join-requests",
      "Run npx prisma generate to update Prisma client"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement browse all upcoming games page",
    "steps": [
      "Create API route GET /api/games/upcoming: returns all upcoming games with host info and player count",
      "Support query params for filtering/sorting (by date, host)",
      "Create src/lib/db/join-requests.ts with functions: createJoinRequest, getJoinRequestsForGame, getPendingJoinRequestsForGame, updateJoinRequestStatus, getJoinRequestByPlayerAndGame",
      "Create src/components/games/GameBrowserCard.tsx: displays game info (host, time, location, BB, player count) with 'Request to Join' button",
      "Create src/components/games/GameBrowser.tsx: list of all upcoming games with filtering options",
      "Create src/app/games/browse/page.tsx: browse games page",
      "Add 'Browse Games' link to navigation (Header/Sidebar)",
      "Show appropriate status on games user has already joined or requested to join"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement join request flow for players",
    "steps": [
      "Create API route POST /api/games/[gameId]/join-requests: creates join request for current user",
      "Validate user is not already in game and doesn't have pending request",
      "Create src/components/game/RequestJoinButton.tsx: button that submits join request",
      "Show 'Pending' status after request is submitted",
      "Show 'Already Joined' status if user is already in the game",
      "Handle edge cases: game is not upcoming, user already requested"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement join request approval for hosts",
    "steps": [
      "Create API route GET /api/games/[gameId]/join-requests: returns pending join requests (host only)",
      "Create API route PATCH /api/games/[gameId]/join-requests/[requestId]: approve or deny request (host only)",
      "When approved: update request status to 'approved', add player to GamePlayer table",
      "When denied: update request status to 'denied'",
      "Create src/components/game/JoinRequestsList.tsx: displays pending join requests with approve/deny buttons",
      "Add JoinRequestsList to game room page (visible only to host)",
      "Show requester's display name in the list",
      "Update game room to reflect new players immediately after approval"
    ],
    "passes": true
  }
]
```

---

## Key Implementation Notes

### Settlement Calculation (Critical)
The settlement must account for whether buy-ins were paid to the bank:
```
For each player:
  totalBuyIns = sum of approved buy-in amounts
  unpaidBuyIns = sum of buy-ins where paidToBank = false
  cashOut = player's cash-out amount

  netChips = cashOut - totalBuyIns  // Their +/- in chips
  settlement = cashOut - unpaidBuyIns  // What bank actually owes/is owed

If settlement > 0: bank owes player this amount
If settlement < 0: player owes bank |settlement|
```

### Authentication Flow
- No email required (per user requirement)
- Simple displayName + password
- JWT stored in httpOnly cookie for security
- No password recovery (accepted limitation)

### Real-time Chat
- Uses Supabase Realtime subscriptions (free tier)
- Single global chat room for all users
- Messages persist in database
- Rate limited to prevent spam

### Cost Optimization
- All services on free tiers (Vercel + Supabase)
- No external email/SMS services
- No paid real-time services (Supabase Realtime is included)

---

## File Structure (Expected)

```
poker-hub/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── games/
│   │   │   ├── leaderboard/
│   │   │   ├── stats/
│   │   │   └── users/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── history/
│   │   ├── leaderboard/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── game/
│   │   ├── history/
│   │   ├── layout/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   ├── stats/
│   │   └── ui/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useChat.ts
│   └── lib/
│       ├── db/
│       ├── validations/
│       ├── auth.ts
│       ├── prisma.ts
│       ├── settlement.ts
│       └── supabase.ts
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Dependencies Summary

```json
{
  "dependencies": {
    "next": "^14.x",
    "@prisma/client": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@types/bcryptjs": "^2.x",
    "@types/jsonwebtoken": "^9.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x"
  }
}
```
