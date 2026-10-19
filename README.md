# LivingAgentUniversity (LAU)

**One campus. Many agents. Evidence before applause.**

An original, cozy **React + Vite** simulation inspired by the BotTown and BotOffice prototypes. Explore campus grounds, visit the office, and give six familiar characters simulated coursework and assignments.

**Important:** v0.3 is a **simulation only**. It does not run language models, write code, call GitHub, spend money, perform real training, or deploy anything. Every "completed" activity creates a receipt marked SIMULATED / UNVERIFIED. The app never claims simulated work is real.

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
- Visit **Dean's Office** in the Academy, or jump there from a course assessment button or the student-records sidebar
- Six fixed three-question scenario assessments with answer rubrics and per-agent transcripts
- Practice pass uses at least 2/3 matching answers (67%), but only records human operator selections, NOT model skills
- Versioned v0.2/v0.1 snapshot migration that preserves old tasks and simulated task receipts
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

## v0.3 navigation details

Select a resident, click a building, and watch them walk using deterministic orthogonal waypoints aligned with the scene's footpaths. The room opens when they reach the entrance. **Cancel walk** stops before arrival, without crediting the resource. Switching scenes resets visual walking positions for that scene; simulation tasks and unverified demo receipts remain in normal saved state.

These are **illustrated corridors**, not physics-based collision avoidance. The room art is a themed interior and not a 3D world. No real agent movement, access rights, or course completion is implied.


## v0.3 · The Dean's Office and Student Records

The Academy includes a Dean's Office. Choose a resident, choose a course, and select the candidate answers to three scenario questions. A fixed, deterministic rubric grades **the human's chosen answers**. A score of at least 67% records a *demo practice pass* on that agent's fictional transcript. The record stores the selections, grading method, course, timestamp, score, and **SIMULATED / UNVERIFIED** provenance.

**Important limitations:**
- Neither the answers nor the scores come from a running AI model. LAU does not measure learning, modify model weights, assign real competency, or grant real graduation credentials.
- The six courses are educational demos. Practice badges are not proof of skill.
- Assessment records reject forged verification flags and inconsistent scores when imported.
- Browser saves from v0.1/v0.2 are upgraded in memory to the v0.3 schema while preserving previous tasks/receipts; use Save here to persist the upgrade.
- There is no backend or external API, and no secrets should be pasted into course responses.

A future real evaluation pipeline requires a supervised model adapter, a reproducible test harness, signed/attested results, owner permission gates, and an independent verification path before issuing actual certificates.
