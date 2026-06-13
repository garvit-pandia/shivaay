# Read Later — Session Context (2026-06-13)

> **User:** Garvit (owner/boss of Shivaay Logistics — nationalist)
> **Branch:** `redesign-v2` ONLY. `main` is read-only / preserved.
> **Site:** Shivaay Logistics (customs broker + logistics, Ludhiana, Punjab)

---

## Original Ask (4 items, paraphrased)

1. **Reduce & optimize empty space on the services page** — visible blank space between visible cards
2. **Add / make prominent the name "Shivaay Logistics"** (currently nav shows "Shivaay")
3. **Increase the size of the map proportionally**
4. **Include the map as specified by Indian government** — boss is nationalist, wants Indian map (Mappls/MapMyIndia), not foreign (Google/CartoCDN/OpenStreetMap tiles)

## Clarifications collected

| Question | Answer |
|---|---|
| Which codebase? | **Both** — but vanilla HTML gets deleted; only `next-app/` is the live target |
| Map provider? | **Mappls / MapMyIndia** (Indian commercial) |
| Which map? | **Home page route map** (the current Leaflet one in `NetworkMap.tsx`) |
| Nationalist touches? | **Complete India boundary** (PoK, Aksai Chin shown as India). Skip flag accents / Made-in-India badge |
| Mappls API key? | **Iframe embed only — no key needed** |
| Spacing aggressiveness? | **Conservative** (py-24→py-16, gap-5→gap-4, p-6→p-5) |
| Vanilla files? | **Delete from redesign-v2**, add to .gitignore, root becomes thin wrapper around `next-app/` |
| Root cleanup? | **Include in same change** (README, package.json, .gitignore updates) |
| Branch safety? | **Confirmed safe**: all work on `redesign-v2`, `main` untouched, no push, no merge |

## Root cause of "empty space" on services page

The `.reveal` class in `globals.css` sets `opacity: 0` by default. JS adds `.visible` on scroll. If the screenshot/page render doesn't trigger the IntersectionObserver for cards 7–12 (below the fold), they sit there invisible but take space — the user sees a giant empty void.

**Fix:** default `.reveal` to visible; only hide it when JS has explicitly opted in (`.js` class on `<html>`).

## What to do (the plan we agreed on)

### A. Services page — invisible cards + spacing
- `next-app/src/app/globals.css` — flip `.reveal` default to visible
- `next-app/src/components/layout/ScrollReveal.tsx` — add `js` class on mount
- `next-app/src/app/layout.tsx` — add `no-js` default to `<html>`, remove via JS
- `next-app/src/components/services/ServiceGrid.tsx` — `py-24→py-16`, `gap-5→gap-4`, `p-6→p-5`, `mb-12→mb-8`

### B. Home page route map — Mappls iframe
- `next-app/src/components/home/NetworkMapSection.tsx` — REWRITE as Server Component with `<iframe src="https://www.mappls.com/embed?lat=22.5&lng=79&zoom=4">`, add city chip legend below, height up to 700px
- `next-app/src/components/home/NetworkMap.tsx` — **DELETE** (Leaflet no longer needed)
- `next-app/package.json` — remove `leaflet`, `react-leaflet`, `@types/leaflet` (saves ~40KB)

### C. Nav brand — "Shivaay Logistics"
- `next-app/src/components/layout/Navbar.tsx` — change `Shivaay` to `Shivaay Logistics`

### D. Repo cleanup (root, not next-app)
- `git rm contact.html index.html services.html assets/`
- `.gitignore` — defensive entries: `/contact.html`, `/index.html`, `/services.html`, `/assets/`
- `README.md` — rewrite for Next.js workflow
- `package.json` (root) — workspace wrapper with dev/build/lint scripts

## Key constraints

- **Branch safety:** all operations on `redesign-v2` only. Never `git push`, never merge to `main`, never delete `main`. User confirmed safe.
- **Next.js 16 breaking changes to remember:**
  - `next lint` REMOVED → use `eslint` CLI (next-app already has `lint: "eslint"`)
  - `images.domains` deprecated → `remotePatterns` (already done)
  - Synchronous dynamic APIs removed (not relevant here)
  - `middleware` renamed to `proxy` (not relevant here)
- **No API key for Mappls** — iframe embed only
- **No new npm packages** — Mappls works via plain HTML `<iframe>`

## Verification gates

1. `cd next-app && npm run build` → 0 errors
2. `cd next-app && npm run lint` → 0 errors
3. Playwright on `localhost:3000` — home, services, contact
   - All 12 service cards visible
   - Map shows India with complete boundary
   - Nav says "Shivaay Logistics"
4. `git status` — vanilla files gone, only intended changes staged
5. `git log main..redesign-v2 --stat` — shows what changed
6. Confirm `main` is untouched: `git rev-parse main` before/after

## Commit strategy

- **Commit 1:** `fix: services page invisible cards + tighter spacing` (next-app CSS + components)
- **Commit 2:** `feat: replace home map with Mappls India embed` (NetworkMapSection rewrite + delete NetworkMap.tsx + remove leaflet deps)
- **Commit 3:** `style: brand name "Shivaay Logistics" in navbar` (Navbar.tsx)
- **Commit 4:** `chore: remove vanilla HTML files from redesign-v2 branch` (git rm + .gitignore)
- **Commit 5:** `docs: rewrite root README and package.json for Next.js workflow` (root cleanup)

Or fewer commits if some changes are tiny. Verify-after-each is OK since builds are fast.

---

## Subagent dispatch plan (when I went to build)

Tasks A, B, C, D above are mostly independent → spawn 4 parallel subagents, then verify, then commit sequentially.

Each subagent gets:
- Exact files to touch
- Exact line numbers / current code to replace
- Style / token values to use
- Instruction to commit its own work
- Instruction to NOT touch files outside its scope
