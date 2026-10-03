# Immersive Redesign — "The Journey" (Implementation Plan)

**Date:** 2026-10-03 · **Branch:** `redesign/immersive-2026` (off `feat/resources-section`)
**Spec:** `docs/superpowers/specs/2026-10-03-immersive-redesign-design.md` (read it first — it is the source of truth for features/tokens)
**Audience:** fresh subagent picking this up cold. Follow the workflow rules in `/home/garvit/projects2/shivaay/AGENTS.md` and `~/projects2/AGENTS.md`.

## 1. Goal + constraints

Rebuild the Shivaay Logistics site around one metaphor — **freight as a journey** — with award-level polish while keeping B2B trust.

Hard constraints (do not violate):
- **Static export** (`output: "export"`): every route must build static; no server runtime/APIs. All 3D/motion are lazy client components with server-rendered fallback content (crawler/no-JS safe).
- **Light mode only.** No dark mode work.
- **100% of existing content preserved** (light copy polish allowed). Data lives in `src/lib/data.ts` / `src/lib/resources.ts` — treat as read-only.
- **a11y:** skip link first focusable; lightbox keeps Escape/focus-trap/aria-modal/focus-restore; native cursor never fully hidden; all motion off under `prefers-reduced-motion` with content fully visible.
- **Perf budget:** < 250KB added gzip JS vs `main` baseline. three.js via dynamic `import()` only; physics/spine/odometer/conveyor hand-rolled (no new heavy deps). Shared rAF; IntersectionObserver pauses offscreen animation.
- **Map tiles:** Esri Light Gray Canvas only. Never Carto (watermarks keyless usage).

## 2. First: determine current state

The branch is being worked by parallel streams. Before doing anything:

```bash
cd /home/garvit/projects2/shivaay && git log --oneline -10 && git status --short
ls next-app/src/components/motion next-app/src/components/home
```

Baseline at plan-writing time: HEAD = `08d06b4 feat(redesign): motion system + immersive homepage rebuild`, clean tree. If later commits exist, inspect them (`git show --stat <sha>`) to see which streams landed.

## 3. Milestones

| # | Milestone | Status |
|---|---|---|
| M0 | Design spec approved + committed | DONE (`63c0d57`) |
| M1 | Design-system foundation | DONE (`08d06b4`) |
| M2 | Motion primitives | DONE (`08d06b4`) |
| M3 | Homepage rebuild | DONE (`08d06b4`) |
| M4 | Stream A: vision-review fix pass | IN FLIGHT — verify |
| M5 | Stream B: services container wall + icon dedup | IN FLIGHT — verify |
| M6 | Stream C: contact/resources/404/navbar/footer restyle | IN FLIGHT — verify |
| M7 | Integration: build + lint green | PENDING |
| M8 | Full verification passes (visual/mobile/a11y/perf/transitions) | PENDING |
| M9 | Push branch + report | PENDING |

### M1 — Foundation (done)
- Scope: `next-app/src/app/globals.css` (~1055 lines). Tokens `cream #FAF8F4` / `ink #1E1B18` / `ink-dim #6B5E4A` / `teal #0F766E` / `orange #EA580C` / `border #E8E4DB` (+`cream-deep`); fonts Playfair Display + Inter + Space Grotesk + JetBrains Mono; motif classes `corrugated`, `waybill`, `barcode`, `stamp-badge`, `blueprint`, `mono-label`; keyframes for preloader/page-wipe/odometer/conveyor/container-card/crates/spine/scroll-cue; `prefers-reduced-motion` rules.
- Acceptance: tokens/motifs present (7 motif classes), no dark-mode remnants.

### M2 — Motion primitives (done)
- Files: `src/components/motion/{Preloader,Cursor,PageTransition,Odometer,LiveTicker,RouteSpine,Conveyor,CratesField,GlobeHero}.tsx`
- Preloader: waybill sequence (barcode scan → stamp slam → container doors open), once per session via `sessionStorage`.
- Cursor: stamp cursor, `@media (pointer: fine)` only, `data-cursor` variants, native cursor remains.
- PageTransition: door wipe on internal nav. Odometer: count-up on reveal. LiveTicker: deterministic per-day seed. RouteSpine: scroll-driven SVG dashed route + truck marker. Conveyor: infinite draggable auto-scroll. CratesField: hand-rolled 2D physics. GlobeHero: three.js lazy-loaded dot-globe, arcs per `routes` data, drag + auto-rotate, static fallback without WebGL.

### M3 — Homepage rebuild (done)
- Files: `src/app/page.tsx`, `src/components/home/*` (HomeShell, HeroSection, MissionSection, NetworkMap/Section, ServiceTags, TestimonialsSection, WhyPartnerSection, CTASection)
- Order per spec: preloader → globe hero → mini container service cards → spine → coverage (map + ticker) → mission → why-us → conveyor → physics CTA. Build+lint were green at commit.

### M4 — Stream A: vision-review fix pass (IN FLIGHT)
- Scope: fixes from vision-subagent review of M1–M3 screenshots; polish only, no new features.
- Files: `globals.css`, `components/motion/*`, `components/home/*` only. Must not touch routes beyond `/`.
- Acceptance: review findings addressed; `npm run build && npm run lint` green; home screenshots re-reviewed by vision subagent.

### M5 — Stream B: services page (IN FLIGHT)
- Scope: kinetic container wall — 12 corrugated containers (restrained brand palette) stack in on scroll, hover/click flips to detail; progressive enhancement (works as static grid without JS); gallery lightbox restyled to new system; lucide icon dedup (named imports, no `import * as Icons` barrel).
- Files: `src/app/services/page.tsx`, `src/components/services/{ServiceGrid,GalleryLightbox}.tsx`, new `components/services/` container-wall component if created.
- Acceptance: all 12 services from `lib/data.ts` rendered (content preserved); lightbox a11y intact (5-item checklist); no-JS grid readable; lint/build green.

### M6 — Stream C: remaining routes + layout (IN FLIGHT)
- Scope: restyle `/contact` (waybill form: mono labels, dashed separators; office map; info cards), `/resources` + 4 subroutes (no 3D; stamp/waybill motifs), 404 ("Shipment not found" stamp moment), Navbar + Footer (+ WhatsAppFloat if styled) to new system.
- Files: `src/app/contact/page.tsx`, `src/app/not-found.tsx`, `src/app/resources/**`, `src/components/resources/*`, `src/components/layout/{Navbar,Footer,WhatsAppFloat}.tsx`. `ScrollReveal.tsx` shared — coordinate, don't fork.
- Acceptance: all routes render new tokens/motifs; forms still functional client-side; skip link still first; lint/build green.

### M7 — Integration (PENDING)
After all three streams land:
1. `git log` to confirm stream commits; read each diff for conflicts in shared files (`globals.css`, `ScrollReveal.tsx`, layout components).
2. `cd next-app && npm run build && npm run lint` — both must be green. Fix failures at root cause (see §6 pitfalls).
3. Confirm every route in build output is static (○ / export), no server runtime crept in.

### M8 — Full verification (PENDING)
Run the protocol in §5. Required passes:
- **Desktop screenshots** of `/`, `/services`, `/contact`, `/resources` (+subroutes), 404 → `screenshots/`, each reviewed by the **vision subagent** (never read images yourself).
- **Mobile 390px** viewport pass on all routes (overflow, tap targets, conveyor drag, container wall stacking).
- **Reduced-motion pass:** `page.emulate_media(reduced_motion="reduce")` — all content visible, no animation.
- **WebGL-off pass:** launch without swiftshader flags (or `--disable-webgl`) — hero shows static fallback, no console errors.
- **Perf:** compare `npm run build` First Load JS per route vs `main`; three.js chunk must be lazy (not in initial bundle). Total added gzip < 250KB.
- **Cross-page transition check:** click internal nav links, confirm door wipe fires and lands correctly; confirm preloader does NOT re-fire on internal nav (sessionStorage).
- Re-fix → re-verify loop until clean. Update `tasks/lessons.md` for any corrected pattern.

### M9 — Push + report (PENDING)
- `git push -u origin redesign/immersive-2026` (Vercel preview is auth-protected — curl can't verify; human opens it logged in).
- Do NOT merge to `main`. Do NOT commit without explicit user approval.
- Report: milestone status table, build/lint output summary, bundle delta, screenshot list with vision verdicts, open issues.

## 4. File ownership map

| Visual system | Owning file(s) |
|---|---|
| Tokens, motifs, keyframes, reduced-motion | `src/app/globals.css` (single source — append, never redefine) |
| Waybill preloader | `components/motion/Preloader.tsx` |
| Stamp cursor | `components/motion/Cursor.tsx` (+ `data-cursor` attrs on interactive els) |
| Door-wipe nav transitions | `components/motion/PageTransition.tsx` |
| Count-up stats | `components/motion/Odometer.tsx` |
| Shipments ticker | `components/motion/LiveTicker.tsx` |
| Scroll route spine + truck | `components/motion/RouteSpine.tsx` (homepage only) |
| Testimonial conveyor | `components/motion/Conveyor.tsx` + `home/TestimonialsSection.tsx` |
| Physics crates CTA | `components/motion/CratesField.tsx` + `home/CTASection.tsx` |
| 3D globe hero | `components/motion/GlobeHero.tsx` + `home/HeroSection.tsx` |
| Homepage assembly/section order | `home/HomeShell.tsx`, `app/page.tsx` |
| Container wall (services) | `services/ServiceGrid.tsx`, `app/services/page.tsx` |
| Gallery lightbox | `services/GalleryLightbox.tsx` |
| Navbar/Footer/WhatsApp float | `layout/{Navbar,Footer,WhatsAppFloat}.tsx` |
| Reveal-on-scroll primitive | `layout/ScrollReveal.tsx` (shared — changes need cross-team check) |
| Contact form/info/map | `app/contact/page.tsx` + `components/` contact pieces |
| Resources pages | `app/resources/**`, `components/resources/*` (data stays in `lib/resources.ts`) |
| 404 | `app/not-found.tsx` |

## 5. Verification protocol

```bash
cd /home/garvit/projects2/shivaay/next-app
npm run build && npm run lint          # BOTH required; build can pass while lint fails
npm run dev                            # http://localhost:5182 (pinned, strictPort)
```

Port issues: read `~/projects2/PORT-REGISTRY.md` + `ss -ltnp`; never kill 9222/46537; EADDRINUSE → find owner, don't kill.

Playwright (use cube3's install — do not npm-install playwright here):

```js
// node script run with NODE_PATH=/home/garvit/projects2/cube3/node_modules
const { chromium } = require("playwright");
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"], // WebGL in headless
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// Preloader capture: fresh context (no sessionStorage) → screenshot during first ~2s
await page.goto("http://localhost:5182/", { waitUntil: "networkidle" });
// Scroll-settle .reveal sections BEFORE shooting (else below-fold cards look missing):
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(800);
await page.screenshot({ path: "screenshots/<route>-<viewport>.png", fullPage: true });
// Google Maps iframes: wait ~5s before judging a blank map.
```

Rules: screenshots → repo-root `screenshots/` (gitignored — never `git add`). All screenshots reviewed via the **vision subagent**, never read directly. Count occurrences in server HTML with `grep -o … | wc -l` (it's one line; `grep -c` lies).

## 6. Known pitfalls (from tasks/lessons.md)

- **React 19 lint:** no synchronous `setState` in `useEffect` — use refs or adjust-during-render (`const [prev,setPrev]=useState(pathname); if(prev!==pathname){setPrev(pathname); close();}`). Recursive rAF callbacks: hold fn in `useRef` (no use-before-declare).
- Always `<Link>` / `<Image>` from next/*, never raw `<a>`/`<img>`.
- Run lint AND build after every subagent — subagents miss TS errors; verify "deleted" claims with `ls`/`git status`.
- Reveal pattern is `.js .reveal:not(.visible)` — scroll-settle before screenshots or phantom "missing content" bugs.
- Esri Light Gray Canvas tiles only; Carto watermarks keyless usage ("API KEY REQUIRED").
- Logo/SVG colors: after palette swaps grep SVGs for `fill="#FFFFFF"`/light strokes (invisible on cream); remove `brightness-*` compensation classes in the same change.
- lucide-react: named imports only — barrel imports hurt bundle (relevant to M5 icon dedup).
- Prefer `npm run build` over bare `next build`.

## 7. Rollback plan

- All work is isolated on `redesign/immersive-2026` (branched off `feat/resources-section`). `main` is untouched and deployable.
- Vercel production deploys only `main` — nothing on this branch can affect the live site. Previews are auth-protected.
- Full rollback: abandon/delete the branch. Partial rollback of a stream: `git revert <stream-commit>` or reset to `08d06b4` (known-green foundation+homepage) and redo that stream.
- If verification fails at M8, do not push; fix on-branch or roll the offending stream back.
