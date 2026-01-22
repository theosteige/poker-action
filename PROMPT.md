@plan.md @activity.md @PRD.md

We are building Poker Hub from scratch in this repo.

First read activity.md to see what was recently accomplished and the current status.

## Initial Cleanup (First Run Only)

If this is the first task and the old project files still exist, clean them up:

1. Remove old project files but KEEP these:
   - `.git/` (preserve history)
   - `.gitignore`
   - `.mcp.json`
   - `CLAUDE.md`
   - `PRD.md`
   - `PROMPT.md`
   - `plan.md`
   - `activity.md`
   - `screenshots/`

2. Delete everything else: `src/`, `dist/`, `docs/`, `public/`, `node_modules/`, `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `vercel.json`, `README.md`

3. Commit: `chore: remove old poker-action project (preserved in git history)`

4. Then proceed with the first setup task.

## Setup

If the project is not yet initialized (no package.json for Next.js), start with the first setup task.

Once initialized, start the dev server with `npm run dev`. If port 3000 is taken, try another port.

## Task Selection

Open plan.md and choose the single highest priority task where `passes` is `false`.

Tasks should be completed in order (setup → database → features → polish → testing → deployment).

## Implementation

Work on exactly ONE task: implement all the steps listed for that task.

Reference PRD.md for requirements, data models, and acceptance criteria.

Follow these coding standards:
- Use TypeScript with strict typing
- Use immutable patterns (no mutation)
- Keep files small and focused (<400 lines)
- Handle errors appropriately
- Validate user inputs with Zod

## Verification

After implementing, use Playwright MCP to:
1. Navigate to http://localhost:3000 (or the port you're using)
2. Take a screenshot of the relevant page/feature
3. Save it as `screenshots/[task-name].png`

Create the screenshots directory if it doesn't exist.

## Logging

Append a dated progress entry to activity.md with:
- Task completed
- Files created/modified
- Screenshot filename
- Any issues encountered or deviations from plan
- Update the "Current Status" section at the top

## Marking Complete

Update that task's `passes` in plan.md from `false` to `true`.

## Git

Make one git commit for that task only with a clear message following conventional commits:
- `feat: implement user authentication`
- `feat: add game creation flow`
- `fix: resolve settlement calculation bug`

Do NOT:
- git init
- change remotes
- git push

## Important

ONLY WORK ON A SINGLE TASK PER SESSION.

When ALL tasks in plan.md have `passes: true`, output:

<promise>COMPLETE</promise>
