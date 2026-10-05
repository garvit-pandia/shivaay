# Shivaay Logistics — Progress Tracker

Living document: branches, what lives where, session history, and what's next.
Updated: 2026-10-05. Owner: Garvit. All work happens on feature branches — `main` is production.

## Branch map

| Branch | Based on | Status | Vercel |
|---|---|---|---|
| `main` | — | Production. Light-mode site (home, services, contact). Last: `0932d9b` light-mode styling | Live site (auto-deploy) |
| `feat/resources-section` | `main` + 6 commits | Resources hub: `/resources`, `/links`, `/documents`, `/files`, `/ports` + 12 downloads + Esri map-tile fix. Last: `2ff5e3c` | Preview `2PH3WqUXi` |
| `redesign/immersive-2026` | `feat/resources-section` + 13 commits | **Active work.** Full immersive redesign + 2026-10-05 review-fix pass. Last: `9b03616` | Auto-deploys on push |

Merge note (decide with client before any PR): `redesign/immersive-2026` contains the
6 resources commits too — merging it ships resources + redesign together. Alternative:
merge `feat/resources-section` → `main` first, then rebase the redesign.

## Redesign commits (on `redesign/immersive-2026`)

1. `63c0d57` — design spec (`docs/superpowers/specs/2026-10-03-immersive-redesign-design.md`)
2. `08d06b4` — motion system + immersive homepage (globe hero, spine, conveyor, crates)
3. `47c2d7c` — services container wall, contact/resources/404/nav/footer restyle, implementation plan (`docs/superpowers/plans/2026-10-03-immersive-redesign-plan.md`)
4. `d04c258` — P0 vision-review fixes (opaque nav, globe legibility, filler cards, stamp, palette)
5. `494922d` — reduced-motion correctness (preloader/wipe specificity fix)
6. `bdc8e7b` — AGENTS.md redesign section
7. `c0f94d4` — trust + motion bundles (timeline, FAQs, CHA badge, marquee, reveals)
8. `0c4f1ea` — improvement plan from full-site review (`docs/superpowers/plans/2026-10-05-branch-improvement-plan.md`)
9. `2a1a5cc` — **P0** container wall geometry restored (Tailwind v4 layer collision) + focus ring
10. `1a5fc25` — **P0** reduced-motion reveals visible without scroll
11. `fba2ded` — skip three.js when WebGL unavailable (0 console errors)
12. `058627b` — opaque mobile navbar (no backdrop-filter dependency)
13. `9b03616` — promise numbering 04.x, 404 title, coverage-map framing

## What the redesign contains

**Design system** (`next-app/src/app/globals.css`): cream/ink/teal/orange tokens,
Playfair + Inter + Space Grotesk + JetBrains Mono, motif classes (`corrugated`,
`corrugated-strong`, `waybill`, `barcode`, `stamp-badge`, `mono-label`, `bg-blueprint`).
Rule: pair motifs with `backgroundColor`, never `background` shorthand.

**Motion** (`next-app/src/components/motion/`): Preloader (container doors, once/session),
Cursor (stamp, fine-pointer only), PageTransition (door wipe), GlobeHero (three.js,
lazy async chunk ~185KB gz, homepage only), RouteSpine, Conveyor, CratesField,
Odometer, LiveTicker, SplitReveal, Magnetic, ScrollProgress.

**Homepage**: globe hero + CHA chip + odometer stats → stats marquee → services (01) →
process timeline (02) → why-us + coverage map + live ticker (03) → promise (04) →
testimonial conveyor + review CTA (05) → physics-crate CTA.

**Services**: 12-container flip wall (`SHV-001…012`), gallery lightbox (a11y intact),
FAQ (6 Qs). **Contact**: waybill form (logic untouched), info cards, map, FAQ (4 Qs).
**Resources**: waybill restyle, data untouched. **404**: stamp moment. **Nav/Footer**:
mono labels, gradient hairline, deep-teal footer.

## Session log — 2026-10-03

- Brainstormed redesign; client constraints captured: **light mode only**, keep all
  content, separate branch, copy may be lightly polished.
- Visual-companion server was offered/accepted, then set aside for terminal-first
  speed. User asked for "wow/3D" → 10-idea list → approved "Journey" combo.
- Built via 4 parallel subagents (plan doc + fix pass + services + contact/resources),
  integrated, verified with Playwright + vision reviews (2 rounds, scores 5.5 → 6/10).
- Landed P0s, trust + motion bundles. All green: `npm run build` (9/9 static) + `npm run lint`.

## Session log — 2026-10-05 (review + fix pass)

- Full branch walk: all routes desktop/mobile, interactions (lightbox, FAQ, flip,
  door wipe, cursor), reduced-motion, WebGL-off, production export + live-site
  baseline → improvement plan (commits list #8).
- Fixed **P0**: services container wall collapsed to 0px — unlayered `height: 100%`
  in globals.css beat Tailwind's layered `h-64` on the inner element; 12/12 cards
  now 256px, flip + keyboard focus ring verified.
- Fixed **P0**: reduced-motion reveals stayed hidden until scroll (specificity loss
  vs `.js .reveal:not(.visible)`).
- P1: three.js no longer initializes without WebGL (0 console errors); mobile nav
  fully opaque (no backdrop-filter dependency).
- P2 safe items: promise cards renumbered 04.x, 404 gets its own `<title>`,
  coverage map gets top headroom + fractional zoom (no clipped labels).
- Verification: build 11/11 static + lint green; geometry-assertion suite all pass
  (`screenshots/v5-*`, gitignored).
- Still client-side: marquee copy, WhatsApp float color, real photos vs stock,
  motion-density verdict, merge strategy.

## Verification status

- [x] build + lint green (re-verified 2026-10-05) · [x] SSR content present
- [x] reduced-motion pass — 0 hidden reveals without scroll (fixed 2026-10-05)
- [x] WebGL-off fallback (4 arcs + 5 dots, **0 console errors** after 2026-10-05 fix)
- [x] door-wipe transition · [x] mobile 390px, no overflow (all routes)
- [x] container wall geometry 12/12 ≥ 256px + flip + focus ring (fixed 2026-10-05)
- [x] three.js lazy chunk budget: 179.4 KB gz home-only; initial JS ≈ 198 KB gz on home
- [x] no-JS content readable (js-gated hides)
- [ ] **Visual taste sign-off** — fresh pass needed on `screenshots/v5-*` or the Vercel
  preview; motion-density verdict still pending from client.

## Pending inputs (from client)

1. **CHA license number** → set `chaLicense` in `next-app/src/lib/data.ts` (hero + footer auto-render it; TODO marked in code).
2. **2–3 more real client quotes** → append to `testimonials` in `data.ts` (conveyor auto-balances). Never invent testimonials.
3. Verdict on motion density (preloader/stamp cursor too playful?) before merge.
4. Merge strategy: resources-first-then-rebase vs. ship-everything-together.

## Environment

- Local dev: http://localhost:5182 (registered port; serves checked-out branch)
- Never touch ports 9222 (Playwright) / 46537 (vscode-server)
- Ephemeral static previews: `python3 -m http.server <free-51xx>` in `next-app/out/`, kill after
- Headless WebGL flags: `--enable-unsafe-swiftshader --use-angle=swiftshader`
- Playwright lives in sibling projects (e.g. `/home/garvit/projects2/cube3/node_modules/playwright`)
