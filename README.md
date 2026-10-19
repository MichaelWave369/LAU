# LivingAgentUniversity (LAU)

**One campus. Many agents. Evidence before applause.**

An original, cozy **React + Vite** simulation inspired by the BotTown and BotOffice prototypes. Explore campus grounds, visit the office, and give six familiar characters simulated coursework and assignments.

**Important:** v0.2 is a **simulation only**. It does not run language models, write code, call GitHub, spend money, perform real training, or deploy anything. Every "completed" activity creates a receipt marked SIMULATED / UNVERIFIED. The app never claims simulated work is real.

## Run locally

Requires Node.js 22+.

    npm ci
    npm run dev

Run checks:

    npm test
    npm run build

## GitHub Pages

This repo uses base path /LAU/ and includes a GitHub Actions workflow. After merging the initial PR, enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. The expected URL is https://michaelwave369.github.io/LAU/ after the workflow successfully deploys.

## Inside the campus

- Three scenes: **Grounds**, **BotOffice**, **Academy**, with original SVG artwork
- Select a resident, click a building, and watch corridor-based animated movement to its entrance
- Enter illustrated rooms with themed furniture and queue simulated practice tasks
- Map nameplates only appear on hover, focus, or selection to reduce overlap
- Forge, Coherence, Scout, Rook, Nyx, VaultBot
- Demo course practica, assigned work, Step and Play/Pause
- Clickable locations, energy / morale / XP, Kanban-style queue and event stream
- Receipts marked **SIMULATED** and **UNVERIFIED**
- Browser-local save and validated import/export JSON (walking positions restart when a scene or snapshot loads)
- No external assets, tracking, accounts, tokens, API keys, or backend

## Next phases (not implemented)

1. Governed adapter to opt-in local/remote agents
2. Human approval for all real-world mutations
3. Budget ceilings, permission scopes and verified evidence ledger
4. Classroom curricula, sandboxes, real evaluation and measured learning outcomes

**Principle:** Ledger above ego. No demo progress is ever presented as real agent work.

MIT licensed. Original concept by Michael Hughes.

## v0.2 navigation details

Select a resident, click a building, and watch them walk using deterministic orthogonal waypoints aligned with the scene's footpaths. The room opens when they reach the entrance. **Cancel walk** stops before arrival, without crediting the resource. Switching scenes resets visual walking positions for that scene; simulation tasks and unverified demo receipts remain in normal saved state.

These are **illustrated corridors**, not physics-based collision avoidance. The room art is a themed interior and not a 3D world. No real agent movement, access rights, or course completion is implied.
