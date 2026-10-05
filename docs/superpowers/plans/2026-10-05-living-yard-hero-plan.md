# Living-Yard Hero + Cursor System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Those skills are not installed in this repo; if unavailable, execute the tasks inline, in order, with the verification steps given and the two-stage review the skills describe (spec compliance, then code quality).

**Goal:** Replace the dot-globe homepage hero with a scroll-scrubbed cinematic dive from a stylized network map into a living Ludhiana ICD yard (R3F + drei), and evolve the stamp cursor into an inspector system (scanner highlight, waybill tag, contextual stamps).

**Architecture:** Phase-based. A client-only `HeroStageMount` wraps the SSR copy: it probes WebGL, lazily imports the R3F canvas chunk (`next/dynamic`, `ssr: false`), and drives one progress value 0→1 (auto-dive → scroll scrub → settled) that a keyframed camera rig and a network→yard fade consume. The yard is procedural-first (instanced seeded stacks, gantry crane, gate) with one CC0 Kenney truck GLB. The cursor stays a DOM layer, fed by `data-*` attributes and a tiny external store that the 3D scene also writes to via raycast.

**Tech Stack:** Next 16.2.9 (static export) · React 19.2.4 · TypeScript strict · Tailwind v4 · three 0.186.1 · @react-three/fiber 9.8.1 · @react-three/drei 10.7.9 · maath 0.10.8 · Node 22.23 built-in test runner (`--experimental-strip-types`) · Python Playwright 1.62.

**Spec:** `docs/superpowers/specs/2026-10-05-living-yard-hero-design.md` — read it first; it is the source of truth for intent. Where this plan refines the spec, the deltas are listed in §11.

---

## 0 · Read me first (agent ground rules)

- **Branch:** work only on `redesign/immersive-2026`. **Never merge to `main`.** Commit per task (`feat(hero): …`, `test: …`, `docs: …`); push after each milestone so the Vercel preview updates.
- **Project rules:** `~/projects2/AGENTS.md`, `~/projects2/shivaay/AGENTS.md`, `next-app/AGENTS.md`. Hard constraints: static export, light mode only, 100% of existing content preserved, `lib/data.ts` read-only, reduced-motion + no-WebGL fallbacks with 0 console errors, three/R3F lazy and home-only.
- **Dev server:** already running at `http://localhost:5182` (`cd next-app && npm run dev`). Never kill ports 9222 / 46537.
- **Verification commands** (all verified working on this machine):
  - Unit: `cd next-app && node --experimental-strip-types --test tests/<name>.test.ts`
  - Build + lint: `cd next-app && npm run build && npm run lint`
  - Browser: `python3 scripts/verify_hero.py --base-url http://localhost:5182` (created in Task 19; before that, ad-hoc scripts in `/tmp/opencode/`). If no dev server is running: `python3 .agents/skills/webapp-testing/scripts/with_server.py --server "cd next-app && npm run dev" --port 5182 -- python3 scripts/verify_hero.py`
  - Screenshots: save under `screenshots/hero/` (gitignored). **Read them directly** — the main model has native vision. Use element/`clip` screenshots for 3D regions; full-page stitches lie about WebGL.
- **Never judge 3D from a single screenshot:** check geometry assertions (canvas size, phase state, progress values) *and* the image.
- **Node unit tests:** test files live in `next-app/tests/` (excluded from the Next/TS build). They import source with explicit `.ts` extensions (Node type-stripping requires it), so `tsconfig.json` gets `allowImportingTsExtensions` + `exclude: ["node_modules", "tests"]`.

## 1 · File map

| Action | File | Responsibility |
|---|---|---|
| Create | `next-app/src/lib/palette.ts` | Container color cycle shared by services wall + yard |
| Create | `next-app/src/lib/yard.ts` | Seeded yard layout, truck paths, crane constants |
| Create | `next-app/src/lib/hero-poses.ts` | Camera keyframes + easing helpers |
| Create | `next-app/src/lib/cursor-store.ts` | External store: DOM waybill / 3D waybill / scan rect |
| Create | `next-app/src/lib/hero-bridge.ts` | Scene→test bridge for agent screen positions |
| Create | `next-app/src/components/hero/HeroStageMount.tsx` | Client wrapper: probe, tier, lazy stage, fallback, copy slot |
| Create | `next-app/src/components/hero/useHeroProgress.ts` | Auto-dive / scrub / skip / revisit driver + `window.__slHero` |
| Create | `next-app/src/components/hero/scene/HeroStage.tsx` | `<Canvas>`, lights, fog, quality tier, context-loss guard |
| Create | `next-app/src/components/hero/scene/CameraRig.tsx` | Keyframed dive + pointer parallax |
| Create | `next-app/src/components/hero/scene/NetworkLayer.tsx` | Map paper, city beacons, route arcs, cloud sprites |
| Create | `next-app/src/components/hero/scene/Yard.tsx` | Apron, instanced stacks, crane frame, gate, props |
| Create | `next-app/src/components/hero/scene/Agents.tsx` | Crane cycle, reach stacker, gate barrier, raycast hovers |
| Create | `next-app/src/components/hero/scene/Trucks.tsx` | Kenney GLB trucks on paths, tint, GLB error fallback |
| Create | `next-app/src/components/hero/scene/StackLabels.tsx` | Floating mono waybill labels (drei `<Html>`) |
| Create | `next-app/src/components/hero/fallback/YardFallback.tsx` | Static SVG yard (no-WebGL / context lost) |
| Create | `next-app/tests/{palette,yard,cursor-store}.test.ts` | Node unit tests |
| Create | `next-app/public/models/{truck.glb,box.glb,cone.glb,LICENSE-kenney-car-kit.txt}` | CC0 assets |
| Create | `scripts/verify_hero.py` | Durable Playwright verification |
| Modify | `next-app/package.json` | deps |
| Modify | `next-app/tsconfig.json` | test exclusion + ts-extension imports |
| Modify | `next-app/src/app/layout.tsx` | `overflow-x-clip` (sticky-safe) |
| Modify | `next-app/src/components/home/HeroSection.tsx` | New shell + copy slot (content intact) |
| Modify | `next-app/src/components/motion/Preloader.tsx` | `sl:preloader-done` event |
| Modify | `next-app/src/components/motion/Cursor.tsx` | Scanner + waybill + stamp variants |
| Modify | `next-app/src/components/services/ServiceGrid.tsx` | Import shared palette |
| Modify | `next-app/src/components/contact/ContactForm.tsx`, `services/GalleryLightbox.tsx`, `layout/Navbar.tsx`, `home/ServiceTags.tsx` | `data-scan` / `data-waybill` / `data-stamp` attributes |
| Modify | `next-app/src/app/globals.css` | Hero + cursor styles, reduced-motion rules |
| Modify | `docs/resources-source-manifest.md`, `docs/progress.md`, `tasks/lessons.md` | Provenance + status |
| Delete (T20) | `next-app/src/components/motion/GlobeHero.tsx`, `.globe-*` CSS | Retired |

## 2 · Milestones

| # | Milestone | Tasks | Done when |
|---|---|---|---|
| M1 | Foundations (no visual change) | 1–3 | deps installed; palette extracted; yard module + tests green; build/lint green |
| M2 | Stage + fallback | 4–6 | hero renders a static yard frame with the SVG fallback contract; camera rig wired |
| M3 | Choreography | 7–9 | dive/scrub/skip/revisit work; network map dives into the yard |
| M4 | Life | 10–12 | crane cycles, trucks roll (CC0 GLB), labels float |
| M5 | Cursor system | 13–16 | waybill + scanner + stamps work on DOM and over the 3D yard |
| M6 | Hardening + ship | 17–20 | fallbacks proven, budgets measured, verify script green, GlobeHero deleted, docs updated |

---

## M1 · Foundations

### Task 1: Install R3F stack

**Files:**
- Modify: `next-app/package.json`, `next-app/package-lock.json`

- [ ] **Step 1: Install pinned deps**

```bash
cd /home/garvit/projects2/shivaay/next-app
npm install @react-three/fiber@^9.8.1 @react-three/drei@^10.7.9 maath@^0.10.8
```

- [ ] **Step 2: Verify peer resolution + build unchanged**

```bash
npm ls @react-three/fiber @react-three/drei maath three react
npm run build && npm run lint
```

Expected: fiber 9.8.x (peer `react >=19 <19.4` satisfied by 19.2.4), drei 10.7.x, maath 0.10.x; build still 11/11 static routes; lint clean. The bundle numbers must not change yet (nothing imports the new deps).

- [ ] **Step 3: Commit**

```bash
git add next-app/package.json next-app/package-lock.json
git commit -m "feat(hero): install react-three-fiber, drei, maath for living-yard hero"
```

### Task 2: Shared container palette (TDD)

**Files:**
- Create: `next-app/src/lib/palette.ts`
- Create: `next-app/tests/palette.test.ts`
- Modify: `next-app/src/components/services/ServiceGrid.tsx` (lines 54–60)
- Modify: `next-app/tsconfig.json`

- [ ] **Step 1: Write the failing test**

`next-app/tests/palette.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { containerColor, TEAL_CYCLE, ACCENT_ORANGE } from "../src/lib/palette.ts";

test("cycles teals and stripes orange every 5th", () => {
  assert.equal(containerColor(0), TEAL_CYCLE[0]);
  assert.equal(containerColor(1), TEAL_CYCLE[1]);
  assert.equal(containerColor(2), TEAL_CYCLE[2]);
  assert.equal(containerColor(3), TEAL_CYCLE[0]);
  assert.equal(containerColor(4), ACCENT_ORANGE);
  assert.equal(containerColor(9), ACCENT_ORANGE);
  assert.equal(containerColor(10), TEAL_CYCLE[1]);
  assert.equal(containerColor(14), ACCENT_ORANGE);
});

test("never returns undefined for large indexes", () => {
  for (let i = 0; i < 500; i++) {
    assert.match(containerColor(i), /^#[0-9A-F]{6}$/i);
  }
});
```

- [ ] **Step 2: Run it — must fail**

Run: `cd next-app && node --experimental-strip-types --test tests/palette.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/palette.ts'`.

- [ ] **Step 3: Write `palette.ts`**

```ts
/** Container-wall palette — shared by the services wall and the hero yard. */
export const TEAL_CYCLE = ["#0F766E", "#134E4A", "#0D9488"] as const;
export const ACCENT_ORANGE = "#EA580C";

/** Corrugated panel palette: teals cycle, every 5th container is orange. */
export function containerColor(index: number): string {
  if ((index + 1) % 5 === 0) return ACCENT_ORANGE;
  return TEAL_CYCLE[index % TEAL_CYCLE.length];
}
```

- [ ] **Step 4: Point ServiceGrid at the shared module**

In `next-app/src/components/services/ServiceGrid.tsx`: delete the local `TEAL_CYCLE` / `ACCENT_ORANGE` / color function block (lines ~54–60, the block starting `const TEAL_CYCLE = [...]`), add `import { containerColor } from "@/lib/palette";`, and rename every call site of the local helper to `containerColor(` (the local helper is named `panelColor` — verify with `grep -n "panelColor\|TEAL_CYCLE\|ACCENT_ORANGE" src/components/services/ServiceGrid.tsx`; after the edit only the import remains).

- [ ] **Step 5: Update tsconfig for node tests**

In `next-app/tsconfig.json` add to `compilerOptions`: `"allowImportingTsExtensions": true` (valid because `noEmit: true` is already set), and change `"exclude"` to `["node_modules", "tests"]`.

- [ ] **Step 6: Run the test — must pass; build + lint**

```bash
cd next-app && node --experimental-strip-types --test tests/palette.test.ts && npm run build && npm run lint
```

Expected: 2 tests pass; services wall unchanged visually (same colors); build/lint green.

- [ ] **Step 7: Commit**

```bash
git add next-app/src/lib/palette.ts next-app/tests/palette.test.ts next-app/src/components/services/ServiceGrid.tsx next-app/tsconfig.json
git commit -m "refactor: extract container palette shared by services wall and hero yard"
```

### Task 3: Yard layout module (TDD)

**Files:**
- Create: `next-app/src/lib/yard.ts`
- Create: `next-app/tests/yard.test.ts`

- [ ] **Step 1: Write the failing test**

`next-app/tests/yard.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createYard, CONTAINER, YARD, TRUCK_PATHS, CRANE,
} from "../src/lib/yard.ts";
import { TEAL_CYCLE, ACCENT_ORANGE } from "../src/lib/palette.ts";

const PALETTE = new Set<string>([...TEAL_CYCLE, ACCENT_ORANGE]);

test("is deterministic for a given seed", () => {
  assert.deepEqual(createYard(116), createYard(116));
  assert.notDeepEqual(createYard(116), createYard(117));
});

test("respects bounds, tiers, palette and unique ids", () => {
  const { boxes } = createYard(116);
  const ids = new Set<string>();
  for (const b of boxes) {
    assert.ok(Math.abs(b.x) <= YARD.w / 2, `x out of bounds: ${b.x}`);
    assert.ok(Math.abs(b.z) <= YARD.d / 2, `z out of bounds: ${b.z}`);
    assert.ok(b.tier >= 0 && b.tier <= 3, `tier out of range: ${b.tier}`);
    assert.ok(PALETTE.has(b.color), `bad color: ${b.color}`);
    assert.ok(!ids.has(b.id), `duplicate id: ${b.id}`);
    ids.add(b.id);
  }
});

test("lite density is lighter than full", () => {
  assert.ok(createYard(116, "lite").boxes.length < createYard(116, "full").boxes.length);
});

test("labels reference real stack positions", () => {
  const { boxes, labels } = createYard(116);
  assert.ok(labels.length >= 6 && labels.length <= 8);
  for (const l of labels) {
    assert.ok(boxes.some((b) => b.x === l.x && b.z === l.z));
  }
});

test("static scene constants are sane", () => {
  assert.ok(CONTAINER.w > CONTAINER.d);
  assert.ok(TRUCK_PATHS.length >= 2 && TRUCK_PATHS[0].points.length >= 4);
  assert.ok(CRANE.cycle > 8);
  assert.ok(CRANE.pickZ !== CRANE.placeZ);
});
```

- [ ] **Step 2: Run it — must fail**

Run: `cd next-app && node --experimental-strip-types --test tests/yard.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write `yard.ts`**

```ts
import { containerColor } from "./palette.ts";

export interface YardBox {
  id: string;
  x: number;
  z: number;
  /** 0-based stacking tier. */
  tier: number;
  color: string;
}

export interface YardLabel {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
}

export interface YardPlan {
  boxes: YardBox[];
  labels: YardLabel[];
}

/** ISO container footprint + stacking gap, in scene units (≈ metres). */
export const CONTAINER = { w: 6.06, h: 2.44, d: 2.44 } as const;
export const YARD = { w: 220, d: 150 } as const;

/** Deterministic PRNG (mulberry32), same pattern used across the codebase. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Yard lanes (z rows). Every 4th row left empty as a service lane. */
const Z_ROWS = [-48, -36, -24, -12, 0, 12, 24, 36];

export function createYard(
  seed = 116,
  density: "full" | "lite" = "full"
): YardPlan {
  const rand = mulberry32(seed);
  const cols = density === "full" ? 16 : 9;
  const boxes: YardBox[] = [];
  let n = 0;

  Z_ROWS.forEach((z, row) => {
    if (row % 4 === 3) return; // service lane — trucks drive here
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.16) continue; // breathing gaps
      const x = -76 + c * (CONTAINER.w + 2.2) + rand() * 0.6 - 0.3;
      const tierCount = 1 + Math.floor(rand() * (c % 7 === 0 ? 2 : 4));
      for (let tier = 0; tier < tierCount; tier++) {
        n += 1;
        boxes.push({
          id: `SHV-${String(n).padStart(3, "0")}`,
          x,
          z,
          tier,
          color: containerColor(n),
        });
      }
    }
  });

  const labels: YardLabel[] = [];
  for (let i = 0; i < boxes.length && labels.length < 8; i += Math.ceil(boxes.length / 8)) {
    const b = boxes[i];
    if (labels.some((l) => l.x === b.x && l.z === b.z)) continue;
    labels.push({
      id: b.id,
      x: b.x,
      y: (b.tier + 1) * (CONTAINER.h + 0.12) + 2.6,
      z: b.z,
      text: `${b.id} · ${b.tier + 1} HIGH`,
    });
  }
  // Guarantee the lower bound the test asserts, even for sparse seeds.
  for (const b of boxes) {
    if (labels.length >= 6) break;
    if (labels.some((l) => l.x === b.x && l.z === b.z)) continue;
    labels.push({
      id: b.id,
      x: b.x,
      y: (b.tier + 1) * (CONTAINER.h + 0.12) + 2.6,
      z: b.z,
      text: `${b.id} · ${b.tier + 1} HIGH`,
    });
  }

  return { boxes, labels };
}

/** Truck routes across the apron: [[x, y, z], …], looped. */
export const TRUCK_PATHS: { points: [number, number, number][]; speed: number; offset: number }[] = [
  {
    points: [
      [-150, 0, -46], [-70, 0, -46], [-24, 0, -40], [4, 0, -18], [10, 0, 26], [60, 0, 44], [150, 0, 46],
    ],
    speed: 0.014,
    offset: 0,
  },
  {
    points: [
      [150, 0, 32], [66, 0, 30], [18, 0, 12], [-8, 0, -14], [-60, 0, -30], [-150, 0, -32],
    ],
    speed: 0.011,
    offset: 0.45,
  },
];

/** Gantry crane cycle constants. */
export const CRANE = {
  cycle: 16,
  railZ: 46,
  pickX: -34,
  pickZ: -24,
  placeX: -34,
  placeZ: 24,
  beamY: 16,
  hoistHigh: 13,
  hoistLow: 1.6,
} as const;

export const GATE = { x: 0, z: -70, width: 26 } as const;
```

- [ ] **Step 4: Run tests — must pass**

Run: `cd next-app && node --experimental-strip-types --test tests/yard.test.ts`
Expected: 5 tests pass. If the label loop yields fewer than 6 labels, adjust the stride constant (do not weaken the test).

- [ ] **Step 5: Build + lint**

```bash
cd next-app && npm run build && npm run lint
```

Expected: green (module is not imported by the app yet).

- [ ] **Step 6: Commit**

```bash
git add next-app/src/lib/yard.ts next-app/tests/yard.test.ts
git commit -m "feat(hero): deterministic yard layout, truck paths, crane constants"
```

**Milestone M1 push:** `git push origin redesign/immersive-2026` (preview updates).

---

## M2 · Stage + fallback

### Task 4: Static SVG fallback

**Files:**
- Create: `next-app/src/components/hero/fallback/YardFallback.tsx`

- [ ] **Step 1: Write the component**

```tsx
/**
 * Static no-WebGL / context-lost fallback: a blueprint drawing of the yard.
 * Pure SVG — no animation, no deps. Always readable, always cheap.
 */
export function YardFallback({ className = "" }: { className?: string }) {
  const stacks = [
    { x: 420, h: 3 }, { x: 470, h: 4 }, { x: 520, h: 2 },
    { x: 660, h: 3 }, { x: 710, h: 2 }, { x: 760, h: 4 },
    { x: 540, h: 3 }, { x: 590, h: 1 },
  ];
  return (
    <div className={`yard-fallback ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <pattern id="yf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#0F766E" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="#FAF8F4" />
        <rect width="1200" height="800" fill="url(#yf-grid)" />

        {/* gantry crane */}
        <g stroke="#0F766E" strokeWidth="7" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M330 560V240M330 240h540M870 240v320" />
          <path d="M330 560l-74 96M330 560l74 96M870 560l-74 96M870 560l74 96" />
        </g>
        <rect x="556" y="238" width="72" height="34" fill="#0F766E" opacity="0.65" />
        <rect x="586" y="272" width="12" height="86" fill="#0F766E" opacity="0.65" />

        {/* container stacks */}
        <g>
          {stacks.map((s, i) => {
            const w = 46;
            const h = 16;
            return Array.from({ length: s.h }, (_, t) => (
              <rect
                key={`${i}-${t}`}
                x={s.x}
                y={700 - t * (h + 4)}
                width={w}
                height={h}
                rx="2"
                fill={i === 5 ? "#EA580C" : ["#0F766E", "#134E4A", "#0D9488"][i % 3]}
                opacity={0.55 + t * 0.1}
              />
            ));
          })}
        </g>

        {/* truck silhouette on the lane */}
        <g fill="#1E1B18" opacity="0.55">
          <rect x="180" y="668" width="86" height="26" rx="4" />
          <rect x="258" y="676" width="34" height="18" rx="3" />
          <circle cx="206" cy="698" r="9" />
          <circle cx="272" cy="698" r="9" />
        </g>

        {/* dashed outbound route */}
        <path
          d="M100 660 Q 300 620 470 500 T 1080 420"
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeDasharray="10 12"
          opacity="0.5"
        />

        <text x="84" y="112" fontFamily="var(--font-mono), monospace" fontSize="22" letterSpacing="6" fill="#6B5E4A">
          LUDHIANA ICD · LIVE MODEL
        </text>
        <text x="84" y="146" fontFamily="var(--font-mono), monospace" fontSize="14" letterSpacing="4" fill="#0F766E">
          LDH / IN · CUSTOMS BROKER · EST. 2009
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Build + lint**

```bash
cd next-app && npm run build && npm run lint
```

Expected: green (component not mounted yet).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/hero/fallback/YardFallback.tsx
git commit -m "feat(hero): static SVG yard fallback for no-WebGL and context loss"
```

### Task 5: Canvas skeleton + mount swap

**Files:**
- Create: `next-app/src/components/hero/scene/HeroStage.tsx`
- Create: `next-app/src/components/hero/HeroStageMount.tsx`
- Modify: `next-app/src/components/home/HeroSection.tsx` (full structural rewrite, copy preserved)
- Modify: `next-app/src/app/layout.tsx` (body class)
- Modify: `next-app/src/app/globals.css` (hero styles)

- [ ] **Step 1: Write the scene skeleton**

`next-app/src/components/hero/scene/HeroStage.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { CONTAINER, YARD, createYard } from "@/lib/yard";

export type QualityTier = "full" | "lite";

function StackField({ tier }: { tier: QualityTier }) {
  const { boxes } = useMemo(() => createYard(116, tier === "lite" ? "lite" : "full"), [tier]);

  const ribTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "rgba(30,27,24,0.14)";
      for (let x = 0; x < 64; x += 8) ctx.fillRect(x, 0, 2, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    return tex;
  }, []);

  return (
    <Instances limit={boxes.length} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[CONTAINER.w, CONTAINER.h, CONTAINER.d]} />
      <meshStandardMaterial map={ribTexture} roughness={0.82} metalness={0.04} />
      {boxes.map((b) => (
        <Instance
          key={b.id}
          position={[b.x, (b.tier + 0.5) * (CONTAINER.h + 0.12), b.z]}
          color={b.color}
        />
      ))}
    </Instances>
  );
}

export interface HeroStageProps {
  tier: QualityTier;
  active: boolean;
  onContextLost: () => void;
}

export function HeroStage({ tier, active, onContextLost }: HeroStageProps) {
  return (
    <Canvas
      aria-hidden
      frameloop={active ? "always" : "never"}
      dpr={[1, tier === "lite" ? 1.5 : 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [10, 7.5, 22], fov: 42, near: 0.5, far: 4000 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <hemisphereLight args={[0xfff6e8, 0xd9d2c4, 1.15]} />
      <directionalLight position={[42, 70, 24]} intensity={1.5} color={0xfff1dc} />
      <fog attach="fog" args={["#FAF8F4", 140, 900]} />

      {/* map paper */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.3, 0]}>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial color="#F3EFE7" roughness={1} />
      </mesh>
      {/* yard apron */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[YARD.w, YARD.d]} />
        <meshStandardMaterial color="#E9E5DC" roughness={1} />
      </mesh>

      <StackField tier={tier} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Write the mount wrapper**

`next-app/src/components/hero/HeroStageMount.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { YardFallback } from "./fallback/YardFallback";

const HeroStage = dynamic(
  () => import("./scene/HeroStage").then((m) => m.HeroStage),
  { ssr: false }
);

function probeWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Client boundary for the hero. Renders the sticky track, the lazy 3D stage,
 * the SVG fallback contract, and hosts the server-rendered copy as children.
 */
export function HeroStageMount({ children }: { children: React.ReactNode }) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [tier, setTier] = useState<"full" | "lite">("full");
  const [contextLost, setContextLost] = useState(false);
  const [active, setActive] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(probeWebGL());
    setTier(window.matchMedia("(max-width: 1023px)").matches ? "lite" : "full");
  }, []);

  // Pause the render loop when the hero is offscreen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-track" ref={trackRef} data-phase="dive">
      <div className="hero-sticky">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="hero-canvas-wrap" aria-hidden="true">
          {webgl === true && !contextLost && (
            <HeroStage tier={tier} active={active} onContextLost={() => setContextLost(true)} />
          )}
          {webgl !== true || contextLost ? <YardFallback /> : null}
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-r from-cream via-cream/75 to-transparent lg:via-cream/30"
          aria-hidden="true"
        />
        <div className="hero-copy relative z-10">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rebuild `HeroSection.tsx` around the mount (copy unchanged)**

The server component keeps every string, class and element of the current copy (headline `SplitReveal`, paragraph, CTAs, CHA chip, stats, scroll cue) — only the shell changes. New structure:

```tsx
import { HeroStageMount } from "@/components/hero/HeroStageMount";
// …other imports stay (remove the GlobeHero import)

export function HeroSection() {
  return (
    <section className="relative bg-cream" aria-labelledby="hero-heading">
      <HeroStageMount>
        <div className="mx-auto max-w-[1280px] px-6 min-h-[94vh] flex items-center pt-24 pb-20">
          <div className="max-w-2xl">
            {/* ▼ EXACT current copy: mono label + ticker dot, h1 + SplitReveal,
                paragraph, Magnetic CTAs (Get a Quote keeps data-stamp), CHA chip,
                stats with Odometer — moved verbatim from the old file ▼ */}
          </div>
        </div>
        {/* scroll cue — moved inside so it can hide during the dive */}
        <div className="hero-scroll-cue absolute bottom-7 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2.5" aria-hidden="true">
          <span className="mono-label text-[9px] text-ink-dim">Scroll</span>
          <span className="scroll-cue block w-px h-10 bg-ink/15" />
        </div>
      </HeroStageMount>
    </section>
  );
}
```

Important: the old `overflow-hidden` on `<section>` must be gone (it would kill `position: sticky`). The canvas is clipped by `.hero-sticky { overflow: hidden }` instead. The old standalone `bg-blueprint` div, canvas wrapper, gradient scrim and "Drag to spin" label are replaced by the mount's internals ("Drag to spin" is deleted — the new hero has hover interaction, not drag).

- [ ] **Step 4: Make body sticky-safe**

In `next-app/src/app/layout.tsx` line 77, change `overflow-x-hidden` to `overflow-x-clip` (clip does not create a scroll container; `hidden` can break `position: sticky` descendants).

- [ ] **Step 5: Add hero CSS**

Append to `next-app/src/app/globals.css` (after the Globe hero block):

```css
/* ---- Living-yard hero ---- */
.hero-track { position: relative; }
.hero-sticky { position: relative; height: 100svh; overflow: hidden; }
.hero-canvas-wrap { position: absolute; inset: 0; opacity: 0.7; }
@media (min-width: 1024px) {
  .hero-track { height: 220vh; }
  .hero-sticky { position: sticky; top: 0; }
  .hero-canvas-wrap { opacity: 1; }
}
.hero-copy { transition: opacity 0.7s ease, transform 0.7s ease; }
html.js .hero-track[data-phase="dive"] .hero-copy,
html.js .hero-track[data-phase="scrub"] .hero-copy { opacity: 0; transform: translateY(14px); pointer-events: none; }
html.js .hero-track[data-phase="dive"] .hero-scroll-cue,
html.js .hero-track[data-phase="scrub"] .hero-scroll-cue { opacity: 0; }
.yard-fallback { position: absolute; inset: 0; }
.hero-stack-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(30, 27, 24, 0.65);
  background: rgba(250, 248, 244, 0.85); border: 1px solid var(--color-border);
  border-radius: 3px; padding: 2px 6px; white-space: nowrap; pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .hero-track { height: 100svh !important; }
  .hero-sticky { position: relative !important; }
  html.js .hero-track[data-phase="dive"] .hero-copy,
  html.js .hero-track[data-phase="scrub"] .hero-copy {
    opacity: 1; transform: none; pointer-events: auto;
  }
  html.js .hero-track[data-phase="dive"] .hero-scroll-cue,
  html.js .hero-track[data-phase="scrub"] .hero-scroll-cue { opacity: 1; }
}
```

- [ ] **Step 6: Verify (build, lint, browser smoke, vision)**

```bash
cd next-app && npm run build && npm run lint
curl -s http://localhost:5182/ | grep -c "Customs brokerage with integrity"
```

Expected: build/lint green; SSR HTML contains the headline text (crawler-safe). Then run this ad-hoc Playwright check (save as `/tmp/opencode/hero-smoke.py`):

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto("http://localhost:5182/", wait_until="networkidle")
    pg.wait_for_timeout(4500)
    box = pg.locator(".hero-canvas-wrap canvas").first.bounding_box()
    print("canvas:", box)
    print("console errors:", errors)
    pg.screenshot(path="/tmp/opencode/hero-t5.png", clip={"x": 0, "y": 0, "width": 1440, "height": 900})
    b.close()
```

Expected: canvas box ≈ 1440×900; zero console errors; screenshot shows a composed cream scene with teal/orange container stacks on the right and legible copy on the left. **Read `/tmp/opencode/hero-t5.png` with the read tool** and judge it like a designer: stacks spread plausibly, no z-fighting, text legible. Iterate on `createYard` constants/colors only if it reads badly.

- [ ] **Step 7: Commit**

```bash
git add next-app/src/components/hero next-app/src/components/home/HeroSection.tsx next-app/src/app/layout.tsx next-app/src/app/globals.css
git commit -m "feat(hero): mount lazy R3F stage with SVG fallback, replace dot-globe render"
```

### Task 6: Camera rig (settled pose first)

**Files:**
- Create: `next-app/src/lib/hero-poses.ts`
- Create: `next-app/src/components/hero/scene/CameraRig.tsx`
- Modify: `next-app/src/components/hero/scene/HeroStage.tsx`

- [ ] **Step 1: Write `hero-poses.ts`**

```ts
import * as THREE from "three";

export interface Pose {
  pos: [number, number, number];
  target: [number, number, number];
}

/** Author-time-independent keyframes: progress 0 → 1 dives map → yard. */
export const POSES: Pose[] = [
  { pos: [0, 420, 260], target: [0, 0, 0] },     // high over the network map
  { pos: [4, 210, 150], target: [+6, 0, 14] },   // descending, beacons visible
  { pos: [16, 64, 84], target: [0, 2, 4] },      // yard approach
  { pos: [10, 7.5, 22], target: [0, 2.5, -2] },  // settled, eye-level
];

export const CAMERA_SPAN = { near: 0.5, far: 4000 } as const;

export function makeCurves() {
  return {
    pos: new THREE.CatmullRomCurve3(POSES.map((p) => new THREE.Vector3(...p.pos))),
    target: new THREE.CatmullRomCurve3(POSES.map((p) => new THREE.Vector3(...p.target))),
  };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
```

- [ ] **Step 2: Write `CameraRig.tsx`**

```tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeCurves, smoothstep } from "@/lib/hero-poses";

/**
 * Consumes the shared progress ref (0 = map, 1 = settled yard) and drives the
 * camera along authored keyframes. Pointer parallax only once settled.
 */
export function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const curves = useMemo(makeCurves, []);
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const p = progress.current ?? 1;
    curves.pos.getPoint(p, desired.current);
    curves.target.getPoint(p, target.current);

    // Damped pointer parallax, weighted to the settled pose.
    const w = smoothstep(0.85, 1, p);
    desired.current.x += pointer.x * 2.6 * w;
    desired.current.y += -pointer.y * 1.3 * w;

    const k = 1 - Math.exp(-6 * delta);
    camera.position.lerp(desired.current, k);
    camera.lookAt(look.current.copy(target.current));
  });

  return null;
}
```

- [ ] **Step 3: Wire into `HeroStage`**

In `HeroStage.tsx`: add `progress: React.RefObject<number>` to `HeroStageProps`, import `CameraRig`, and render `<CameraRig progress={progress} />` before `<StackField />`. In `HeroStageMount.tsx`, add `const progressRef = useRef(1);` and pass it (`progress={progressRef}`) — Task 7 replaces the constant with the live driver but the interface stays identical.

- [ ] **Step 4: Verify**

Build + lint, then re-run the smoke script and read the screenshot. The settled composition should now be deliberate (camera at `[10, 7.5, 22]` looking slightly left-down at the stacks) — copy left, yard right. No console errors.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/hero-poses.ts next-app/src/components/hero
git commit -m "feat(hero): keyframed camera rig with damped pointer parallax"
```

**Milestone M2 push.**

---

## M3 · Choreography

### Task 7: Progress driver (auto-dive, scrub, skip, revisit, test hook)

**Files:**
- Create: `next-app/src/components/hero/useHeroProgress.ts`
- Modify: `next-app/src/components/hero/HeroStageMount.tsx`
- Modify: `next-app/src/app/globals.css` (skip button)

- [ ] **Step 1: Write the hook**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp01, easeInOutCubic } from "@/lib/hero-poses";

export type HeroPhase = "dive" | "scrub" | "settled";

interface Options {
  trackRef: React.RefObject<HTMLDivElement | null>;
  desktop: boolean;
  reduced: boolean;
}

export interface SlHeroHook {
  getState: () => { phase: HeroPhase; progress: number; desktop: boolean; reduced: boolean };
  setProgress: (p: number, instant?: boolean) => void;
  skip: () => void;
  getAgentScreenPosition: (id: string) => { x: number; y: number } | null;
}

/**
 * One progress value, three drivers: auto-dive (time), scroll scrub (desktop,
 * forward-only), skip. Revisits start at 0.72 and settle in ~1 s. Reduced
 * motion jumps straight to the settled pose.
 */
export function useHeroProgress({ trackRef, desktop, reduced }: Options) {
  const progress = useRef(reduced ? 1 : 0);
  const target = useRef(progress.current);
  const phaseRef = useRef<HeroPhase>("dive");
  const [phase, setPhase] = useState<HeroPhase>("dive");
  const modeRef = useRef<"auto" | "user" | "done">("auto");
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const startedRef = useRef(false);
  const startedAtRef = useRef(0);
  const diveMsRef = useRef(3000);
  const baseRef = useRef(0);

  const setPhaseSafe = useCallback((p: HeroPhase) => {
    if (phaseRef.current !== p) {
      phaseRef.current = p;
      setPhase(p);
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (reduced) {
      progress.current = 1;
      target.current = 1;
      setPhaseSafe("settled");
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem("sl-seen") === "1";
    } catch {
      seen = false;
    }
    const quick = seen || document.documentElement.classList.contains("preloaded");
    baseRef.current = quick ? 0.72 : 0;
    diveMsRef.current = quick ? 1000 : 3000;
    progress.current = baseRef.current;
    target.current = baseRef.current;

    let started = false;
    let preloaderTimer = 0;

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      if (modeRef.current === "auto" && startedRef.current) {
        const t = clamp01((now - startedAtRef.current) / diveMsRef.current);
        target.current = baseRef.current + (1 - baseRef.current) * easeInOutCubic(t);
      }
      progress.current += (target.current - progress.current) * (1 - Math.exp(-6 * dt));

      if (Math.abs(target.current - progress.current) < 0.002 || progress.current >= 0.999) {
        progress.current = target.current >= 1 ? 1 : progress.current;
        if (target.current >= 1) {
          progress.current = 1;
          modeRef.current = "done";
          setPhaseSafe("settled");
          cancelAnimationFrame(rafRef.current);
        }
      }
      track.dataset.progress = progress.current.toFixed(3);
    };

    const ensureLoop = () => {
      cancelAnimationFrame(rafRef.current);
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (started || modeRef.current === "user") return; // never override a scrub/skip
      started = true;
      startedRef.current = true;
      startedAtRef.current = performance.now();
      modeRef.current = "auto";
      setPhaseSafe("dive");
      ensureLoop();
    };

    const onPreloaderDone = () => start();
    if (quick) {
      start();
    } else {
      window.addEventListener("sl:preloader-done", onPreloaderDone, { once: true });
      preloaderTimer = window.setTimeout(start, 3200); // backstop if event never fires
    }

    const onScroll = () => {
      if (!desktop) return;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return;
      const p = clamp01(-rect.top / span);
      if (p <= 0.01) return;
      modeRef.current = "user";
      startedRef.current = false;
      target.current = Math.max(target.current, p);
      setPhaseSafe(target.current >= 1 ? "settled" : "scrub");
      ensureLoop();
    };
    if (desktop) window.addEventListener("scroll", onScroll, { passive: true });

    const skip = () => {
      modeRef.current = "user";
      startedRef.current = false;
      target.current = 1;
      setPhaseSafe("scrub");
      ensureLoop();
    };

    const hook: SlHeroHook = {
      getState: () => ({
        phase: phaseRef.current,
        progress: progress.current,
        desktop,
        reduced,
      }),
      setProgress: (p, instant = false) => {
        const v = clamp01(p);
        modeRef.current = "user";
        startedRef.current = false;
        target.current = v;
        if (instant) progress.current = v;
        setPhaseSafe(v >= 1 && instant ? "settled" : "scrub");
        if (v >= 1 && instant) cancelAnimationFrame(rafRef.current);
        else ensureLoop();
      },
      skip,
      getAgentScreenPosition: () => null,
    };
    (window as unknown as { __slHero?: SlHeroHook }).__slHero = hook;

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(preloaderTimer);
      window.removeEventListener("sl:preloader-done", onPreloaderDone);
      if (desktop) window.removeEventListener("scroll", onScroll);
      delete (window as unknown as { __slHero?: SlHeroHook }).__slHero;
    };
  }, [desktop, reduced, setPhaseSafe, trackRef]);

  return { phase, progress, skip: () => {
    // Stable public skip: flip to settled target via the hook registered in the effect.
    const hook = (window as unknown as { __slHero?: SlHeroHook }).__slHero;
    hook?.skip();
  } };
}
```

- [ ] **Step 2: Wire into the mount (phase attr, skip button, live ref)**

In `HeroStageMount.tsx`, destructure the hook — it owns and returns the progress ref, so no extra ref or bridge is needed: `const { phase, progress, skip } = useHeroProgress({ trackRef, desktop, reduced });` — add the `desktop` / `reduced` state shown below, pass `progress={progress}` to `<HeroStage>`, replace the track's hardcoded `data-phase="dive"` with `data-phase={phase}`, and render the skip control:

```tsx
const [desktop, setDesktop] = useState(true);
const [reduced, setReduced] = useState(false);

useEffect(() => {
  const mqDesktop = window.matchMedia("(min-width: 1024px)");
  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    setDesktop(mqDesktop.matches);
    setReduced(mqReduced.matches);
  };
  sync();
  mqDesktop.addEventListener("change", sync);
  mqReduced.addEventListener("change", sync);
  return () => {
    mqDesktop.removeEventListener("change", sync);
    mqReduced.removeEventListener("change", sync);
  };
}, []);
```

Track markup: remove the hardcoded `data-phase="dive"` — set `data-phase={phase}` on `.hero-track` (the CSS selectors use `.hero-sticky:not(...)`, so also add the attribute to the sticky element: simplest is `data-phase={phase}` on BOTH track (for tests) and sticky (for CSS), or change CSS to `.hero-track:not([data-phase="settled"]) .hero-copy`. Use the track-only version — update the CSS in Step 3 accordingly).

Render the skip control inside the sticky element:

```tsx
{phase !== "settled" && !reduced && (
  <button type="button" className="hero-skip mono-label" onClick={skip}>
    Skip intro
  </button>
)}
```

- [ ] **Step 3: Adjust the CSS selectors + style the skip button**

The T5 CSS already targets `.hero-track[data-phase="dive"]` / `[data-phase="scrub"]`; no selector changes are needed — just confirm the mount sets `data-phase={phase}` on the track (T5 hardcoded `"dive"`; replace it with the state). Add:

```css
.hero-skip {
  position: absolute; right: 1.5rem; bottom: 1.5rem; z-index: 20;
  padding: 8px 14px; border: 1px solid var(--color-border);
  background: rgba(250, 248, 244, 0.9); color: var(--color-ink-dim);
  border-radius: 999px; cursor: pointer;
}
.hero-skip:hover { color: var(--color-ink); border-color: var(--color-ink-dim); }
```

- [ ] **Step 4: Verify with Playwright assertions**

Save as `/tmp/opencode/hero-t7.py` and run:

```python
from playwright.sync_api import sync_playwright

URL = "http://localhost:5182/"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(5200)
    print("settled:", pg.evaluate("window.__slHero.getState()"))
    assert pg.evaluate("window.__slHero.getState().phase") == "settled"
    # scrub: reload, jump mid-track before the dive finishes
    pg.reload(wait_until="domcontentloaded")
    pg.evaluate("window.scrollTo(0, 900)")
    pg.wait_for_timeout(400)
    mid = pg.evaluate("window.__slHero.getState()")
    print("mid-scrub:", mid)
    assert mid["phase"] in ("scrub", "settled") and mid["progress"] > 0.05
    # sticky check: track top negative, sticky top ~0
    sticky_top = pg.evaluate("document.querySelector('.hero-sticky').getBoundingClientRect().top")
    print("sticky top:", sticky_top)
    assert abs(sticky_top) < 2
    # skip: reload, hit skip during dive
    pg.evaluate("window.scrollTo(0, 0)")
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_timeout(600)
    pg.click(".hero-skip")
    pg.wait_for_timeout(1200)
    print("after skip:", pg.evaluate("window.__slHero.getState()"))
    assert pg.evaluate("window.__slHero.getState().phase") == "settled"
    assert pg.locator(".hero-copy").is_visible()
    b.close()
```

Expected: all assertions pass; `mid-scrub` progress > 0.05; skip settles in ~1 s; copy visible after settle. If sticky-top is not ≈ 0, revisit the `overflow-x-clip` change and any `overflow-hidden` ancestors.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/components/hero next-app/src/app/globals.css
git commit -m "feat(hero): auto-dive, scroll scrub, skip control, session revisit + test hook"
```

### Task 8: Preloader handoff

**Files:**
- Modify: `next-app/src/components/motion/Preloader.tsx` (lines 15–39)

- [ ] **Step 1: Dispatch lifecycle events**

In `Preloader.tsx`, inside the effect:

```tsx
if (seen) {
  const t = setTimeout(() => {
    window.dispatchEvent(new Event("sl:preloader-done"));
    setStage("gone");
  }, 0);
  return () => clearTimeout(t);
}
const t1 = setTimeout(() => {
  window.dispatchEvent(new Event("sl:preloader-open"));
  setStage("exit");
}, 1600);
const t2 = setTimeout(() => {
  try {
    sessionStorage.setItem("sl-seen", "1");
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event("sl:preloader-done"));
  setStage("gone");
}, 2750);
```

- [ ] **Step 2: Verify sequencing**

Playwright: fresh context (no sessionStorage), load `/`, assert the dive starts only after the doors begin opening — sample `window.__slHero.getState().progress` at t≈1.2 s (must be 0, still pre-dive), at t≈4.8 s (must be between 0.2 and 0.95, diving — the preloader finishes at 2.75 s and the dive runs 3 s), and at t≈7.5 s (must be 1 / `settled`). Then reload in the same context: progress starts at 0.72 and settles within ~1.5 s (revisit path).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/motion/Preloader.tsx
git commit -m "feat(hero): preloader signals sl:preloader-done for dive handoff"
```

### Task 9: Network layer + cloud band

**Files:**
- Create: `next-app/src/components/hero/scene/NetworkLayer.tsx`
- Modify: `next-app/src/components/hero/scene/HeroStage.tsx`

- [ ] **Step 1: Write `NetworkLayer.tsx`**

Key implementation (full component in the file):

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { cities, routes } from "@/lib/data";
import { smoothstep } from "@/lib/hero-poses";

const SCALE = 7; // scene units per degree — diagrammatic, not to scale

/** City → yard-plane coordinates, origin at Ludhiana. */
function project(city: { lat: number; lng: number }): [number, number] {
  const hub = cities.Ludhiana;
  return [(city.lng - hub.lng) * SCALE, -(city.lat - hub.lat) * SCALE];
}
```

Build: beacon groups (`ring` + vertical `cylinder` + `sprite` label via CanvasTexture — reuse the label technique from the old `GlobeHero` lines 139–168), route `Line` objects per `routes[]` as `QuadraticBezierCurve3` with a mid lifted by `0.18 * dist` (dashed: `LineDashedMaterial` + `computeLineDistances()`), moving packet spheres on each arc, and 6 cloud `Sprite`s at `y ≈ 90–140` with a radial-gradient CanvasTexture. Add a grid-textured map plane (2400², 256² CanvasTexture with 40-unit cells at 7% teal) at `y = -0.25` so the network reads as a diagram. Everything (beacons, arcs, packets, clouds) fades by progress:

```tsx
// collect once, in useMemo:
const mapMats: THREE.Material[] = [];
const cloudMats: THREE.Material[] = [];
// …push every beacon/arc/packet material into mapMats, every cloud material into cloudMats,
// storing each material's base opacity at creation: mat.userData.baseOpacity = mat.opacity

// per frame, in useFrame:
const p = progress.current ?? 1;
const mapOpacity = 1 - smoothstep(0.35, 0.62, p);
const cloudOpacity = smoothstep(0.28, 0.45, p) * (1 - smoothstep(0.55, 0.75, p));
for (const m of mapMats) m.opacity = (m.userData.baseOpacity ?? 1) * mapOpacity;
for (const m of cloudMats) m.opacity = (m.userData.baseOpacity ?? 1) * cloudOpacity;
```

- [ ] **Step 2: Mount it in `HeroStage`**

Add `progress` prop to `NetworkLayer` (same ref), render it before `<StackField />`. Fog already handles depth; do not add a second background.

- [ ] **Step 3: Verify at three progress values**

```python
pg.goto(URL, wait_until="networkidle")
pg.wait_for_timeout(800)
pg.evaluate("window.__slHero.setProgress(0, true)")
pg.wait_for_timeout(600)
pg.screenshot(path="/tmp/opencode/hero-p0.png", clip={"x":0,"y":0,"width":1440,"height":900})
pg.evaluate("window.__slHero.setProgress(0.5, true)")
pg.wait_for_timeout(600)
pg.screenshot(path="/tmp/opencode/hero-p50.png", clip={"x":0,"y":0,"width":1440,"height":900})
pg.evaluate("window.__slHero.setProgress(1, true)")
pg.wait_for_timeout(900)
pg.screenshot(path="/tmp/opencode/hero-p100.png", clip={"x":0,"y":0,"width":1440,"height":900})
```

Read all three images. p0: map paper with 5 beacons + dashed routes + labels, no stray geometry. p50: mid-descent, clouds visible, map fading. p100: clean yard, no map residue. Also assert zero console errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/components/hero
git commit -m "feat(hero): network map layer with beacons, routes and cloud band"
```

**Milestone M3 push.**

---

## M4 · Life

### Task 10: Gantry crane cycle

**Files:**
- Create: `next-app/src/components/hero/scene/Agents.tsx`
- Modify: `next-app/src/components/hero/scene/HeroStage.tsx`

- [ ] **Step 1: Write `Agents.tsx` with the crane cycle**

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CONTAINER, CRANE } from "@/lib/yard";
import { containerColor } from "@/lib/palette";

/** Crane timeline keys: t seconds → trolley (0 pick…1 place), hoist (1 high…0 low), carrying. */
const KEYS = [
  { t: 0, trolley: 0, hoist: 1, carry: false },
  { t: 2, trolley: 0, hoist: 0, carry: false },
  { t: 3, trolley: 0, hoist: 0, carry: true },
  { t: 5, trolley: 0, hoist: 1, carry: true },
  { t: 7.5, trolley: 1, hoist: 1, carry: true },
  { t: 9.5, trolley: 1, hoist: 0, carry: true },
  { t: 10.5, trolley: 1, hoist: 0, carry: false },
  { t: 12.5, trolley: 1, hoist: 1, carry: false },
  { t: 16, trolley: 0, hoist: 1, carry: false },
];

function sample(keys: typeof KEYS, t: number) {
  const time = t % CRANE.cycle;
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (time >= keys[i].t && time <= keys[i + 1].t) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = Math.max(b.t - a.t, 0.0001);
  const raw = (time - a.t) / span;
  const e = raw * raw * (3 - 2 * raw);
  const lerp = (x: number, y: number) => x + (y - x) * e;
  const trolley = lerp(a.trolley, b.trolley);
  const hoist = lerp(a.hoist, b.hoist);
  let carry: boolean;
  if (a.carry !== b.carry) carry = raw >= 0.999 ? b.carry : a.carry;
  else carry = a.carry;
  return { trolley, hoist, carry };
}

export function GantryCrane({ progress }: { progress: React.RefObject<number> }) {
  const trolleyRef = useRef<THREE.Group>(null);
  const spreaderRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(2); // start after load-in

  useFrame((_, delta) => {
    const p = progress.current ?? 1;
    // Agents run only in the settled half of the dive, and only while visible.
    if (p < 0.55) return;
    tRef.current += Math.min(delta, 0.05);
    const { trolley, hoist, carry } = sample(KEYS, tRef.current);

    const z = CRANE.pickZ + (CRANE.placeZ - CRANE.pickZ) * trolley;
    const y = CRANE.hoistLow + (CRANE.hoistHigh - CRANE.hoistLow) * hoist;
    if (trolleyRef.current) trolleyRef.current.position.set(CRANE.pickX, y, z);
    if (spreaderRef.current) spreaderRef.current.position.y = y - 1.2;

    const box = boxRef.current;
    if (box) {
      const carryingNow = carry;
      if (carryingNow) {
        box.position.set(CRANE.pickX, y - 1.2 - CONTAINER.h, z);
      } else {
        const atPlace = tRef.current % CRANE.cycle >= 10.5;
        box.position.set(CRANE.pickX, CONTAINER.h / 2, atPlace ? CRANE.placeZ : CRANE.pickZ);
      }
    }
  });

  return (
    <group>
      {/* static frame: legs + beam */}
      <group position={[CRANE.pickX, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, CRANE.beamY / 2, s * (CRANE.railZ / 2)]}>
            <boxGeometry args={[1.4, CRANE.beamY, 1.4]} />
            <meshStandardMaterial color="#0F766E" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, CRANE.beamY, 0]}>
          <boxGeometry args={[1.6, 1.2, CRANE.railZ + 4]} />
          <meshStandardMaterial color="#134E4A" roughness={0.7} />
        </mesh>
      </group>
      {/* trolley + spreader */}
      <group ref={trolleyRef}>
        <mesh>
          <boxGeometry args={[2.2, 1.2, 2.2]} />
          <meshStandardMaterial color="#EA580C" roughness={0.6} />
        </mesh>
        <group ref={spreaderRef}>
          <mesh>
            <boxGeometry args={[4.6, 0.4, 1.6]} />
            <meshStandardMaterial color="#1E1B18" roughness={0.6} />
          </mesh>
        </group>
      </group>
      {/* carried container */}
      <mesh ref={boxRef} position={[CRANE.pickX, CONTAINER.h / 2, CRANE.pickZ]}>
        <boxGeometry args={[CONTAINER.w, CONTAINER.h, CONTAINER.d]} />
        <meshStandardMaterial color={containerColor(3)} roughness={0.82} />
      </mesh>
    </group>
  );
}
```

Mount `<GantryCrane progress={progress} />` in `HeroStage`. Note the crane structure straddles a lane at `x = CRANE.pickX = -34`; confirm visually that its legs do not intersect stacks generated by `createYard` (shift `pickX` to `-84` if they do — the column at `x ≈ -76..-70` is free).

- [ ] **Step 2: Verify**

Set progress to 1, screenshot at two moments 6 s apart; read both. The spreader must be at different heights/positions and the carried box must sit on the ground at the pick or place slot when not carried — **geometrically consistent** (no floating box, no box inside the crane legs). Assert no console errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/hero
git commit -m "feat(hero): gantry crane state machine with carried container"
```

### Task 11: CC0 trucks + gate

**Files:**
- Create: `next-app/public/models/` assets
- Create: `next-app/src/components/hero/scene/Trucks.tsx`
- Modify: `next-app/src/components/hero/scene/HeroStage.tsx`
- Modify: `docs/resources-source-manifest.md`

- [ ] **Step 1: Download and place the CC0 models**

```bash
cd /tmp/opencode
curl -sL -o car-kit.zip "https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip"
mkdir -p kit && cd kit && unzip -o ../car-kit.zip "Models/GLB format/truck.glb" "Models/GLB format/box.glb" "Models/GLB format/cone.glb" "License.txt"
mkdir -p /home/garvit/projects2/shivaay/next-app/public/models
cp "Models/GLB format/truck.glb" /home/garvit/projects2/shivaay/next-app/public/models/truck.glb
cp "Models/GLB format/box.glb" /home/garvit/projects2/shivaay/next-app/public/models/box.glb
cp "Models/GLB format/cone.glb" /home/garvit/projects2/shivaay/next-app/public/models/cone.glb
cp License.txt /home/garvit/projects2/shivaay/next-app/public/models/LICENSE-kenney-car-kit.txt
```

Provenance (append to `docs/resources-source-manifest.md`):

```markdown
## 3D models (homepage hero)

| File | Source | License | Downloaded |
|---|---|---|---|
| `truck.glb`, `box.glb`, `cone.glb` | Kenney Car Kit 3.1 — https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip | CC0 (license copy: `public/models/LICENSE-kenney-car-kit.txt`) | 2026-10-05 |

Models were extracted from the kit and are tinted to the brand palette at runtime
(`Trucks.tsx`). Reference projects (Meridian Terminal, cargoShip3JS, shipping_container)
were studied for patterns only — no code was copied.
```

- [ ] **Step 2: Write `Trucks.tsx`**

Key implementation (full component in the file):

- `useGLTF("/models/truck.glb")`; `scene.clone()` per truck (never mutate the cached scene).
- **Scale/ground fit** from the bounding box (source scale is unknown):

```tsx
const box = new THREE.Box3().setFromObject(obj);
const size = box.getSize(new THREE.Vector3());
const scale = 7 / Math.max(size.x, size.z);
const center = box.getCenter(new THREE.Vector3());
obj.scale.setScalar(scale);
obj.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
```

- **Brand tint**: traverse and replace materials — wheels/glass `#1E1B18`, body `#0F766E` (truck 1) / `#134E4A` (truck 2), trailer/box `#FAF8F4`:

```tsx
obj.traverse((o) => {
  if (!(o instanceof THREE.Mesh)) return;
  const n = o.name.toLowerCase();
  const dark = /wheel|tire|window|glass/.test(n);
  o.material = new THREE.MeshStandardMaterial({
    color: dark ? "#1E1B18" : body,
    roughness: 0.8,
    metalness: 0.05,
  });
});
```

- **Tier behavior:** receive `tier` as a prop; render the second truck, the gate cones and the crate props only when `tier === "full"`.
- **Grounding:** one soft blob shadow per truck — a 12×8 plane with a radial-gradient CanvasTexture (`#1E1B18` at 18% → transparent), `rotation-x={-Math.PI / 2}`, `y={0.02}`, parented to the truck group.
- **Paths**: `TRUCK_PATHS` from `lib/yard.ts`; per frame `u = (t * speed + offset) % 1`, position = `curve.getPointAt(u)` (build `CatmullRomCurve3` from points, `curve.arcLengthDivisions = 200`), orientation = `lookAt(position + tangent)`, wheels rotate if any child name matches `/wheel/i`.
- **Accumulated clock**: track time with `t = (prev + Math.min(delta, 0.05)) % 1e6` so pausing (offscreen tab) never jumps.
- **GLB error fallback**: a class `ModelBoundary extends React.Component` with `componentDidCatch` → renders `<ProceduralTruck color={body} />` (cab box + cargo box + 4 cylinder wheels). Wrap each truck's model subtree.

- [ ] **Step 3: Add the gate + barrier**

In `Trucks.tsx` (or a small `Gate` export in the same file): two booth boxes at `GATE.x ± GATE.width / 2, GATE.z`, a barrier arm (`boxGeometry [GATE.width - 6, 0.3, 0.3]`, pivot at one end) whose rotation.z animates up/down in sync with truck #1's path progress window (`u ∈ [0.05, 0.25]` → raised). Add two `cone.glb` instances near the gate (clone + same fit/tint helpers, body `#EA580C`). Mount `<Trucks tier={tier} />` in `HeroStage`.

- [ ] **Step 4: Verify**

- `curl -sI http://localhost:5182/models/truck.glb | head -1` → `200`.
- Playwright with `page.route("**/models/*.glb", lambda r: r.abort())`: scene still renders, procedural trucks appear, zero console errors.
- Normal run: screenshot at settled progress; read it — two trucks on lanes, wheels not sunk into ground, gate visible with barrier.
- Inspect network: truck.glb requested once (cached by the loader; cloning shares it).

- [ ] **Step 5: Commit**

```bash
git add next-app/public/models next-app/src/components/hero docs/resources-source-manifest.md
git commit -m "feat(hero): CC0 Kenney trucks with brand tint, routes, gate and GLB fallback"
```

### Task 12: Reach stacker, props, stack labels

**Files:**
- Create: `next-app/src/components/hero/scene/StackLabels.tsx`
- Modify: `next-app/src/components/hero/scene/Agents.tsx` (reach stacker)
- Modify: `next-app/src/components/hero/scene/HeroStage.tsx`

- [ ] **Step 1: Reach stacker (procedural, full tier only)**

In `Agents.tsx`, add `ReachStacker` (skip it entirely on `tier === "lite"`): body box, cabin box, angled boom (two boxes), four dark cylinders; it drives ±4 units along x near the lane at `z = 0` every ~20 s and its boom lifts one `box.glb` clone (or a plain box for lite tier) between the ground and a stack top. Keep the motion slow and mechanical (ease-in-out, 2 s holds) and use the same accumulated-clock clamp as the crane.

Also add the yard's edge dressing: a warehouse silhouette at the yard's north edge (long box 70×10×20 in `#F3EFE7` with a strip of dark roller-door rectangles and a barcode `CanvasTexture`), plus 2–3 apron decals (painted lane arrows and an `SHV` stencil) as thin planes at `y = 0.02`.

- [ ] **Step 2: `StackLabels.tsx`**

```tsx
"use client";

import { Html } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { createYard } from "@/lib/yard";

export function StackLabels({
  tier,
  progress,
}: {
  tier: "full" | "lite";
  progress: React.RefObject<number>;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { labels } = createYard(116, tier === "lite" ? "lite" : "full");

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = progress.current ?? 1;
      const o = Math.max(0, Math.min(1, (p - 0.62) / 0.3));
      refs.current.forEach((el) => {
        if (el) el.style.opacity = String(o);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  if (tier === "lite") return null;

  return (
    <>
      {labels.slice(0, 8).map((l, i) => (
        <Html
          key={l.id}
          position={[l.x, l.y, l.z]}
          center
          distanceFactor={90}
          zIndexRange={[10, 0]}
          style={{ opacity: 0 }}
          ref={(el) => {
            refs.current[i] = el as unknown as HTMLDivElement | null;
          }}
        >
          <span className="hero-stack-label">{l.text}</span>
        </Html>
      ))}
    </>
  );
}
```

If drei's `Html` ref typing fights you, wrap the span in a `<div ref>` inside the `Html` instead. Mount in `HeroStage` after `<StackField />`.

- [ ] **Step 3: Verify**

Settled screenshot: labels readable, not overlapping the copy or the crane; hovered nothing. `tier="lite"` rendering (390 px viewport) has no labels and fewer stacks. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/components/hero
git commit -m "feat(hero): reach stacker agent, gate props and floating stack waybills"
```

**Milestone M4 push.**

---

## M5 · Cursor system

### Task 13: Cursor store (TDD)

**Files:**
- Create: `next-app/src/lib/cursor-store.ts`
- Create: `next-app/tests/cursor-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  setDomWaybill, setThreeWaybill, getCursorState, activeWaybill,
  subscribeCursor, resetCursorStore,
} from "../src/lib/cursor-store.ts";

test("notifies subscribers and prefers the 3D waybill", () => {
  resetCursorStore();
  let calls = 0;
  const unsub = subscribeCursor(() => { calls += 1; });

  setDomWaybill({ id: "SHV-001", label: "Customs Clearance" }, { x: 1, y: 2, w: 3, h: 4 });
  assert.equal(activeWaybill()?.id, "SHV-001");
  assert.equal(getCursorState().scanRect?.w, 3);

  setThreeWaybill({ id: "SHV-TRK", label: "Inbound — Mundra" });
  assert.equal(activeWaybill()?.id, "SHV-TRK");

  setDomWaybill(null);
  assert.equal(activeWaybill()?.id, "SHV-TRK");

  setThreeWaybill(null);
  assert.equal(activeWaybill(), null);

  assert.equal(calls, 4);
  unsub();
  setDomWaybill({ id: "X", label: "x" });
  assert.equal(calls, 4);
});
```

- [ ] **Step 2: Run it — must fail**

Run: `cd next-app && node --experimental-strip-types --test tests/cursor-store.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write `cursor-store.ts`**

```ts
export interface Waybill {
  id: string;
  label: string;
  route?: string;
  eta?: string;
}

export interface ScanRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CursorState {
  dom: Waybill | null;
  threeD: Waybill | null;
  scanRect: ScanRect | null;
}

const EMPTY: CursorState = { dom: null, threeD: null, scanRect: null };
let state: CursorState = EMPTY;
const listeners = new Set<() => void>();

export function getCursorState(): CursorState {
  return state;
}

/** Effective waybill: the 3D hover wins while the pointer is over the canvas. */
export function activeWaybill(): Waybill | null {
  return state.threeD ?? state.dom;
}

export function subscribeCursor(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(next: CursorState) {
  state = next;
  listeners.forEach((fn) => fn());
}

export function setDomWaybill(waybill: Waybill | null, scanRect: ScanRect | null = null) {
  emit({ ...state, dom: waybill, scanRect });
}

export function setThreeWaybill(waybill: Waybill | null) {
  emit({ ...state, threeD: waybill });
}

/** Test-only helper. */
export function resetCursorStore() {
  state = EMPTY;
  listeners.clear();
}
```

- [ ] **Step 4: Run test — must pass**

Run: `cd next-app && node --experimental-strip-types --test tests/cursor-store.test.ts`
Expected: 1 test, 4 notifications, green.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/cursor-store.ts next-app/tests/cursor-store.test.ts
git commit -m "feat(cursor): external waybill store with DOM/3D source precedence"
```

### Task 14: Cursor — scanner box, waybill tag, stamp variants

**Files:**
- Modify: `next-app/src/components/motion/Cursor.tsx` (full evolution, existing ring/stamp behavior kept)
- Modify: `next-app/src/app/globals.css` (cursor section + reduced-motion block)

- [ ] **Step 1: Rewrite `Cursor.tsx`**

Full component (keeps the current ring physics and stamp thunk; adds the scanner + waybill + variants):

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  activeWaybill,
  getCursorState,
  setDomWaybill,
  subscribeCursor,
  type Waybill,
} from "@/lib/cursor-store";

const STAMP_TEXT: Record<string, string> = {
  cleared: "Cleared",
  scanned: "Scanned",
  signed: "Signed",
  stacked: "Stacked",
};

function parseWaybill(el: Element | null): Waybill | null {
  const raw = el?.getAttribute("data-waybill");
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<Waybill>;
    return typeof o.label === "string" ? { id: o.id ?? "", label: o.label, route: o.route, eta: o.eta } : null;
  } catch {
    return null;
  }
}

/**
 * Customs-stamp cursor: trailing ring, scanner sweep + waybill tag over
 * [data-scan] targets, contextual stamps on click. Fine pointers only,
 * native cursor stays visible, everything off under reduced motion.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const tagIdRef = useRef<HTMLSpanElement>(null);
  const tagLabelRef = useRef<HTMLSpanElement>(null);
  const tagRouteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ring = ringRef.current;
    const stamp = stampRef.current;
    const scan = scanRef.current;
    const tag = tagRef.current;
    const tagId = tagIdRef.current;
    const tagLabel = tagLabelRef.current;
    const tagRoute = tagRouteRef.current;
    if (!ring || !stamp || !scan || !tag || !tagId || !tagLabel || !tagRoute) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let shown = false;
    let raf = 0;
    let hideTimer = 0;

    const renderWaybill = () => {
      const w = activeWaybill();
      if (!w) {
        tag.classList.remove("is-on");
        scan.classList.remove("is-on");
        return;
      }
      tagId.textContent = w.id;
      tagLabel.textContent = w.label;
      tagRoute.textContent = [w.route, w.eta].filter(Boolean).join(" · ");
      tagRoute.style.display = w.route || w.eta ? "block" : "none";
      tag.classList.add("is-on");
      const r = getCursorState().scanRect;
      if (r) {
        scan.style.left = `${r.x - 3}px`;
        scan.style.top = `${r.y - 3}px`;
        scan.style.width = `${r.w + 6}px`;
        scan.style.height = `${r.h + 6}px`;
        scan.classList.add("is-on");
      } else {
        scan.classList.remove("is-on");
      }
    };

    const unsub = subscribeCursor(renderWaybill);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        ring.style.opacity = "1";
      }
      const t = e.target as HTMLElement | null;
      const scanTarget = t?.closest("[data-scan]") ?? null;
      const wbTarget = scanTarget ?? t?.closest("[data-waybill]") ?? null;
      const rect = scanTarget?.getBoundingClientRect();
      setDomWaybill(
        parseWaybill(wbTarget),
        rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null
      );
      const interactive = t?.closest(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor], [data-scan]"
      );
      ring.classList.toggle("cursor-active", Boolean(interactive));
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const stampTarget = t?.closest("[data-stamp]") as HTMLElement | null;
      if (!stampTarget) return;
      const variant = stampTarget.getAttribute("data-stamp") || "cleared";
      stamp.textContent = STAMP_TEXT[variant] ?? STAMP_TEXT.cleared;
      stamp.dataset.variant = variant in STAMP_TEXT ? variant : "cleared";
      stamp.style.left = `${e.clientX}px`;
      stamp.style.top = `${e.clientY}px`;
      stamp.classList.remove("stamp-thunk");
      void stamp.offsetWidth;
      stamp.style.opacity = "1";
      stamp.classList.add("stamp-thunk");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        stamp.style.opacity = "0";
      }, 750);
      const main = document.getElementById("main-content");
      if (main) {
        main.classList.remove("cursor-shake");
        void main.offsetWidth;
        main.classList.add("cursor-shake");
      }
    };

    const onLeave = () => {
      setDomWaybill(null);
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      tag.style.transform = `translate(${rx + 20}px, ${ry + 24}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      unsub();
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-follow" aria-hidden="true" />
      <div ref={scanRef} className="cursor-scanbox" aria-hidden="true" />
      <div ref={tagRef} className="cursor-waybill" aria-hidden="true">
        <span ref={tagIdRef} className="wb-id" />
        <span ref={tagLabelRef} className="wb-label" />
        <span ref={tagRouteRef} className="wb-route" />
      </div>
      <div ref={stampRef} className="cursor-stamp-el" aria-hidden="true">
        Cleared
      </div>
    </>
  );
}
```

- [ ] **Step 2: CSS**

In the cursor section of `globals.css` (after `.cursor-stamp-el` rules) add:

```css
.cursor-waybill,
.cursor-scanbox {
  position: fixed; top: 0; left: 0; z-index: 9998;
  pointer-events: none; opacity: 0; transition: opacity 0.18s;
}
.cursor-waybill {
  transform: translate(20px, 24px);
  background: rgba(250, 248, 244, 0.96);
  border: 1px dashed rgba(15, 118, 110, 0.55);
  border-radius: 4px; padding: 6px 9px; max-width: 220px;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em;
  text-transform: uppercase; color: #1E1B18;
  box-shadow: 0 6px 18px rgba(30, 27, 24, 0.08);
}
.cursor-waybill.is-on { opacity: 1; }
.cursor-waybill .wb-id { color: #EA580C; font-weight: 700; margin-right: 6px; }
.cursor-waybill .wb-route { color: #6B5E4A; margin-top: 2px; }
.cursor-scanbox {
  z-index: 9997; border: 1px dashed rgba(15, 118, 110, 0.65);
  border-radius: 4px; overflow: hidden;
}
.cursor-scanbox.is-on { opacity: 1; }
.cursor-scanbox::after {
  content: ""; position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #EA580C, transparent);
  animation: scan-sweep 0.9s ease-in-out infinite;
}
@keyframes scan-sweep {
  0% { top: 0; }
  50% { top: calc(100% - 1px); }
  100% { top: 0; }
}
.cursor-stamp-el[data-variant="scanned"] { color: #0F766E; border-color: #0F766E; }
.cursor-stamp-el[data-variant="signed"] { color: #1E1B18; border-color: #1E1B18; }
.cursor-stamp-el[data-variant="stacked"] { color: #EA580C; border-color: #EA580C; }
```

Extend the existing reduced-motion block (`.cursor-follow, .cursor-stamp-el { display: none; }`) to also hide `.cursor-waybill, .cursor-scanbox`.

- [ ] **Step 3: Verify with fixtures**

Playwright: inject a fixture element, hover it, click it, and assert the three behaviors:

```python
pg.goto(URL, wait_until="networkidle")
pg.wait_for_timeout(5000)
pg.evaluate("""() => {
  const d = document.createElement("button");
  d.id = "cursor-fixture";
  d.setAttribute("data-scan", "");
  d.setAttribute("data-waybill", JSON.stringify({id: "SHV-999", label: "Fixture Cargo", route: "LDH → MUNDRA", eta: "24H"}));
  d.setAttribute("data-stamp", "scanned");
  d.textContent = "fixture";
  d.style.cssText = "position:fixed;top:200px;left:200px;z-index:99;padding:20px";
  document.body.appendChild(d);
}""")
pg.hover("#cursor-fixture")
pg.wait_for_timeout(300)
assert pg.locator(".cursor-waybill.is-on").count() == 1
assert "SHV-999" in pg.locator(".cursor-waybill").inner_text()
assert pg.locator(".cursor-scanbox.is-on").count() == 1
pg.mouse.down(); pg.mouse.up()
pg.wait_for_timeout(200)
assert pg.locator(".cursor-stamp-el").inner_text().strip() == "Scanned"
assert pg.locator(".cursor-stamp-el").get_attribute("data-variant") == "scanned"
pg.mouse.move(600, 400)
pg.wait_for_timeout(300)
assert pg.locator(".cursor-waybill.is-on").count() == 0
```

- [ ] **Step 4: Commit**

```bash
git add next-app/src/components/motion/Cursor.tsx next-app/src/app/globals.css
git commit -m "feat(cursor): scanner highlight, waybill tag and contextual stamp variants"
```

### Task 15: Attribute pass on real elements

**Files:**
- Modify: `next-app/src/components/layout/Navbar.tsx`
- Modify: `next-app/src/components/home/ServiceTags.tsx`
- Modify: `next-app/src/components/services/ServiceGrid.tsx`
- Modify: `next-app/src/components/services/GalleryLightbox.tsx` (line ~67)
- Modify: `next-app/src/components/contact/ContactForm.tsx` (line ~115)

- [ ] **Step 1: Add attributes (one per element family)**

- **Navbar** — every desktop nav `<Link>`: `data-scan` (no waybill — it's a destination, not cargo). Result: scanner sweep on nav hover.
- **ServiceTags** (home mini-cards): `data-scan` + `data-waybill` built from data, e.g.:

```tsx
data-waybill={JSON.stringify({
  id: `SHV-${String(i + 1).padStart(2, "0")}`,
  label: s.title,
  route: "LDH → PAN-INDIA",
  eta: "24–72H",
})}
```

- **ServiceGrid** container cards: `data-scan` + `data-waybill` (service title; `route` = "CUSTOMS → CLEARED") and `data-stamp="stacked"` on each card button.
- **GalleryLightbox** gallery items: `data-scan` + `data-stamp="scanned"`.
- **ContactForm** submit button: `data-stamp="signed"`.
- **CTASection** already has `data-stamp` (defaults to `Cleared`) — leave as is.

- [ ] **Step 2: Verify on real pages**

Playwright across `/`, `/services`, `/contact`: hover a service card → waybill appears with a title; click gallery item → stamp reads `Scanned`; click contact submit (disable network by not filling the form — just assert the stamp variant on mousedown) → `Signed`. Assert no layout shift (`getBoundingClientRect()` of the hovered element unchanged after attributes).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components
git commit -m "feat(cursor): wire scan/waybill/stamp attributes across home, services, contact"
```

### Task 16: 3D → cursor bridge

**Files:**
- Create: `next-app/src/lib/hero-bridge.ts`
- Modify: `next-app/src/components/hero/scene/Agents.tsx` (raycast hovers)
- Modify: `next-app/src/components/hero/scene/Trucks.tsx` (raycast hovers)
- Modify: `next-app/src/components/hero/useHeroProgress.ts` (hook delegate)
- Modify: `next-app/src/lib/cursor-store.ts` (no change expected — use existing `setThreeWaybill`)

- [ ] **Step 1: Write `hero-bridge.ts`**

```ts
export interface HeroBridge {
  /** Screen-space position of a named agent (for tests + tooling). */
  getAgentScreenPosition: (id: string) => { x: number; y: number } | null;
}

export const heroBridge: HeroBridge = {
  getAgentScreenPosition: () => null,
};
```

- [ ] **Step 2: Raycast hovers in the scene**

In `Trucks.tsx` and the crane/stacker sections of `Agents.tsx`:

```tsx
onPointerOver={(e) => {
  e.stopPropagation();
  document.body.style.cursor = "pointer";
  setThreeWaybill({ id: "SHV-TRK-01", label: "Inbound — Mundra", route: "MUNDRA → LDH", eta: "ETA 06:40" });
}}
onPointerOut={() => {
  document.body.style.cursor = "";
  setThreeWaybill(null);
}}
```

`roots` is a `useRef<Record<string, THREE.Object3D>>({})` owned by `Agents`; each agent group writes `roots.current[id] = node` in a layout effect on mount and deletes it on unmount. Pass `roots` into `BridgeRegistration` as a prop. Give every hoverable agent a stable name (`truck-1`, `truck-2`, `crane`, `stacker`). Inside the Canvas, a small `BridgeRegistration` component (in `Agents.tsx`) registers `heroBridge.getAgentScreenPosition`:

```tsx
const { camera, size } = useThree();
useEffect(() => {
  heroBridge.getAgentScreenPosition = (id) => {
    const obj = roots.current[id];
    if (!obj) return null;
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    v.project(camera);
    return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height };
  };
  return () => {
    heroBridge.getAgentScreenPosition = () => null;
  };
}, [camera, size]);
```

- [ ] **Step 3: Hook delegate**

In `useHeroProgress.ts`, import `heroBridge` and set `getAgentScreenPosition: (id) => heroBridge.getAgentScreenPosition(id)` on the `window.__slHero` object.

- [ ] **Step 4: Verify**

```python
pg.goto(URL, wait_until="networkidle")
pg.wait_for_timeout(5200)  # settled
pos = pg.evaluate("window.__slHero.getAgentScreenPosition('truck-1')")
print("truck screen pos:", pos)
assert pos and pos["x"] > 0 and pos["y"] > 0
pg.mouse.move(pos["x"], pos["y"])
pg.wait_for_timeout(400)
assert pg.locator(".cursor-waybill.is-on").count() == 1
assert "SHV-TRK" in pg.locator(".cursor-waybill").inner_text()
pg.mouse.move(700, 300)
pg.wait_for_timeout(400)
assert pg.locator(".cursor-waybill.is-on").count() == 0
```

Also assert DOM hover still works after leaving the canvas, and `document.body.style.cursor` resets.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/components/hero next-app/src/lib/hero-bridge.ts
git commit -m "feat(cursor): yard agents feed the waybill tag via raycast bridge"
```

**Milestone M5 push.**

---

## M6 · Hardening + ship

### Task 17: Fallback matrix verification

**Files:**
- Modify: only what the checks break (fix root causes)

- [ ] **Step 1: Reduced motion**

Playwright `page.emulate_media(reduced_motion="reduce")`, load `/`:
- `.hero-copy` visible without scrolling; `window.__slHero.getState().phase === "settled"` immediately.
- No skip button; no cursor elements (`display: none`); no `.reveal` hidden content on the page (existing rule).
- Screenshot: settled yard frame, agents parked (no movement across two screenshots 2 s apart — compare pixel hash or assert `data-progress` constant).

- [ ] **Step 2: WebGL off**

`p.chromium.launch(args=["--disable-webgl", "--disable-gpu"])` → `/` shows `.yard-fallback svg`; `window.__slHero` may be absent or `webgl=false` (assert whichever contract holds); **0 console errors**; no canvas.

- [ ] **Step 3: Context loss simulation**

On a normal page: `pg.evaluate("document.querySelector('canvas').getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext()")` (guard for webgl vs webgl2 — try both). Expect the SVG fallback to appear, page still usable, no thrown errors in console (a WebGL warning from the browser itself is acceptable; our code must not log errors).

- [ ] **Step 4: GLB failure**

`page.route("**/models/*.glb", abort)` → procedural trucks render, waybill bridge still works, 0 errors.

- [ ] **Step 5: Fix anything broken, re-run all four, commit**

```bash
git add -A && git commit -m "fix(hero): fallback matrix — reduced motion, no WebGL, context loss, model failure"
```

### Task 18: Performance budget + quality tiers

**Files:**
- Modify: `next-app/src/components/hero/HeroStage.tsx`, `HeroStageMount.tsx` (tier tuning)
- Modify: `docs/progress.md` (numbers)

- [ ] **Step 1: Measure the bundle**

```bash
cd next-app && npm run build
cd /home/garvit/projects2/shivaay/next-app
for f in $(ls -S out/_next/static/chunks/*.js | head -8); do printf "%9d gz  %s\n" "$(gzip -9c "$f" | wc -c)" "$(basename "$f")"; done
```

Then identify hero-only chunks by request diff (Playwright: capture all `.js` request URLs on `/` and on `/services`; the difference = lazy hero chunk set, which should include the big three.js chunk). Report: initial JS per route (build output), home-only lazy KB gz, model transfer (truck.glb 176 KB → gzip? GLB is binary; report raw).

**Budget check:** home-only lazy total **≤ 450 KB gz** (three ~180 + R3F/drei ~60 + models ~180 + code ~20). If models push it over, run exactly this and re-measure:

```bash
cd /tmp/opencode && npx --yes @gltf-transform/cli@4 optimize kit/"Models/GLB format/truck.glb" truck.opt.glb --texture-compress webp --texture-size 256
```

If the optimized file is smaller, copy it over `public/models/truck.glb`; if the truck's textures are unused after our flat tinting, verify visually first.

- [ ] **Step 2: Frame-rate sample**

```python
res = pg.evaluate("""() => new Promise(res => {
  let n = 0; const t0 = performance.now();
  const loop = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(loop); else res(n / 2); };
  requestAnimationFrame(loop);
})""")
print("fps ~", res)
```

Desktop target ≥ 45 (headless SwiftShader is not representative — also do a human-visible pass on the real preview). Mobile 390 px: assert canvas exists, tier=lite, no horizontal overflow (`document.documentElement.scrollWidth <= 390`), fewer instances (`stack count` via a debug getter or just visual).

- [ ] **Step 3: Tune if needed** (dpr, instance counts, fog) — only measured changes.

- [ ] **Step 4: Record numbers in `docs/progress.md`** (same table format as the existing entries) and commit.

### Task 19: Durable verification script

**Files:**
- Create: `scripts/verify_hero.py`

- [ ] **Step 1: Write the script**

`scripts/verify_hero.py` (repo root) — argparse `--base-url` default `http://localhost:5182`, `--shots` default `/tmp/opencode/hero-verify`; prints `PASS`/`FAIL` per check and exits non-zero on failure. Checks (each independent, fresh context where needed):

1. `home_ssr_copy`: raw HTML contains the headline (use `urllib.request`, no browser).
2. `canvas_mounts`: canvas box ≈ viewport, zero console errors, phase settles ≤ 6 s.
3. `scrub_releases`: mid-track scroll → progress > 0.05, sticky top ≈ 0; scroll past track → next section visible.
4. `skip_works`: click skip → settled; copy visible.
5. `revisit_quick`: same sessionStorage context, reload → progress starts ≥ 0.7, settles ≤ 2 s.
6. `reduced_motion`: emulation → settled immediately, copy visible, no cursor elements.
7. `no_webgl`: `--disable-webgl` launch → `.yard-fallback svg` visible, 0 errors.
8. `model_failure`: abort `**/models/*.glb` → still renders, 0 errors.
9. `cursor_fixture`: scanner box + waybill tag + stamp variant (fixture from Task 14).
10. `yard_hover`: `getAgentScreenPosition('truck-1')` hover → tag shows `SHV-TRK`, unhover clears.
11. `mobile_390`: viewport 390×844 → no horizontal overflow, canvas present.
12. `other_routes_clean`: `/services` loads with 0 errors and does **not** request the hero-only chunks (diff JS URLs vs home).

- [ ] **Step 2: Run it**

```bash
cd /home/garvit/projects2/shivaay && python3 scripts/verify_hero.py
```

Expected: every check PASS. Fix root causes until green (no test weakening).

- [ ] **Step 3: Commit**

```bash
git add scripts/verify_hero.py
git commit -m "test(hero): durable Playwright verification for stage, choreography, cursor, fallbacks"
```

### Task 20: Retire GlobeHero, docs, final pass

**Files:**
- Delete: `next-app/src/components/motion/GlobeHero.tsx`
- Modify: `next-app/src/app/globals.css` (remove `.globe-*` block)
- Modify: `docs/progress.md`, `tasks/lessons.md`, `next-app/AGENTS.md`

- [ ] **Step 1: Confirm nothing references the globe**

```bash
cd /home/garvit/projects2/shivaay && grep -rn "GlobeHero\|globe-wrap\|globe-fallback" next-app/src --include="*.tsx" --include="*.ts" --include="*.css"
```

Expected after deletion: no matches.

- [ ] **Step 2: Delete + clean CSS**

Delete the component; remove the `/* ---- Globe hero ---- */` CSS block (`.globe-wrap`, `.globe-wrap canvas`, `.globe-fallback`, `.globe-fallback-ui`, `.globe-fallback-ui.is-hidden`). Build + lint + verify script.

- [ ] **Step 3: Docs**

- `docs/progress.md`: add the hero milestone (spec/plan links, commit range, measured bundle numbers, verification status, open items: motion-density client verdict, rail phase-2, truck asset choice resolved = Kenney).
- `tasks/lessons.md`: add any corrected pattern from this work (at minimum: `overflow-x: hidden` on `body` breaks `position: sticky` — use `overflow-x: clip`; and the Node test runner + `allowImportingTsExtensions` setup for pure-lib tests).
- `next-app/AGENTS.md`: one line under conventions — hero is R3F, lazy/home-only; GLB models live in `public/models/` with provenance in the manifest; never import three/R3F outside `components/hero/`.

- [ ] **Step 4: Final sweep**

```bash
cd next-app && npm run build && npm run lint
cd /home/garvit/projects2/shivaay && python3 scripts/verify_hero.py
git status --short
```

Final screenshots: desktop settled, mid-dive, mobile, reduced-motion, no-WebGL → read all with the read tool. Compare against the spec's success criteria (dive understood, yard unmistakably Shivaay, copy preserved, fallbacks clean).

- [ ] **Step 5: Commit + push**

```bash
git add -A
git commit -m "docs(hero): retire GlobeHero, record verification, update project notes"
git push origin redesign/immersive-2026
```

**Milestone M6 push.** Preview URL goes to the client for the motion-density verdict. **Do not merge to `main`.**

---

## 3 · Verification matrix (final state)

| Check | Command / evidence |
|---|---|
| Unit (palette, yard, store) | `node --experimental-strip-types --test tests/*.test.ts` (3 files) |
| Build static 11/11 | `npm run build` |
| Lint | `npm run lint` |
| Full behavioral | `python3 scripts/verify_hero.py` (12 checks) |
| Bundle | build output + request diff; hero lazy ≤ 450 KB gz, initial unchanged |
| Vision | `screenshots/hero/*` read directly (settled, mid-dive, mobile, reduced, no-WebGL) |
| Regression | preloader sequence, door wipe, all other routes, services wall colors |

## 4 · Explicitly not doing

Dark mode · physics · rail siding (phase 2, gated on client verdict) · scroll hijacking beyond the bounded scrub · any non-CC0 asset · copying code from the unlicensed reference projects (patterns only) · touching `lib/data.ts` content.

## 5 · Spec deltas (refinements applied in this plan)

1. **Assets single-sourced:** Quaternius shipping-container prop dropped (Poly Pizza download is JS-gated and the API timed out in testing) — all 3D assets are Kenney Car Kit CC0. Spec open question #3 resolved.
2. **Revisit key:** reuses the existing `sl-seen` session key instead of a new `sl-hero-seen` (one source of truth with the preloader).
3. **Cloud band:** implemented as soft sprites + fog rather than a plane wipe (same masking intent, cheaper and softer).
4. **Shadows:** soft blob shadow planes under the moving agents (trucks, crane, stacker) instead of drei `ContactShadows` — same grounding intent, cheaper and softer in light mode.
