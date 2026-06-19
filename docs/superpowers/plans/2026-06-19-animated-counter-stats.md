# Animated Counter Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero's 3 static stat tiles with 5 animated counters that tick up from 0 on scroll-into-view, respecting `prefers-reduced-motion` and the no-JS / static-export constraints.

**Architecture:** A new `"use client"` `AnimatedCounter` component uses `IntersectionObserver` to detect first viewport entry, then a single `requestAnimationFrame` loop with delta-time + ease-out cubic to count up to the target. The current display value is written imperatively to a `ref.textContent` (no per-frame `setState` — avoids the `react-hooks/set-state-in-effect` lint rule that bit this project before). Stats data moves to `data.ts` as `heroStats`; `HeroSection` maps over it. Initial server render shows final values (no-JS / crawler safe); the reset-to-0 + count-up happens in `useEffect` (post-hydration, mismatch-free).

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19.2.4, TypeScript 5, Tailwind v4. No new dependencies. No test framework — verification is `npm run build` + `npm run lint` + Playwright visual (per `tasks/lessons.md:8-9`).

**Spec:** `docs/superpowers/specs/2026-06-19-animated-counter-stats-design.md`

**Lint gotchas to honour** (from `next-app/AGENTS.md` + `tasks/lessons.md`):
- `react-hooks/set-state-in-effect`: no synchronous `setState` in `useEffect`. `setHasStarted` must be called from the IntersectionObserver callback (event handler), not in the effect body.
- `react-hooks/immutability`: for self-referencing `requestAnimationFrame`, hold the loop function in a `useRef` (mirror of `NetworkMap.tsx` pattern).
- Use `next/image` and `next/link` where applicable (not raw `<img>`/`<a>`) — N/A here, no images/links in this feature.

**All file paths are relative to repo root** `/home/garvit/projects/logistics1`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `next-app/src/lib/data.ts` | Modify (add ~15 lines after line 33) | `Stat` interface + `heroStats` array — single source of truth |
| `next-app/src/app/globals.css` | Modify (add ~12 lines after the reveal block, ~line 178) | `.stat-counter` typography + `tabular-nums` + reduced-motion guard |
| `next-app/src/components/home/AnimatedCounter.tsx` | Create (~85 lines) | Client component: observer + rAF + easing + stagger + reduced-motion + SSR-safe |
| `next-app/src/components/home/HeroSection.tsx` | Modify (replace lines 30-42) | Map `heroStats` → `<AnimatedCounter>`, adjust gap classes |

---

### Task 1: Add `Stat` interface and `heroStats` to `data.ts`

**Files:**
- Modify: `next-app/src/lib/data.ts` (insert after the `WhyUsItem` interface block, ~line 33)

- [ ] **Step 1: Add the `Stat` interface and `heroStats` export**

Open `next-app/src/lib/data.ts`. After the `WhyUsItem` interface (which ends at line 33), insert:

```typescript
export interface Stat {
  value: number;
  suffix: string;
  label: string;
  compact?: boolean;
}

export const heroStats: Stat[] = [
  { value: 15, suffix: "+", label: "Years Experience" },
  { value: 800, suffix: "+", label: "Happy Clients" },
  { value: 5, suffix: "", label: "Major Ports" },
  { value: 12000, suffix: "+", label: "Shipments Cleared", compact: true },
  { value: 1200, suffix: "+", label: "Containers Moved" },
];
```

Notes:
- `compact: true` on the 12000 stat means it renders as `12k` (thousands-divided, one decimal max) rather than `12000`. This is the design decision from the spec — a 5-digit counter would visually dominate its neighbours.
- `suffix` is a string so the empty-string case ("Major Ports") is uniform.

- [ ] **Step 2: Verify the file still type-checks**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors. (If `tsc` isn't on PATH, `npm run build` in the final verification task covers this too — but a quick `tsc --noEmit` here catches type errors before writing the component.)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/data.ts
git commit -m "feat(counters): add heroStats data source"
```

---

### Task 2: Add `.stat-counter` CSS to `globals.css`

**Files:**
- Modify: `next-app/src/app/globals.css` (insert after the reduced-motion reveal block, ~line 178)

- [ ] **Step 1: Add the `.stat-counter` rule**

Find the reduced-motion block for `.reveal` (ends around line 178 — the block that contains `.lightbox { transition: none; }`). Immediately **after** that block's closing `}`, insert:

```css
/* ---- Animated stat counters ---- */
.stat-counter {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

@media (prefers-reduced-motion: reduce) {
  .stat-counter {
    transition: none;
  }
}
```

Notes:
- `tabular-nums` keeps digit columns the same width so the number doesn't jitter horizontally as it counts up. Critical for visual stability.
- The reduced-motion block is defensive — the JS path already short-circuits, but this guarantees no CSS transition interferes if any is added later.
- Do **not** put font-size / color / weight here. Those stay as Tailwind classes on the element in the component, matching the existing editorial approach (utility-first, custom CSS only for things Tailwind can't express cleanly).

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/globals.css
git commit -m "feat(counters): add stat-counter tabular-nums css"
```

---

### Task 3: Create `AnimatedCounter.tsx`

**Files:**
- Create: `next-app/src/components/home/AnimatedCounter.tsx`

- [ ] **Step 1: Write the component**

Create `next-app/src/components/home/AnimatedCounter.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/lib/data";

interface AnimatedCounterProps {
  stat: Stat;
  index: number;
}

const DURATION = 1600;
const STAGGER = 200;

function formatValue(value: number, stat: Stat): string {
  if (stat.compact) {
    const k = value / 1000;
    const rounded = Math.round(k * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
  }
  return Math.round(value).toLocaleString("en-IN");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({ stat, index }: AnimatedCounterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);

  const finalText = `${formatValue(stat.value, stat)}${stat.suffix}`;

  useEffect(() => {
    const el = containerRef.current;
    const display = displayRef.current;
    if (!el || !display) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      display.textContent = finalText;
      startedRef.current = true;
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            setHasStarted(true);
            observer.unobserve(entry.target);

            const startDelay = index * STAGGER;
            const startTime = performance.now() + startDelay;

            const tick = (now: number) => {
              if (now < startTime) {
                display.textContent = `0${stat.suffix}`;
                rafRef.current = requestAnimationFrame(tick);
                return;
              }
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / DURATION, 1);
              const eased = easeOutCubic(progress);
              const current = eased * stat.value;
              display.textContent = `${formatValue(current, stat)}${stat.suffix}`;
              if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
              } else {
                display.textContent = finalText;
                rafRef.current = null;
              }
            };
            rafRef.current = requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [stat, index, finalText]);

  return (
    <div ref={containerRef}>
      <span
        ref={displayRef}
        className={`stat-counter text-2xl sm:text-3xl font-bold text-teal ${hasStarted ? "" : "opacity-0 sm:opacity-100"}`}
      >
        {finalText}
      </span>
      <div className="text-xs text-ink-dim mt-0.5">{stat.label}</div>
    </div>
  );
}
```

**Why this is correct (read before committing):**

1. **No hydration mismatch:** First render (server + first client) outputs `finalText` as the `<span>`'s children. The `useEffect` then imperatively rewrites `display.textContent` — but `useEffect` runs *after* hydration, so React doesn't see a mismatch. This is the same pattern `NetworkMap.tsx` uses for its animated dots.

2. **Lint-safe `setState`:** `setHasStarted(true)` is called from inside the `IntersectionObserver` callback and the `reduceMotion` early-return — both are event-driven / conditional paths, **not** synchronous top-level calls in the `useEffect` body. This satisfies `react-hooks/set-state-in-effect`.

3. **Imperative rAF updates:** The count-up writes to `display.textContent` directly. No `setState` in the animation loop. This is critical — per-frame React re-renders would be both slow and a lint violation.

4. **Reduced motion:** Early return sets the final text and `hasStarted=true` immediately, no rAF scheduled. The CSS guard in Task 2 is a belt-and-braces backup.

5. **No-JS / SSR:** The server render contains `finalText` (e.g. `15+`). Without JS, that's what the user sees forever. Correct.

6. **The `opacity-0 sm:opacity-100` class trick:** On mobile only, before the counter starts, the number is hidden to avoid a flash of the final value followed by a jarring reset to `0`. On desktop (where the hero is above the fold and the observer fires immediately) we keep it visible. After `hasStarted` flips true, opacity goes to 100. This is a refinement — if it causes any visual oddness in verification, drop the opacity classes entirely and rely on the immediate observer fire (the hero is typically above the fold). **Verify this in Task 5's visual check and adjust if needed.**

7. **Cleanup:** `observer.disconnect()` + `cancelAnimationFrame` on unmount. No leaks.

8. **`toLocaleString("en-IN")`:** Indian numbering for the 1200 stat renders as `1,200` not `1200`. Culturally appropriate for this site. The compact 12000 path bypasses this and uses `12k`.

- [ ] **Step 2: Type-check**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors. Watch for: unused `hasStarted` (it's used in the className — fine), missing `Stat` export (added in Task 1), `performance` not defined (it's a browser global, TS DOM lib has it — fine).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/AnimatedCounter.tsx
git commit -m "feat(counters): add AnimatedCounter client component"
```

---

### Task 4: Wire `AnimatedCounter` into `HeroSection.tsx`

**Files:**
- Modify: `next-app/src/components/home/HeroSection.tsx` (replace the stats block, lines 30-42)

- [ ] **Step 1: Replace the static stats block**

Open `next-app/src/components/home/HeroSection.tsx`. Replace the entire `{/* Micro stats ... */}` block (lines 30-42) with:

```tsx
          {/* Micro stats — animated counters, no cards, just type */}
          <div className="flex flex-wrap gap-6 sm:gap-8 lg:gap-10 pt-6 border-t border-border">
            {heroStats.map((stat, i) => (
              <AnimatedCounter key={stat.label} stat={stat} index={i} />
            ))}
          </div>
```

And update the imports at the top of the file. The file currently has no imports (it's a pure server component returning JSX). Add:

```tsx
import { AnimatedCounter } from "./AnimatedCounter";
import { heroStats } from "@/lib/data";
```

at the very top of the file (line 1, before `export function HeroSection()`).

**Why `HeroSection` stays a server component:** It only renders static markup + the client `AnimatedCounter` children. Next.js handles the client/server boundary automatically — the `"use client"` directive on `AnimatedCounter` is sufficient. No need to make `HeroSection` itself a client component. (This matches the `GalleryLightbox` pattern noted in `tasks/lessons.md:13`.)

- [ ] **Step 2: Build + lint**

Run: `cd next-app && npm run build`
Expected: 0 errors, 4 routes static (`/`, `/services`, `/contact`, `/not-found`), compile time ~5s. The `AnimatedCounter` import must resolve — if you see "Cannot find module './AnimatedCounter'", the file from Task 3 isn't on disk yet.

Run: `cd next-app && npm run lint`
Expected: 0 errors, 0 warnings. If `react-hooks/set-state-in-effect` fires, re-read the "Why this is correct" note in Task 3 — the `setState` calls are in callbacks, not synchronous in the effect body. If it still fires, the lint rule may be flagging the `reduceMotion` early-return path; that path calls `setHasStarted(true)` synchronously inside `useEffect`. **Fix:** wrap that in a microtask: `queueMicrotask(() => setHasStarted(true))`. Re-run lint. (Only do this if the lint actually fails — don't preemptively add it.)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/HeroSection.tsx
git commit -m "feat(counters): wire AnimatedCounter into hero"
```

---

### Task 5: Visual + behavioural verification

**Files:** None modified — verification only.

- [ ] **Step 1: Build the static export and serve it**

Run: `cd next-app && npm run build`
Then serve the export: `npx serve out -l 4173` (in a separate shell, or background it). Confirm `curl -s http://localhost:4173/ | grep -o '15+\|[0-9]k+\|Years Experience'` returns hits — the server-rendered HTML contains the final values (no-JS fallback).

- [ ] **Step 2: Playwright desktop snapshot — initial + post-scroll**

Use Playwright (`playwright_browser_navigate` to `http://localhost:4173/`, then `playwright_browser_snapshot`). Confirm:
- The hero stats row shows 5 stats.
- After a scroll, the numbers have reached their final values: `15+`, `800+`, `5`, `12k+`, `1,200+`.

Take a screenshot (`playwright_browser_take_screenshot`) and save to `screenshots/counters-desktop.png` (the `screenshots/` dir is gitignored per `tasks/lessons.md:36`).

- [ ] **Step 3: Playwright reduced-motion check**

Emulate `prefers-reduced-motion: reduce` via `playwright_browser_evaluate`:
```js
() => { window.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener(){}, removeEventListener(){} }); }
```
Then reload (`playwright_browser_navigate` to `/` again — the override must be in place before the component hydrates; if it's flaky, use `playwright_browser_run_code_unsafe` to set the emulation on the page before navigation). Confirm the stats show final values immediately with no count-up animation.

- [ ] **Step 4: Playwright mobile layout check (375px)**

Resize: `playwright_browser_resize` to `width: 375, height: 667`. Navigate to `/`. Snapshot. Confirm the 5 stats wrap without horizontal overflow — they should flow to a second row if needed (`flex-wrap` is set). Screenshot to `screenshots/counters-mobile.png`.

- [ ] **Step 5: Hydration check**

In the desktop Playwright session, capture console messages (`playwright_browser_console_messages`, level `warning`). Confirm there are **no** "Hydration mismatch" or "Text content does not match server-rendered HTML" warnings. If there are, the issue is the first client render not matching server — revisit Task 3's first-render logic. (Expected: none, because we render `finalText` on both server and first client render, and only mutate post-hydration in `useEffect`.)

- [ ] **Step 6: Document verification results**

Append a short "Verification" section to `tasks/lessons.md` (or a new `tasks/animated-counters-verification.md`) recording: build status, lint status, screenshot paths, any deviations found and fixed. This follows the project's pattern of recording verification evidence (`tasks/todo.md:51-54`).

- [ ] **Step 7: Final commit (if any verification fixes were made)**

If verification surfaced fixes, commit them:
```bash
git add -A
git commit -m "fix(counters): <what was fixed>"
```
If no fixes were needed, no commit — the implementation commits in Tasks 1-4 stand.

---

## Self-Review Checklist (run before declaring done)

- [ ] **Spec coverage:** Every "In scope" item in the spec has a task. (stats → Task 1, behaviour → Task 3, visual → Tasks 2+4, reduced-motion → Task 3, no-JS → Task 3 first render, SSR/hydration → Task 3 + verified Task 5 Step 5.) ✓
- [ ] **No placeholders:** No "TBD", no "implement appropriate handling", no "similar to above". All code is complete. ✓
- [ ] **Type consistency:** `Stat` interface fields (`value: number`, `suffix: string`, `label: string`, `compact?: boolean`) match usage in `AnimatedCounter` (`stat.value`, `stat.suffix`, `stat.label`, `stat.compact`). ✓
- [ ] **Lint gotchas addressed:** `set-state-in-effect` (Task 3 note + Task 4 fallback), `immutability` (rAF held in ref), `next/image`/`next/link` (N/A). ✓
- [ ] **Verification has teeth:** Build + lint + 4 Playwright checks (desktop, reduced-motion, mobile, hydration). ✓
