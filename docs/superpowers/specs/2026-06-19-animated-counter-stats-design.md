# Animated Counter Stats — Design Spec

> **Source:** `future.md` #3 (brainstormed 2026-06-13). This spec deepens the picked-favorite idea into a buildable design.
> **Parent feature set:** Part of the 4-feature "10x MVP" package (scroll-driven map story, live shipment ticker, animated counters, customs clearance flow). This spec covers **animated counters only**.

## Goal

Replace the static hero stat tiles ("15+ / 800+ / 5") with counters that tick up from 0 to their final value when scrolled into view. Premium, subtle, no extra visual noise — matches the warm editorial direction.

## Why

The hero is the first thing a visitor sees. Static numbers are fine; numbers that **count up** signal a live, active business and add a moment of delight without clutter. It's the cheapest "premium feel" upgrade in the 4-feature package and the lowest risk.

## Scope

**In scope:**
- Animate the hero stats on the home page (`HeroSection.tsx`).
- Expand from 3 stats to 5 (per locked design decision, 2026-06-19).
- Respect `prefers-reduced-motion`.
- Work under the static-export constraint (`output: "export"`) — pure client component, no API.

**Out of scope:**
- Counters anywhere except the hero (no services/contact page counters this round).
- Real-time data feeds — values are hardcoded.
- Configurable durations via props beyond the documented defaults.

## Stats

Locked set (approved 2026-06-19):

| Stat | Target | Suffix | Label |
|---|---|---|---|
| Years | 15 | `+` | Years Experience |
| Clients | 800 | `+` | Happy Clients |
| Ports | 5 | none | Major Ports |
| Shipments | 12000 | `+` | Shipments Cleared |
| Containers | 1200 | `+` | Containers Moved |

Display rules:
- 12000 renders as **12k** during animation and as **12k+** at rest (compact form for the large number; avoids a 5-digit counter that visually dominates its neighbours).
- The `+` suffix appears throughout the animation, attached to the current value (e.g. `7+`, `352+`, `12k+`).
- "Major Ports" has no suffix — it renders as `5` at rest.

## Behaviour

1. **Trigger:** `IntersectionObserver` on the stats container, `threshold: 0.3`, `rootMargin: "0px 0px -40px 0px"` (mirrors `ScrollReveal.tsx:19`). Fires once — unobserve after first intersection.
2. **Animation:** `requestAnimationFrame` loop with delta-time accumulation and **ease-out cubic** (`1 - (1 - t)^3`). Duration: **1600ms** per stat.
3. **Stagger:** Stats start 200ms apart, in order: Years → Clients → Ports → Shipments → Containers. A stat does not begin counting until its stagger delay elapses; before that it shows `0` (with its suffix).
4. **Once-only:** Animation runs once per page load. Scrolling away and back does not re-trigger.
5. **Reduced motion:** When `prefers-reduced-motion: reduce`, skip the rAF loop entirely and render the final value immediately. No transition.
6. **No-JS fallback:** Server-rendered HTML shows the final values (e.g. `15+`, `800+`, `5`, `12k+`, `1200+`). The client component hydrates and only re-runs the count-up if JS is present and motion is allowed. This keeps crawlers/screenshots/no-JS users seeing correct numbers — same progressive-enhancement philosophy as `ScrollReveal` (`globals.css:153-166`).
7. **SSR/hydration:** Initial server render and first client render must produce identical markup to avoid hydration mismatch. The component renders the **final formatted value** on first paint, then on `useEffect` (client-only) resets to `0` and counts up if motion is allowed. The reset-to-0 happens inside `useEffect`, which is post-hydration and therefore safe.

## Visual Design

Follows `future.md:24` and the warm-editorial palette (`globals.css:3-19`):

- **Number:** Inter, `font-bold`, fluid size via `clamp()` — `clamp(2rem, 4vw, 3rem)`. Color `text-teal` (`#0F766E`). `tabular-nums` to prevent layout jitter as digits change.
- **Suffix (`+`):** same color and weight as the number, inline.
- **Label:** Inter, `text-xs` (0.75rem), `text-ink-dim` (`#6B5E4A`), `mt-0.5`. Unchanged from current.
- **Container:** Existing `flex gap-10 pt-6 border-t border-border` row in `HeroSection.tsx:31`. 5 stats instead of 3 — adjust gap to `gap-6 sm:gap-8 lg:gap-10` so they fit on mobile.
- **No cards, no shadows** — type-only, matching current treatment.

## Files

| File | Action | Responsibility |
|---|---|---|
| `next-app/src/lib/data.ts` | Modify | Add `Stat` interface + `heroStats: Stat[]` array (single source of truth) |
| `next-app/src/app/globals.css` | Modify | Add `.stat-counter` rule (font + `tabular-nums` + reduced-motion guard) |
| `next-app/src/components/home/AnimatedCounter.tsx` | Create | Client component: IntersectionObserver + rAF + easing + stagger + reduced-motion + no-JS-safe SSR |
| `next-app/src/components/home/HeroSection.tsx` | Modify | Replace inline static stat array with `heroStats` map + `<AnimatedCounter>` per stat |

## Architecture

```
HeroSection (server component, unchanged server-ness)
  └─ heroStats.map(stat => <AnimatedCounter stat={stat} index={i} />)
       └─ AnimatedCounter ("use client")
            ├─ useRef for container (IntersectionObserver target)
            ├─ useRef for display node (text content updated imperatively — no setState in rAF)
            ├─ useState hasStarted (set once in IntersectionObserver callback — event-driven, lint-safe)
            └─ useEffect: observe → on intersect, run rAF count-up with stagger delay
```

**Key lint-safety note** (`tasks/lessons.md:21`): `react-hooks/set-state-in-effect` forbids synchronous `setState` in `useEffect`. We avoid this entirely — `setHasStarted(true)` is called from the **IntersectionObserver callback** (an event handler, not a synchronous effect body), and the count-up itself updates the DOM imperatively via `ref.textContent` (no per-frame `setState`). This is the same imperative-DOM pattern the map uses in `NetworkMap.tsx:84-86`.

## Testing / Verification

No unit test framework is installed (`package.json` has no jest/vitest). Verification follows the project's established pattern (`tasks/todo.md:51-54`, `tasks/lessons.md:8-9`):

1. **Build:** `npm run build` from `next-app/` — 0 errors, 4 routes still static.
2. **Lint:** `npm run lint` from `next-app/` — 0 errors 0 warnings.
3. **Visual / behavioural:** Playwright snapshot of the hero section before scroll (shows `0+` / `0+` / `0` / `0k+` / `0+` post-hydration if motion allowed) and after scroll-in (shows final values). Also verify `prefers-reduced-motion` shows finals immediately, and that mobile (375px) lays out 5 stats without overflow.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hydration mismatch (server renders final, client renders 0) | First client render matches server (renders final); reset-to-0 happens in `useEffect`, post-hydration. Verified in Task 4. |
| `react-hooks/set-state-in-effect` lint failure | `setHasStarted` is event-driven (observer callback), not synchronous in effect. rAF updates DOM imperatively, no setState. |
| 5 stats overflow on narrow mobile | `gap-6` on mobile + fluid `clamp()` font; verify at 375px in Task 5. |
| `prefers-reduced-motion` users see a flash of 0 then final | Reduced-motion path renders final on first paint and skips the reset-to-0 entirely. |
| 12000 counting digit-by-digit looks visually noisy | Compact `12k` form throughout; verified in visual check. |

## Success Criteria

- Hero stats count up from 0 with ease-out cubic, 200ms stagger, 1600ms duration, on first scroll into view.
- `prefers-reduced-motion` users see final values immediately, no motion.
- No-JS users and crawlers see final values in the HTML.
- `npm run build` and `npm run lint` both clean.
- Hero looks correct at 375px, 768px, 1280px.
- Hydration matches on first paint (no React warning in console).
