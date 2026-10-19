# LivingAgentUniversity (LAU)

**One campus. Many agents. Evidence before applause.**

An original, cozy **React + Vite** simulation inspired by the BotTown and BotOffice prototypes. Explore campus grounds, visit the office, and give six familiar characters simulated coursework and assignments.

**Important:** The campus and Dean's Office are simulations. v0.4 adds a separately invoked local Ollama evaluation CLI; imported results remain UNVERIFIED reported evidence. It does not run language models, write code, call GitHub, spend money, perform real training, or deploy anything. Every "completed" activity creates a receipt marked SIMULATED / UNVERIFIED. The app never claims simulated work is real.

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
- Versioned v0.1/v0.2/v0.3 snapshot migration that preserves tasks, simulated scores and receipts
- Living Classroom: local-only Ollama runner with bounded no-tools requests and manually imported evidence JSON.
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

## v0.4 navigation details

Select a resident, click a building, and watch them walk using deterministic orthogonal waypoints aligned with the scene's footpaths. The room opens when they reach the entrance. **Cancel walk** stops before arrival, without crediting the resource. Switching scenes resets visual walking positions for that scene; simulation tasks and unverified demo receipts remain in normal saved state.

These are **illustrated corridors**, not physics-based collision avoidance. The room art is a themed interior and not a 3D world. No real agent movement, access rights, or course completion is implied.


## v0.4 · The Dean's Office and Student Records

The Academy includes a Dean's Office. Choose a resident, choose a course, and select the candidate answers to three scenario questions. A fixed, deterministic rubric grades **the human's chosen answers**. A score of at least 67% records a *demo practice pass* on that agent's fictional transcript. The record stores the selections, grading method, course, timestamp, score, and **SIMULATED / UNVERIFIED** provenance.

**Important limitations:**
- Neither the answers nor the scores come from a running AI model. LAU does not measure learning, modify model weights, assign real competency, or grant real graduation credentials.
- The six courses are educational demos. Practice badges are not proof of skill.
- Assessment records reject forged verification flags and inconsistent scores when imported.
- Browser saves from v0.1/v0.2 are upgraded in memory to the v0.4 schema while preserving previous tasks/receipts; use Save here to persist the upgrade.
- There is no backend or external API, and no secrets should be pasted into course responses.

A future real evaluation pipeline requires a supervised model adapter, a reproducible test harness, signed/attested results, owner permission gates, and an independent verification path before issuing actual certificates.


## v0.4 · The Living Classroom (opt-in local Ollama)

The **Living Classroom** sends one fixed-rubric course to an actual *locally installed* Ollama model when the user explicitly runs the local Node CLI. The runner asks the model to choose among options, preserves the raw response, grades it deterministically and writes a JSON report with SHA-256 hashes. **The GitHub Pages app never contacts localhost**, it only imports a report you manually select.

**Requirements:** Node.js 22+, Ollama running on the same PC at http://127.0.0.1:11434, and your chosen model already installed. No cloud inference or API credentials.

In PowerShell or terminal:

    git clone https://github.com/MichaelWave369/LAU.git
    cd LAU
    npm install
    ollama list
    npm run classroom -- --model granite4.2:8b --course records --agent vault

Another installed model:

    npm run classroom -- --model qwen3.5:9b --course research --agent scout

The runner creates a unique JSON report under **reports/** (ignored by Git). On the live site, find **The Living Classroom → Import evidence JSON** and select that file. The report includes the prompt hash, raw response hash, file integrity hash, time, claimed model tag, duration and rubric score.

Optional flags: `--timeout 180000` for slow models (up to 300000 ms); `--out path/to/report.json` for a specific file. Existing files are never overwritten. Help:

    npm run classroom -- --help

### Trust and safety

- The runner only contacts 127.0.0.1:11434/api/generate. No model-proposed commands are executed; no GitHub mutations, remote model services, or browser credentials.
- Request settings: stream=false, temperature=0, num_predict=256, num_ctx=2048, and a default 120-second abort timeout. This is inference/evaluation, **not training or fine-tuning**.
- The model sees questions and options, but **not answer keys**. Invalid JSON or choices get INVALID_RESPONSE, not a fabricated passing score.
- Reports are LOCAL_RUNNER_REPORTED / UNVERIFIED. Matching hashes detect changes, **not who produced the report**. A forger can compute fresh hashes. Scores do not prove model identity or confer real academic credentials.
- Imported records stay separate from the simulated human-choice Dean's Office transcripts. A reported score is not a verified competency.
- Import schema, response size, rubric, hashes and report counts are bounded. The browser performs no network requests for evaluation.
- Local browser saves from the previous three versions are upgraded in memory, preserving old tasks and practice results. Press Save here to persist an upgrade.
- Do not put secrets into model prompts or imported reports. Treat files and local models as untrusted.

### Why manual import?

GitHub Pages is public, and a public page should not silently control localhost services. Browser private-network and cross-origin limitations also make direct access fragile. Manual file exchange is explicit, portable and testable. Any later optional local broker should be loopback-bound, authenticated, origin restricted and human-approved.

A future real credential requires protected reproducible evaluations, controlled scoring, pinned model digests, verified execution evidence and independent attestation. v0.4 deliberately does not claim those capabilities.
