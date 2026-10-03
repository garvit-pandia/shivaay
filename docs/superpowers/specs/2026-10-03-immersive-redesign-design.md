# Immersive Redesign — "The Journey" (Design Spec)

**Date:** 2026-10-03 · **Branch:** `redesign/immersive-2026` (off `feat/resources-section`)
**Constraint:** Light mode only (client preference). 100% of existing content preserved (light copy polish allowed). Static export, no server runtime.

## Concept

One metaphor executed everywhere: **freight as a journey**. The site opens like a shipment being processed (waybill preloader), the hero shows the network (3D globe with route arcs), a single route line draws down the homepage connecting sections like stations, services are containers, testimonials ride a conveyor, the cursor is a customs stamp, and the exit CTA drops crates with physics. Award-target polish, B2B-trustworthy palette.

## Design system

| Token | Value | Use |
|---|---|---|
| `cream` | `#FAF8F4` | page base (alt: white) |
| `ink` | `#1E1B18` | primary text |
| `ink-dim` | `#6B5E4A` | secondary text |
| `teal` | `#0F766E` | primary brand (continuity) |
| `orange` | `#EA580C` | sparing accent: stamps, live dots, ticks |
| `border` | `#E8E4DB` | hairlines |

- **Type:** Playfair Display (display serif, kept), **Space Grotesk** (headline alt / UI), **JetBrains Mono** (data labels, waybills, tickers)
- **Textures/motifs:** corrugated container ribs, dashed waybill borders, barcode strips, blueprint grid, rubber-stamp badges (rotated, imperfect)
- **Buttons:** keep pill system; add stamp-thunk press state via custom cursor

## Feature list (approved combo)

1. **Waybill preloader + door-wipe transitions** — barcode scan → stamp slam → container doors swing open on first paint; same wipe on internal navigation. SessionStorage: show preloader once per session.
2. **Hero: 3D trade-routes globe** (three.js, lazy-loaded, client-only) — teal dot-sphere on cream, great-circle arcs launching Ludhiana → Amritsar/Delhi/Mumbai/Mundra (+ Delhi→Mumbai, Mumbai→Mundra per `routes` data), drag to rotate, auto-rotate otherwise. Headline/CTAs overlay. Static fallback image/gradient when WebGL unavailable.
3. **Route-line scroll spine** (homepage) — fixed/absolute SVG dashed path drawing with scroll progress (IntersectionObserver + rAF, no lib), tiny vehicle marker travels it; station labels at each section.
4. **Odometer stats + live ticker** — count-up on reveal (15+/800+/5), "shipments cleared today" ticker in coverage section (deterministic seed per day, ticks on interval).
5. **Services: kinetic container wall** — 12 containers (corrugated, each a brand color from restrained palette) stack in on scroll; hover/click flips to reveal service detail. Works without JS (static grid), animation is progressive enhancement.
6. **Testimonials conveyor** — infinite horizontal auto-scroll, draggable, pause on hover; cards styled as container side panels with shipping-label metadata (CLIENT / ROUTE fields).
7. **Customs stamp cursor** — custom cursor (fine-pointer devices only): ring default; over interactive elements becomes "CLEARED" stamp; click = stamp thunk + micro shake. `data-cursor` attributes drive variants. Never hides the native cursor completely (accessibility): native cursor stays visible as a dot.
8. **CTA physics crates** — final CTA: mini crates drop with gravity and stack behind heading (hand-rolled 2D physics on canvas or DOM, no dependency).

## Explicitly excluded

- Scroll-driven port flythrough (stretch only) — would fight the Leaflet coverage map and the globe for GPU/wow budget
- Paper-morph paperwork scene — fourth metaphor, cut for coherence
- Dark mode — client prefers light

## Technical rules

- Static export; all 3D/motion lazy-loaded client components with server-rendered fallback content (crawler/no-JS safe)
- three.js via npm + dynamic `import()`; no other heavy deps (physics hand-rolled; spine/odometer/conveyor hand-rolled)
- `prefers-reduced-motion`: all animation off, content fully visible
- Custom cursor: `@media (pointer: fine)` only; native cursor remains
- Performance: single shared rAF where possible; IntersectionObserver pauses offscreen animation; three.js canvas paused when offscreen; target < 250KB added JS gzip
- a11y patterns from `tasks/lessons.md`: skip link first, lightbox a11y, reveal pattern `.js .reveal:not(.visible)`
- Map tiles: Esri Light Gray Canvas (do NOT switch to Carto)

## Page mapping

- `/` — preloader → globe hero → services overview (mini container cards) → spine begins → coverage (map + ticker) → mission → why-us → testimonial conveyor → physics CTA
- `/services` — container wall (12) + gallery lightbox (restyled) + CTA
- `/contact` — restyled form (waybill aesthetic: mono labels, dashed separators), office map, info cards
- `/resources/*` — full restyle with new system; no 3D; stamp/waybill motifs
- 404 — "Shipment not found" stamp moment

## Verification (per milestone)

- `npm run build` (all routes static) + `npm run lint` green
- Playwright screenshots → `screenshots/` (gitignored), reviewed via vision subagent; scroll-settle `.reveal` first; Maps iframe needs ~5s
- Reduced-motion + no-WebGL spot checks
- Push branch at each milestone (Vercel preview, auth-protected)
