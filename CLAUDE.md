# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project facts, deploy model, redesign status and workflow rules live in `AGENTS.md` (shared with other agents) — imported here so there is one source of truth:

@AGENTS.md

App-level conventions (Next.js 16 caveats, design tokens, hero/cursor contract, verification gotchas) are in `next-app/AGENTS.md`, loaded via `next-app/CLAUDE.md`. Read `tasks/lessons.md` at session start — it records real pitfalls hit in this repo.

## Commands

All app commands run from `next-app/` (the repo-root `package.json` just proxies `dev`/`build`/`lint` into it).

```bash
npm run dev     # http://localhost:5182 (strictly pinned; see ../PORT-REGISTRY.md)
npm run build   # static export → next-app/out/ (what Vercel serves)
npm run lint

# Unit tests (pure lib helpers only; no test script/runner — Node's built-in):
node --experimental-strip-types --test tests/*.test.ts
node --experimental-strip-types --test tests/yard.test.ts   # single file
```

- Tests import source with explicit `.ts` extensions (`../src/lib/yard.ts`); `tsconfig` has `allowImportingTsExtensions` and excludes `tests/`. Anything a test imports must stay free of `three`, React and `@/` aliases.
- Hero E2E: `python3 scripts/verify_hero.py --base-url http://localhost:5299` from the repo root against a fresh `out/` export served on 5299 (`npx serve out -l 5299` or `python3 -m http.server`); `--only a,b` runs selected checks. Ad-hoc headless Playwright scripts need `--enable-unsafe-swiftshader --use-angle=swiftshader`, or three.js canvases mount at 0 size.
- Vercel config (`vercel.json`) installs/builds inside `next-app/` and serves `next-app/out` with `cleanUrls`.

## Architecture

- **Static export only** (`output: "export"`, `images.unoptimized`). No route handlers, server actions, or runtime data — content is TypeScript data in `src/lib/data.ts` (company info, services, testimonials) and `src/lib/resources.ts` (all `/resources/*` pages). Downloadable files are in `public/downloads/` with provenance in `docs/resources-source-manifest.md`.
- **Root layout** (`src/app/layout.tsx`) mounts the site-wide chrome and motion layer on every route: Navbar/Footer/WhatsAppFloat, `ScrollReveal` (IntersectionObserver that adds `.visible` to `.reveal` elements), and the client-only `Preloader`, `Cursor`, `PageTransition`, `ScrollProgress` from `components/motion/`.
- **Homepage hero** (`components/hero/`): `HeroStageMount` probes WebGL / viewport tier / reduced motion via `useSyncExternalStore` (server snapshot = SVG `fallback/YardFallback`), then `next/dynamic`-loads `scene/HeroStage` (R3F). `useHeroProgress` drives one progress value through phases `dive → scrub → settled` (auto-dive, desktop scroll scrub, skip). Scene geometry is deterministic: `lib/yard.ts` plans container stacks with a seeded mulberry32 PRNG, colours from `lib/palette.ts`, easing in `lib/hero-ease.ts`. `lib/hero-bridge.ts` exposes agent screen positions for tooling/tests.
- **Cursor contract**: DOM elements opt in with `data-scan` / `data-waybill` / `data-stamp`; the 3D scene publishes hovered objects into `lib/cursor-store.ts` (a tiny external store — the 3D waybill wins over the DOM one), which `motion/Cursor` renders.
- **Bundle boundary**: `three` / `@react-three/*` may only be imported under `components/hero/scene/` (reached via dynamic import). Helpers used by eager code must stay three-free — a stray top-level `import "three"` in `lib/` previously leaked ~100 KB gz into every page.
- **Styling**: Tailwind v4 with tokens and motif classes in `src/app/globals.css`. Unlayered CSS beats Tailwind utilities, so component defaults belong in `@layer components`; reduced-motion overrides must match the specificity of the rule they undo (e.g. `html.js .reveal:not(.visible)`).

## Repo layout notes

- `docs/superpowers/{specs,plans}/` — design specs and implementation plans per feature; check the relevant one before changing redesign work.
- `tasks/lessons.md` — append a lesson after any user correction.
- `.agents/skills/` — project skills (e.g. `webapp-testing` with `scripts/with_server.py` for Playwright runs).
- `screenshots/` — gitignored output dir for all QA captures.
