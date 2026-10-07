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
- To re-protect: Settings → Deployment Protection → Vercel Authentication → enable
- Canonical domain is `www.shivaaylogistics.in` (apex `.in` 308-redirects to www). There is no `.com` domain — never use it in metadata/JSON-LD.
- **Finding preview URLs** (repo `garvit-pandia/shivaay`, no Vercel CLI needed):
  - Latest build of a branch (stable alias): `https://shivaay-git-<branch, '/'→'-'>-garvits-projects-1883ee4b.vercel.app`
  - Exact build of a commit: `id=$(gh api "repos/garvit-pandia/shivaay/deployments?sha=<sha>" --jq '.[0].id'); gh api repos/garvit-pandia/shivaay/deployments/$id/statuses --jq '.[0].environment_url'`
  - Build state for a commit: `gh api repos/garvit-pandia/shivaay/commits/<sha>/status --jq '.statuses[]|[.state,.target_url]|@tsv'`
  - Previews are public, so verify them directly with `curl`/Playwright (expect 200)

## Key docs
- `README.md` — routes, stack, dev commands
- `docs/resources-source-manifest.md` — provenance for downloadable documents
- `tasks/lessons.md` — lessons/pitfalls (update after any correction)

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
