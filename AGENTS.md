# Shivaay Logistics — Agent Notes

Project context for agent sessions in this repo. The workflow rules below still apply.

## Facts
- **Live site:** https://www.shivaaylogistics.in (Vercel; production = `main`)
- **App:** `next-app/` — Next.js 16 (App Router) + React 19 + Tailwind v4
- **Static export:** `output: "export"` — no server runtime; every route must be statically exportable
- **Dev server:** `cd next-app && npm run dev` → http://localhost:5182 (port claimed in `../PORT-REGISTRY.md`)
- **Verify before done:** `npm run build` (all routes static) + `npm run lint`

## Deploy model (Vercel)
- `main` → production (auto-deploy on push)
- Any pushed branch → Preview deployment (**publicly accessible** — Vercel Authentication is currently disabled so the client can review without a Vercel account; anyone with the URL can view)
- Flow: feature branch → PR → review preview → merge → production
- Canonical domain is `www.shivaaylogistics.in` (apex `.in` 308-redirects to www). There is no `.com` domain — never use it in metadata/JSON-LD.
- **Finding preview URLs** (repo `garvit-pandia/shivaay`, no Vercel CLI needed):
  - Latest build of a branch (stable alias): `https://shivaay-git-<branch, '/'→'-'>-garvits-projects-1883ee4b.vercel.app` (e.g. `shivaay-git-redesign-immersive-2026-…`)
  - Exact build of a commit: `id=$(gh api "repos/garvit-pandia/shivaay/deployments?sha=<sha>" --jq '.[0].id'); gh api repos/garvit-pandia/shivaay/deployments/$id/statuses --jq '.[0].environment_url'`
  - Build state for a commit: `gh api repos/garvit-pandia/shivaay/commits/<sha>/status --jq '.statuses[]|[.state,.target_url]|@tsv'`
  - Previews are public, so verify them directly with `curl`/Playwright (expect 200)
- To re-protect: Settings → Deployment Protection → Vercel Authentication → enable

## Browser & QA
- **Primary path:** `webapp-testing` skill — headless Python Playwright scripts + `scripts/with_server.py` for dev-server lifecycle (port 5182)
- **Screenshots:** read directly with the read tool. The main model (`deepseek-flash`) has **native vision** — no vision subagent, no vision MCP.
- **Ad-hoc/interactive:** `agent-browser` skill exists but its CLI is **not installed** — run `npm i -g agent-browser && agent-browser install` first. Only needed for hand-driven clicking.
- **Playwright MCP: removed** from `opencode.json`. Its `--executable-path` pinned `chromium-1226`, which no longer exists (installed: 1228/1234/1237/1243).
- List installed browsers: `ls ~/.cache/ms-playwright/`

## Key docs
- `README.md` — routes, stack, dev commands
- `docs/resources-source-manifest.md` — provenance for downloadable documents
- `tasks/lessons.md` — lessons/pitfalls (update after any correction)

## Immersive redesign (in progress)
- **Branch:** `redesign/immersive-2026` (off `feat/resources-section`) — all redesign work lands here; `main` stays production-safe
- **Preview:** every push auto-deploys a public Vercel preview (see Deploy model); client reviews there before any merge
- **Spec:** `docs/superpowers/specs/2026-10-03-immersive-redesign-design.md` · **Plan:** `docs/superpowers/plans/2026-10-03-immersive-redesign-plan.md`
- **Motion components:** `next-app/src/components/motion/` (Preloader, Cursor, PageTransition, GlobeHero, RouteSpine, Conveyor, CratesField, Odometer, LiveTicker) — all client-only, lazy-loaded, reduced-motion safe
- **Motif classes** (in `globals.css`): `corrugated` / `corrugated-strong`, `waybill`, `barcode`, `stamp-badge`, `mono-label`, `bg-blueprint` — pair with `backgroundColor` (never `background` shorthand) so textures survive inline colors
- **three.js** is a lazy async chunk for the homepage hero only — never import it statically, or every page pays ~185KB gz

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
