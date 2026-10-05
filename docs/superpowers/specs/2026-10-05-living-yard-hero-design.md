# Living-Yard Hero — "Ludhiana, Live" (Design Spec)

**Date:** 2026-10-05 · **Branch:** `redesign/immersive-2026` · **Status:** draft for review
**Concept source:** brainstorm session 2026-10-05 (visual companion at `localhost:65250`, session in `.superpowers/brainstorm/63090-1791234973/`)
**Replaces:** the dot-globe hero (`GlobeHero.tsx`). The rest of the site is untouched.

## Concept

One continuous shot, then a world that keeps running. The homepage opens like a clearances
operation: the camera descends from a stylized northern-India network view into Shivaay's
Ludhiana ICD yard, which then runs live behind the headline — gantry crane cycling, trucks
rolling out on real routes, stacks growing, waybills readable by cursor. The story is the
product: cargo arrives → is cleared → ships.

## Decisions locked

1. **Concept:** dive + living yard ("boss combo").
2. **Stack:** adopt `@react-three/fiber@9` + `drei` (MIT, React 19 compatible) for the hero only.
   `maath` for damped math. No state library — a tiny external store for cursor data.
3. **Cursor:** Inspector Waybill (A) + Scanner hover (B) + contextual Stamp variants (D) as one
   system. Route Trail (C) cut for coherence, logged as optional garnish.
4. **Assets:** procedural-first for brand exactness; verified-CC0 GLBs only for recognizable
   vehicles. Provenance recorded.

## Goals / success criteria

- Visitor understands "Ludhiana inland customs → ports" within the first seconds; the yard is
  unmistakably freight, unmistakably Shivaay (cream/teal/orange, corrugated, waybills).
- Feels complex and alive without breaking B2B trust: coordinated motion, no chaos.
- Zero regressions: all existing copy/CTAs/CHA chip/stats preserved and crawlable.
- Hero stays **lazy and home-only**; initial JS on every route unchanged (~198 KB gz).
- Hard verifiable fallbacks: reduced-motion still frame, no-WebGL SVG, GLB-failure stand-ins —
  all with zero console errors.

## Non-goals

- No changes to other sections or routes. No dark mode. No WebGPU. No physics engine.
- No scroll hijacking beyond a bounded sticky scrub (interruptible, releases into page flow).
- No audio. No new copy besides micro-labels (waybill fragments, status text).

## Scene design

### Network layer (dive start)
- Stylized northern-India terrain: low-poly displaced plane in ivory/cream tones, blueprint-grid
  underlay. Not photoreal, not a globe.
- Five city beacons from `lib/data.ts` `cities` (Ludhiana emphatic; Amritsar/Delhi/Mumbai/Mundra
  secondary); dashed freight lines from `routes` (reuse the quadratic-arc math from the old
  `GlobeHero`). Mono city labels.
- One coordinate system: the yard is placed at the Ludhiana beacon's map position, so the dive is
  a literal zoom into the point (no scene swap cuts).

### Yard (settle state)
- Ground: concrete plane, painted lane markings (canvas texture), scale hint props.
- **Container stacks: instanced boxes**, corrugated via normal/roughness, tinted with the services
  wall's cycle (`TEAL_CYCLE #0F766E / #134E4A / #0D9488`, every 5th `#EA580C`) — visual continuity
  with `/services`. 80–150 instances across blocks A/B/C, stacks 1–4 high.
- **Procedural structures:** gantry crane (rail, legs, trolley, spreader), reach stacker, gate
  with cycling boom barrier, warehouse silhouette, "SHV-###" decals + barcode strips
  (CanvasTexture, the site's motif language).
- **CC0 GLB vehicles** (recognizable things only): 2 box trucks — Kenney Car Kit (CC0). Optional
  phase-2: rail siding + wagons — Kenney Train Kit (CC0). Quaternius "Shipping Port" pieces only
  if they suit an inland ICD; otherwise skipped.
- **Atmosphere:** light-mode rig (hemisphere + directional), soft contact shadows (no realtime
  shadow maps), light fog for depth, floating mono waybill labels above 8–12 stacks.
- All layout from a **seeded PRNG** (existing mulberry32 pattern) → deterministic, SSR-safe.

### Agents (the "alive" layer)
- **Gantry crane state machine:** trolley → hoist → pick → traverse → place, ~12–16 s loop with
  pauses. Carried container parents to the spreader during transit.
- **Two trucks** on CatmullRom paths: arrive at gate → lane → exit toward a route; barrier cycles
  for them. (Wheel spin only if the GLB has separable wheels — cosmetic.)
- **Reach stacker:** shuffles one stack every ~20 s.
- Everything pauses when the hero is offscreen (IntersectionObserver + `useFrame` gate) and when
  the tab is hidden.

## Choreography

| Phase | What happens |
|---|---|
| 0–1.5 s | Preloader doors open (existing). Canvas warms behind it. |
| 1.5–4.5 s | **Auto-dive:** network view → cloud-band wipe (~progress 0.45 masks the scale change) → yard fills frame. Ease in-out; skippable by scroll, click, or a discreet keyboard-focusable Skip control. |
| Settled | Copy/CTA fade in over the existing cream scrim. Yard runs live. Camera static (calm) with damped pointer parallax only. |
| Scroll | Hero is sticky inside a ~220vh wrapper; scroll scrubs the dive if the user gets there first; at end it releases into normal page flow. |
| Revisits | Full dive **once per session** (`sessionStorage sl-hero-seen`); later visits start mid-progress and settle in ~1 s. |

- **Pointer:** damped orbit offset (±6° yaw, ±3° pitch) around the settled pose; drag-to-orbit is
  *not* required (avoid fighting the page) — hover-interaction only.
- **Mobile:** no scrub (sticky zone collapses): one-shot dive when in view, then settled yard with
  fewer agents.
- **Reduced motion:** no dive, no parallax — straight to the settled still frame, agents parked.
- **No WebGL:** static SVG yard illustration + existing copy (zero errors).

### Preloader handoff
`Preloader.tsx` dispatches `window.dispatchEvent(new Event("sl:preloader-done"))` when its
sequence finishes. `HeroStage` listens; if the event doesn't arrive within 2.5 s (preloader
skipped/absent), it starts the dive on its own. Reduced-motion skips both.

## Cursor system (extends `Cursor.tsx`, DOM layer)

- **Idle:** existing soft ring. **Active:** existing expansion.
- **Scanner:** elements with `data-scan` get a sweep highlight (DOM overlay box drawn from
  `getBoundingClientRect`, dashed border + scan line) and emit data.
- **Waybill tag:** small fixed-position card near the cursor, fed by
  `data-waybill='{"id":"SHV-001","label":"Customs Clearance","route":"LDH → MUNDRA","eta":"24H"}'`
  or, for canvas agents, by the R3F raycast writing into `lib/cursor-store.ts`
  (`useSyncExternalStore`). Hovering a yard truck/stack reads *its* waybill.
- **Stamp variants:** `data-stamp="cleared|scanned|signed|stacked"` — CLEARED (quote/CTA, default),
  SIGNED (form submit), SCANNED (gallery open), STACKED (container wall flip). Existing thunk kept.
- **Rules:** fine-pointer only; native cursor stays visible; every element `pointer-events: none`;
  all of it returns `null` under reduced motion; waybill info must not be *only* available via the
  cursor (DOM duplicates it where meaningful).

## Architecture

```
src/components/hero/
  HeroSection.tsx        // server component: overlay copy + client mount (replaces old HeroSection)
  HeroOverlay.tsx        // existing copy/CTA/CHA/stats DOM (content preserved, staged reveal)
  HeroStageMount.tsx     // "use client": React.lazy-mounts the 3D stage after hydration; renders
                         //   the static fallback until the lazy chunk resolves
  scene/
    HeroStage.tsx        // <Canvas>, lights, fog, quality tier, context-loss guard
    CameraRig.tsx        // keyframed dive (positions+targets spline), progress driver, parallax
    NetworkLayer.tsx     // terrain + beacons + routes (uses lib/data)
    Yard.tsx             // ground, instanced stacks, crane, gate, structures
    Agents.tsx           // trucks, crane cycle, reach stacker state machines
    StackLabels.tsx      // floating mono labels (drei <Html> — no new font asset)
  fallback/
    YardFallback.tsx     // static SVG illustration (also the no-WebGL/context-loss state)
src/lib/
  yard.ts                // seeded layout + schedules
  cursor-store.ts        // tiny external store for waybill data
```

- **Data flow:** `lib/data.ts` stays read-only source for cities/routes; `lib/yard.ts` derives
  deterministic layout; agents read schedules; cursor store is written by DOM (`data-waybill`)
  or R3F pointer events and read by `Cursor.tsx`. No runtime APIs (static export safe).
- **Lazy loading:** R3F/drei live only inside the lazy stage chunk. Crawlers/no-JS keep seeing the
  full overlay copy + SVG fallback (the current no-JS contract).
- **`GlobeHero.tsx` is retired** (git history keeps it); the old globe's WebGL-probe and fallback
  philosophy carries over, not its code.

## Assets & provenance

| Asset | Source | License | Use |
|---|---|---|---|
| Box truck A/B | Kenney Car Kit (kenney.nl/assets/car-kit, glTF) | CC0 | Agents |
| Quaternius Shipping Container | poly.pizza/m/dQXRtm5GbO | CC0 | Optional hero prop (else procedural) |
| Kenney Train Kit (phase 2) | kenney.nl/assets/train-kit | CC0 | Optional rail siding |

- Only the used GLBs land in `public/models/`; download dates + source URLs recorded in
  `docs/resources-source-manifest.md` (new "3D models" section).
- Reference projects studied for patterns only (no code copying): Meridian Terminal
  (unlicensed), cargoShip3JS (unlicensed), shipping_container POC (unlicensed).

## Performance budget

- Initial JS unchanged (~198 KB gz on every route).
- Home hero lazy transfer target: **≤ 450 KB gz** total (three ~180 + R3F/drei ~50–70 + models
  ≤ 150 + app code ~20). Models are low-poly, untextured or vertex-colored; no KTX2/Draco unless
  measured over budget.
- Draw calls ≤ 60; triangles ≤ 250 k; DPR clamped 2 (1.5 mobile); **no per-frame shadow maps**
  (ContactShadows or blob planes); single render loop via R3F; paused offscreen/hidden.
- Mobile tier: fewer stacks (~60), one truck + crane, no contact shadows, DPR 1.5.

## Fallbacks & error handling

| Condition | Behavior |
|---|---|
| Reduced motion | Settled still frame, agents parked, cursor extras off |
| No WebGL (probe before mount) | SVG yard illustration, zero console errors |
| `webglcontextlost` | Swap to SVG fallback; no errors logged |
| GLB load failure | Procedural box-vehicle stand-in; scene never breaks |
| Preloader event missing | Dive self-starts after 2.5 s (or immediately under reduced motion) |
| Offscreen/hidden tab | Render loop pauses; agents resume without time jumps |

## Accessibility

- Canvas `aria-hidden`; all essential content remains in the DOM overlay (crawlable, no-JS safe).
- No essential information lives only on the canvas or only in the cursor tag.
- Keyboard flow unchanged; hero CTAs remain normal links/buttons; focus rings untouched.
- Motion: dive skippable (scroll/click/Skip control), once-per-session, reduced-motion honored at
  all tiers.

## Verification (per milestone)

- `npm run build` (all routes static) + `npm run lint`, every milestone.
- Playwright geometry/behavior asserts: canvas mounts non-zero; dive completes; sticky scrub
  releases (document height sane); hover `data-scan` → tag appears; click → stamp variant;
  reduced-motion → still frame; WebGL-off → SVG fallback + **0 console errors**; mobile 390 px,
  no overflow.
- Bundle check from `out/`: hero chunk lazy, home-only; report numbers vs the ≤450 KB gz target.
- Screenshots (desktop/mobile/fallbacks) reviewed with native vision; regression pass on
  preloader handoff + door-wipe transitions + all other routes.
- Client preview on the branch before any merge (main stays production).

## Open questions

1. Phase-2 rail siding — yes/no (perf + motion-density verdict from client).
2. Motion density sign-off (client) — if "too much", we drop the auto-dive to a short settle and
   keep the living yard; spec already supports that.
3. Final truck choice (Kenney models vs a Quaternius alternative) — pick at implementation by
   visual comparison.

## Out of scope

Physics crates rework, other-page 3D, dark mode, new dependencies beyond R3F/drei/maath (all MIT),
any non-CC0 asset, scroll hijacking outside the bounded hero scrub.
