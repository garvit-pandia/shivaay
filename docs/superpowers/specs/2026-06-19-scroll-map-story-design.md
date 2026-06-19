# Scroll-Driven SVG Map Story — Design Spec

> **Source:** `future.md` #9 (pulsing HQ + animated routes) + #10 (scroll-driven map story), deepened with creative layers A–G selected 2026-06-19.
> **Parent feature set:** Part of the warm-editorial redesign follow-on. This spec covers the map-story section only.

## Goal

Replace the current `WhyPartnerSection` (which bundles a why-us list beside a static Leaflet map) with a **sticky-map scroll narrative**: a hand-drawn-feeling SVG India map stays pinned on one side while a 5-step shipping story scrolls past on the other. As each step enters view, the map flies to the relevant city, draws the route arc, slams an ink-stamp, and floats an editorial city card. The map becomes narrative, not decoration.

## Why

Customs brokerage is a journey — cargo moves origin → customs → port → sea → delivery. A static map with dots says "we exist in these places." A scroll-driven story says "here is what we actually do, step by step." Print-magazine storytelling applied to logistics. Far more memorable than a bullet list, and the most honest visual metaphor: the business literally is routes, stamps, and movement.

## Design Read

*Reading this as: a warm-editorial B2B logistics landing, with a print-magazine scroll-story language, leaning toward hand-illustrated SVG + scroll choreography + ink-stamp motifs — NOT a generic web map widget.*

Dials: `DESIGN_VARIANCE 8 / MOTION_INTENSITY 7 / VISUAL_DENSITY 3` (asymmetric, choreographed, airy).

## Decisions Locked (2026-06-19)

| Decision | Choice | Rationale |
|---|---|---|
| Map rendering | **Hand-drawn SVG** (Leaflet retired from home) | Full palette control, bulletproof route-draw, editorial feel, 0KB added, stronger a11y. ui-ux-pro-max db: "<1000 regions → SVG". We have 5 cities. |
| Section architecture | **Replace WhyPartner, fold why-us list in** | One map, no redundancy, most cohesive. Why-us points become a compact strip + woven value-prop badges per step. |
| Creative layers | **A** curved arcs + **B** cargo ghost + **C** ink-stamp arrivals + **D** active-route glow | All selected. E (floating city card), F (elevation progress), G (always-visible labels) included by default — low-cost, high-a11y. |
| Mobile pattern | **Sticky map on top, story below** | Keeps choreography intact on phones. Map sticky at top 52vh, steps stack beneath. |

## Scope

**In scope:**
- New `MapStorySection` replacing `WhyPartnerSection` on the home page.
- Hand-drawn SVG India map (5 cities, 6 routes) with scroll-driven choreography.
- Layers A–G as specified.
- `prefers-reduced-motion` full fallback.
- Mobile (<768px) sticky-map-on-top collapse.
- Lazy-load (dynamic import) since the section is below-the-fold.

**Out of scope:**
- Touching the existing `NetworkMap.tsx` / `NetworkMapSection.tsx` (kept on disk as fallback for a future `/coverage` page; no longer imported on home).
- Removing Leaflet from `package.json`.
- Adding new cities or routes beyond the existing 5/6.
- A 3D globe (future.md #31) — separate future round.
- Real-time data feeds — step copy and cities are static.

## Architecture

```
page.tsx (server)
  └─ <MapStorySection />                        (server shell, dynamic-imports the client story)
       ├─ Why-us strip (static, ~1 viewport)     — 5 value-props as icon+label row
       └─ <MapStory /> ("use client", dynamic)   — the set-piece, ~400–450vh
            ├─ Layout: CSS Grid 42% / 58% (desktop) | sticky map top / story below (mobile)
            ├─ <IndiaMapSVG activeStep={i} />     — SVG map + choreography controller
            │    ├─ India outline <path> (cream bg, ink stroke)
            │    ├─ 5 city nodes + always-visible <text> labels (G)
            │    ├─ 6 curved route arcs (A), dasharray-hidden, draw on step-activation
            │    ├─ Ludhiana HQ pulse rings (from #9)
            │    ├─ Active-route glow + dim completed (D)
            │    ├─ Cargo ghost dot per active route (B)
            │    ├─ Ink-stamp arrival per city (C)
            │    ├─ flyTo: animated <g transform> scale+translate
            │    └─ <title> per node/route (a11y)
            ├─ Story column: 5 blocks, IntersectionObserver → setActiveStep
            ├─ Floating city card (E) — absolute over SVG, Playfair name + teal tag
            └─ Elevation progress chart (F) — vertical SVG, 5 waypoints, synced to activeStep
```

**State:** single `activeStep` number (0–4) in `MapStory`, set by IntersectionObserver callbacks (event-driven, lint-safe per `react-hooks/set-state-in-effect`). Passed as prop to `IndiaMapSVG`, which drives all choreography via `useEffect` on `activeStep` change. No per-frame `setState` — all animation via rAF writing to refs / SVG attributes imperatively (mirrors `NetworkMap.tsx:84-86` pattern, `tasks/lessons.md:21`).

**No `window.addEventListener('scroll')`** (design-taste-frontend hard ban). Scroll position is observed via `IntersectionObserver` per story block.

## The SVG Map (IndiaMapSVG)

### Coordinate system
ViewBox `0 0 1000 1000`. City positions normalized from lat/lng (lng 68–97°E → x 80–920; lat 8–37°N → y 920–80, inverted for SVG):

| City | x | y | Role |
|---|---|---|---|
| Ludhiana | 308 | 257 | HQ (hub) |
| Amritsar | 279 | 236 | Border hub |
| Delhi | 346 | 323 | Distribution |
| Mundra | 130 | 491 | Port |
| Mumbai | 221 | 600 | Major port |

### India outline
A **stylized, simplified** India silhouette `<path>` — intentionally loose/editorial, not a textbook geo-accurate shape. Stroked in ink `#1E1B18` at 1.5px on cream `#FAF8F4` fill. Sourced from a public-domain simplified outline and normalized to the viewBox, OR hand-crafted as an abstract recognizable silhouette. The editorial direction favours "looks hand-traced" over "looks like a GIS export."

### City nodes & labels (G)
Each city = `<circle r=6>` (Ludhiana `r=8`) in teal `#0F766E` + `<text>` label. Labels always visible (never hover-gated) — Inter 500, ink-dim `#6B5E4A`, font-size 13. Ludhiana label: Inter 600, ink `#1E1B18` (hub emphasis). `<title>` per node for screen readers.

### Route arcs (A)
6 routes from `data.ts` (`routes` array). Each rendered as a **quadratic-bezier `<path>`** with a control point offset perpendicular from the chord midpoint, bowing away from India's centroid (~x500, y500). Stroke teal `#0F766E`, width 2.5. All start with `stroke-dasharray = pathLength; stroke-dashoffset = pathLength` (hidden). Drawn on step-activation by transitioning `stroke-dashoffset → 0` (~800ms, ease-out).

### Ludhiana HQ pulse rings (from #9)
3 concentric `<circle>` at Ludhiana, `r` animating 8 → 40, `opacity` 0.6 → 0, staggered 0.6s, infinite loop. CSS keyframes on `transform: scale()` + `opacity` only. Continuous — marks the HQ as the living heart. Under reduced-motion: one static ring at mid-state.

### Active-route glow (D)
Active route = double-stroke: a blurred wider teal under-stroke (`filter: blur(3px)`, width 6, opacity 0.5) + crisp top stroke (width 2.5). Completed routes → `stroke: #6B5E4A; opacity: 0.3` (ink-dim hairline). On the finale step (step 5, index 4): all routes glow at once — the "whole network alive" payoff.

### Cargo ghost (B)
After the active route's draw completes (~800ms), a single `<circle r=4>` in teal travels the full path: position via `path.getPointAtLength(t * pathLength)` in a rAF loop over ~1.2s. One deliberate journey per step, then rests at the destination. Replaces the current ambient `FreightDots` (which the ui-ux-pro-max db flags as distracting infinite animation — *"Continuous Animation: use for loading indicators only"*). Under reduced-motion: hidden.

### Ink-stamp arrival (C)
Per active city, a `<g>` containing a rotated `<rect>` + `<text>` (e.g. `DEPARTURE · LUDHIANA`) with an `feTurbulence` + `feDisplacementMap` SVG filter for ink-bleed texture. Slams down on step-entry: `transform: scale(2); opacity: 0` → `scale(1); opacity: 1` over 400ms with slight overshoot (spring-feel). One filter def reused for all stamps. Stamp labels per step (see story table). Under reduced-motion: appears static, pre-rotated, no slam.

### flyTo choreography
A wrapping `<g transform="translate(sx,sy) scale(sc)">` around the map contents. On `activeStep` change, animate `translate` + `scale` over ~600ms with `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out) via rAF. Each step has a target view (city center + zoom factor). Finale: zoom out to fit all. Under reduced-motion: instant cut (no rAF).

Target views (translate to center the city, scale up ~2.2× for city steps; finale scale ~1.0 fit-all):

| Step | Center (x,y) | Scale |
|---|---|---|
| 1 Ludhiana | 308, 257 | 2.2 |
| 2 Delhi | 346, 323 | 2.2 |
| 3 Mundra | 130, 491 | 2.2 |
| 4 Mumbai | 221, 600 | 2.2 |
| 5 Finale | 250, 400 | 1.1 |

## The Scroll Story (MapStory)

### Layout — desktop (≥768px)
CSS Grid `grid-cols-[42%_58%]`, gap. Left column: `<div class="sticky top-[88px] h-[calc(100dvh-88px)]">` containing the SVG map (88px clears the navbar). Right column: 5 story blocks, each `min-h-[80vh]`, total ~400–450vh. The grid is inside a `relative` section.

### Layout — mobile (<768px)
Single column. Map: `sticky top-0 h-[52vh]` at section top. Story blocks stack beneath, each `min-h-[auto] py-20`. Choreography intact, compressed. Step-progress chart becomes a horizontal row above the story.

### Scroll controller
Each story block gets an `IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"` (active = block crossing viewport center) → callback sets `activeStep` to that block's index. Observers created in `useEffect`, disconnected on cleanup. `activeStep` is the **only** state. No `window.scroll` listener.

### Floating city card (E)
Absolutely-positioned HTML card over the SVG, near the active city's screen position (computed from the city's viewBox coords + current transform). Playfair Display city name + teal eyebrow tag + one context line. Fades + translates in on step change (`opacity 0→1`, `translateY 8px→0`, 300ms ease-out). Under reduced-motion: instant.

### Step-progress elevation chart (F)
Thin vertical SVG (desktop) / horizontal row (mobile) — 5 waypoints connected by a teal line. Active = filled teal dot, completed = checkmark, upcoming = hollow ink-dim circle. Synced to `activeStep`. Doubles as scroll-progress indicator. Borrowed from trail-head elevation charts.

## The 5 Story Steps

Cities and routes from existing `data.ts`. The why-us value-props (`whyUsItems`) are woven in as per-step badges — the strip above is the index, the story is the proof.

| # | Eyebrow | Headline (Playfair) | Body (Inter, ≤2 lines) | Map action | Route drawn | Stamp | Value-prop badge |
|---|---|---|---|---|---|---|---|
| 1 | STEP 01 | Your cargo begins its journey in Ludhiana | Collected at your facility, surveyed, weighed, and packed for export-grade transport. | flyTo Ludhiana, rings fire | — | `DEPARTURE · LUDHIANA` | 24/7 Customer Support |
| 2 | STEP 02 | Documentation filed at Delhi ICD | ICEGATE filings, bills of lading, shipping bills, and DGFT compliance — handled end to end. | flyTo Delhi | Ludhiana→Delhi (arc) | `CUSTOMS FILED · DELHI` | Customs Compliance Assurance |
| 3 | STEP 03 | Transhipment at Mundra Port | Container stuffing, port handling, and vessel booking coordinated in a single window. | flyTo Mundra | Delhi→Mundra (arc) | `TRANSHIPMENT · MUNDRA` | Expertise & Experience |
| 4 | STEP 04 | Sea transit to Mumbai | FCL/LCL consolidation, vessel sailing, and tracking until discharge at destination port. | flyTo Mumbai | Mundra→Mumbai (arc) | `SAILED · MUMBAI` | Timely & Safe Delivery |
| 5 | STEP 05 | Door-to-door delivery | Last-mile road freight, proof of delivery, and a closed shipment file at your destination. | flyOut (fit all), all routes glow | (all visible) | `DELIVERED` | Cost Effective Solutions |

Step block markup: eyebrow (`STEP 0N`, Inter 600 uppercase tracking-wide — one eyebrow pattern across the 5 sub-blocks, within the 1-per-3-sections budget since this is one logical section), Playfair H3 headline, Inter body, teal value-prop badge with icon. Editorial restraint — no bullets, no nested feature lists.

## Why-us strip (top of section)

The 5 `whyUsItems` rendered as a compact horizontal row above the story: small teal icon circle + Inter 600 title + Inter 400 ink-dim one-line description, divided by hairlines. No cards, no shadows. ~1 viewport tall. Section heading in Playfair above it: "Why partner with us" (preserved from current section). This is the index; the story below is the proof.

## Reduced-Motion Fallback (mandatory)

When `prefers-reduced-motion: reduce` (detected via `window.matchMedia`):
- HQ rings: one static ring at mid-state, no expansion loop.
- flyTo: instant cut to target view, no rAF transition.
- Route-draw: routes appear fully drawn instantly (dashoffset = 0).
- Cargo ghost: hidden entirely.
- Ink-stamp: appears static, pre-rotated, no slam animation.
- Floating card: instant fade-in, no translate.
- Step-progress: still updates (informational, not motion).
- The story column scrolls normally; IntersectionObserver still drives `activeStep` so map + card + stamp + progress update — just without transitional motion.

All rAF loops and CSS transitions gated behind the media query / runtime check.

## Accessibility

- **Always-visible city labels (G):** per ui-ux-pro-max db — *"Geographic chart a11y: include text labels for major regions."* No hover-gated names.
- **SVG `<title>`** on each node and route for screen readers.
- **Story column is the primary text source:** the SVG is supplementary; all narrative content lives in the scrollable story blocks (keyboard-navigable, screen-reader-readable).
- **Reduced-motion:** full fallback above.
- **No horizontal scroll** (ui-ux-pro-max high severity): sticky-map column must not overflow on any breakpoint.
- **Focus order:** story blocks follow DOM order; map is a complementary visual.
- **Color:** teal `#0F766E` on cream `#FAF8F4` = 6.7:1 (AAA). Ink `#1E1B18` on cream = 17:1 (AAA). Verified in warm-editorial spec.

## Performance

- **Lazy-load:** `MapStory` is below-the-fold → `next/dynamic` import with `ssr: false` and a skeleton loader (matches `NetworkMapSection.tsx` pattern). Keeps it out of the initial bundle.
- **Animate transform/opacity only** (both skills): flyTo animates `<g transform>`, route-draw animates `stroke-dashoffset` (cheap paint on SVG paths), card uses opacity + translateY. No width/height/top/left animation.
- **No new dependencies:** pure SVG + IntersectionObserver + rAF. Leaflet stays installed but unused on home.
- **No `window.scroll` listener** (design-taste-frontend hard ban).

## Files

| File | Action | Responsibility |
|---|---|---|
| `next-app/src/lib/data.ts` | Modify | Add `StoryStep` interface + `storySteps: StoryStep[]` array; add `mapCities` coord map (x/y per city). Keep existing `cities`, `routes`, `whyUsItems`. |
| `next-app/src/app/globals.css` | Modify | Add keyframes for HQ rings, ink-stamp slam, route glow; reduced-motion guards. |
| `next-app/src/components/home/IndiaMapSVG.tsx` | Create | Client component: SVG map + all choreography (flyTo, route-draw, rings, ghost, stamp, glow, labels, card). Driven by `activeStep` prop. |
| `next-app/src/components/home/MapStory.tsx` | Create | Client component: sticky layout + IntersectionObserver scroll controller + 5 story blocks + elevation progress + floating card. Holds `activeStep` state. |
| `next-app/src/components/home/MapStorySection.tsx` | Create | Server shell: why-us strip + dynamic-import of `MapStory`. |
| `next-app/src/app/page.tsx` | Modify | Replace `WhyPartnerSection` import with `MapStorySection`. |
| `next-app/src/components/home/WhyPartnerSection.tsx` | Keep on disk, unimported | Retained as fallback. Not deleted. |
| `next-app/src/components/home/NetworkMap.tsx` | Keep on disk, unimported | Retained as fallback for future `/coverage` page. |
| `next-app/src/components/home/NetworkMapSection.tsx` | Keep on disk, unimported | Retained as fallback. |

## Verification Plan

1. **Build:** `cd next-app && npm run build` — 0 errors, all routes still static (`/`, `/services`, `/contact`, `/not-found`).
2. **Lint:** `cd next-app && npm run lint` — 0 errors, 0 warnings. Watch for `react-hooks/set-state-in-effect` (setState must be in observer callbacks, not effect body) and `react-hooks/immutability` (rAF loop fn held in ref).
3. **Visual desktop (Playwright):** sticky map flies per step, routes draw staggered, stamps slam, ghost travels, finale glows. Screenshot to `screenshots/map-story-desktop.png`.
4. **Reduced-motion (Playwright):** toggle `prefers-reduced-motion: reduce` → all motion collapses, story still reads, map updates per step. Screenshot to `screenshots/map-story-reduced.png`.
5. **Mobile 375px (Playwright):** map sticky at top 52vh, story stacks below, no horizontal scroll, choreography works. Screenshot to `screenshots/map-story-mobile.png`.
6. **A11y:** city labels visible, SVG `<title>` present, story column readable, focus order follows blocks.
7. **Palette audit:** every color from warm-editorial spec — cream `#FAF8F4`, ink `#1E1B18`, ink-dim `#6B5E4A`, teal `#0F766E`, hairline `#E8E4DB`. No new hexes.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| flyTo + route-draw collision (path re-projection resets dashoffset) | SVG has no projection — paths are static. dashoffset animation is independent of the `<g transform>`. No collision possible (this is the core reason we chose SVG over Leaflet). |
| `react-hooks/set-state-in-effect` lint failure | `setActiveStep` called from IntersectionObserver callback (event handler), not synchronous in effect body. rAF writes to refs/SVG attrs imperatively, no per-frame setState. |
| India outline looks wrong / not recognizable | Stylized editorial silhouette is the intent — "hand-traced" not "GIS export." Subagent sources a public-domain simplified outline and normalizes to viewBox; reviewed in visual verification. |
| Sticky map overflow on mobile | Map `h-[52vh]` sticky, story `min-h-[auto]` — no horizontal scroll. Verified at 375px. |
| Hydration mismatch | `MapStory` is `ssr: false` (dynamic import) — server renders the why-us strip + skeleton, client renders the story. No mismatch possible for the story. The why-us strip is pure static server HTML. |
| Performance: rAF loops janking | All rAF loops gated behind reduced-motion + cancelled on unmount. Only one active at a time (flyTo XOR ghost). transform/opacity only. |

## Success Criteria

- Home page scroll reaches the map-story section: map sticks, 5 steps scroll past, map flies to each city, routes draw, stamps slam, ghost travels, finale glows.
- Why-us value-props visible as a strip above the story + woven as badges per step.
- `prefers-reduced-motion` collapses all motion; story + map updates still work.
- Mobile 375px: sticky map on top, story stacks, no horizontal scroll.
- `npm run build` + `npm run lint` clean.
- Palette matches warm-editorial spec, no new hexes.
- Leaflet map files retained on disk but not imported on home.
