# LivingAgentUniversity (LAU)

**One campus. Many agents. Evidence before applause.**

An original, cozy **React + Vite** simulation inspired by the BotTown and BotOffice prototypes. Explore campus grounds, visit the office, and give six familiar characters simulated coursework and assignments.

**Important:** The campus and Dean's Office are simulations. The locally executed Ollama CLI supports repeated evidence collection. Imported results remain UNVERIFIED reported evidence, not model certifications. It does not run language models, write code, call GitHub, spend money, perform real training, or deploy anything. Every "completed" activity creates a receipt marked SIMULATED / UNVERIFIED. The app never claims simulated work is real.

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

## v0.5 navigation details

Select a resident, click a building, and watch them walk using deterministic orthogonal waypoints aligned with the scene's footpaths. The room opens when they reach the entrance. **Cancel walk** stops before arrival, without crediting the resource. Switching scenes resets visual walking positions for that scene; simulation tasks and unverified demo receipts remain in normal saved state.

These are **illustrated corridors**, not physics-based collision avoidance. The room art is a themed interior and not a 3D world. No real agent movement, access rights, or course completion is implied.


## v0.5 · The Dean's Office and Student Records

The Academy includes a Dean's Office. Choose a resident, choose a course, and select the candidate answers to three scenario questions. A fixed, deterministic rubric grades **the human's chosen answers**. A score of at least 67% records a *demo practice pass* on that agent's fictional transcript. The record stores the selections, grading method, course, timestamp, score, and **SIMULATED / UNVERIFIED** provenance.

**Important limitations:**
- Neither the answers nor the scores come from a running AI model. LAU does not measure learning, modify model weights, assign real competency, or grant real graduation credentials.
- The six courses are educational demos. Practice badges are not proof of skill.
- Assessment records reject forged verification flags and inconsistent scores when imported.
- Browser saves from v0.1/v0.2 are upgraded in memory to the v0.5 schema while preserving previous tasks/receipts; use Save here to persist the upgrade.
- There is no backend or external API, and no secrets should be pasted into course responses.

A future real evaluation pipeline requires a supervised model adapter, a reproducible test harness, signed/attested results, owner permission gates, and an independent verification path before issuing actual certificates.


## v0.5 · The Living Classroom (opt-in local Ollama)

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

A future real credential requires protected reproducible evaluations, controlled scoring, pinned model digests, verified execution evidence and independent attestation. v0.5 deliberately does not claim those capabilities.


## v0.5 · Supervised repeated samples and descriptive model profiles

The separate **local, opt-in** batch evaluator asks the selected installed Ollama model a small fixed set of multiple-choice questions repeatedly. Calls are bounded and **sequential**, not concurrent. It creates one JSON evidence file for every successful local request; errors are clearly reported and never counted as successes.

To start with three trials on two courses, on the PC running Ollama:

    npm run evaluate -- --model granite4.2:8b --courses records,research --trials 3 --agent vault

To ask two samples in all six courses:

    npm run evaluate -- --model qwen3.5:9b --all --trials 2 --agent scout

Options: --model (required), --courses (comma-separated) **or** --all, --trials 1..5 (default 3), --agent (default forge), --timeout milliseconds (1000..300000, default 120000). Maximum **30 local requests per command**. The script does not run automatically, launch Ollama, download models, overwrite prior files, execute model code, or alter weights.

After running, select **The Living Classroom → Import report JSONs**. You can multi-select up to **30 JSON reports**; each is checked for schema, original prompt/response hashes, report hash and grading consistency *before any are added*. Invalid batches import zero records. Existing imported reports are preserved separately from simulated student transcripts, with an overall cap of 80.

The new **Model capability profiles** view groups reports by their *claimed* Ollama model tag and course. It displays the number of samples, proportion of parseable responses, mean/median scores on parseable reports, best/worst score and how many trials reached the course's fixed practice threshold. Empty courses say **NOT TESTED**. It never awards a verified competency, model badge, graduation or authorization to act.

### Interpreting results

- The same three fixed published questions are repeated. Repeated successes may indicate format compliance or memorization, **not learning, model weight updates, or generalization**.
- A model name in JSON is self-reported. SHA-256 hashes detect file changes but are **not signatures or proof of origin**.
- A run can be incomplete. Failed requests appear as console errors and are NOT represented as completed evidence; the profile view only describes the imported files.
- Valid-response rates are based on imported reports, not all attempted or failed requests. Mean/median scores **exclude invalid responses** and show sample sizes.
- Results are local-reported and unverified. A proper future certification system requires protected held-out sets, independent measurement, environment/model pinning, anti-leak controls, attestation, and human approval.
- The batch runner disables HTTP redirect-following and keeps the endpoint fixed at http://127.0.0.1:11434/api/generate. Requests cannot be redirected to a remote service by Ollama.
