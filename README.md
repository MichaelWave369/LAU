# LivingAgentUniversity (LAU)

**One campus. Many agents. Evidence before applause.**

An original, cozy **React + Vite** simulation inspired by the BotTown and BotOffice prototypes. Explore campus grounds, visit the office, and give six familiar characters simulated coursework and assignments.

**Important:** v0.1 is a **simulation only**. It does not run language models, write code, call GitHub, spend money, perform real training, or deploy anything. Every "completed" activity creates a receipt marked SIMULATED / UNVERIFIED. The app never claims simulated work is real.

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
- Forge, Coherence, Scout, Rook, Nyx, VaultBot
- Demo course practica, assigned work, Step and Play/Pause
- Clickable locations, energy / morale / XP, Kanban-style queue and event stream
- Receipts marked **SIMULATED** and **UNVERIFIED**
- Browser-local save and validated import/export JSON
- No external assets, tracking, accounts, tokens, API keys, or backend

## Next phases (not implemented)

1. Governed adapter to opt-in local/remote agents
2. Human approval for all real-world mutations
3. Budget ceilings, permission scopes and verified evidence ledger
4. Classroom curricula, sandboxes, real evaluation and measured learning outcomes

**Principle:** Ledger above ego. No demo progress is ever presented as real agent work.

MIT licensed. Original concept by Michael Hughes.
