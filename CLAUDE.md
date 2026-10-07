# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project facts, deploy model and workflow rules live in `AGENTS.md` (shared with other agents) — imported here so there is one source of truth:

@AGENTS.md

App-level conventions (Next.js 16 caveats, design tokens, verification gotchas) are in `next-app/AGENTS.md`, loaded via `next-app/CLAUDE.md`. Read `tasks/lessons.md` at session start — it records real pitfalls hit in this repo.

## Commands

All app commands run from `next-app/` (the repo-root `package.json` just proxies `dev`/`build`/`lint` into it).

```bash
npm run dev     # http://localhost:5182 (strictly pinned; see ../PORT-REGISTRY.md)
npm run build   # static export → next-app/out/ (what Vercel serves)
npm run lint
```

There is no unit-test suite; verification is build + lint + browser checks (`webapp-testing` skill). `vercel.json` installs/builds inside `next-app/` and serves `next-app/out` with `cleanUrls`.

## Architecture

- **Static export only** (`output: "export"`, `images.unoptimized`). No route handlers, server actions, or runtime data — content is TypeScript data in `src/lib/data.ts` (company info, services, testimonials) and `src/lib/resources.ts` (portal links, document checklists, downloads, ports — drives every `/resources/*` page). Downloadable files are in `public/downloads/` with provenance in `docs/resources-source-manifest.md`.
- **Pages are server components** that export `metadata` (absolute `og:url` on `https://www.shivaaylogistics.in`) and render domain components from `src/components/{home,services,resources,contact,layout,ui}`; interactivity (nav dropdowns, lightbox, accordions, maps) lives in small client components.
- **Root layout** (`src/app/layout.tsx`) mounts Navbar/Footer/WhatsAppFloat and `ScrollReveal`, an IntersectionObserver that adds `.visible` to `.reveal` elements — below-fold content is opacity 0 until scrolled into view.
- **Maps**: the coverage map uses react-leaflet with Esri Light Gray Canvas tiles (keyless); office/port maps are Google Maps iframes.

## Repo layout notes

- `docs/superpowers/{specs,plans}/` — design specs and implementation plans per feature.
- `tasks/lessons.md` — append a lesson after any user correction.
- `.agents/skills/` — project skills (e.g. `webapp-testing` with `scripts/with_server.py` for Playwright runs).
- `screenshots/` — gitignored output dir for all QA captures.
