# Improvement Plan — `redesign/immersive-2026`

**Date:** 2026-10-05 · **Branch:** `redesign/immersive-2026` (HEAD `f64f041`)
**Method:** full branch walk — all 8 routes + 404, desktop (1440) & mobile (390), interactions
(lightbox, FAQ, flip, door-wipe, cursor), WebGL-off, reduced-motion, production build + export
inspection, live-site baseline. Evidence: `screenshots/v4-*` (gitignored), `/tmp/opencode/shots/`.
**Scope guard:** keeping the branch's hard constraints — static export, light mode only, 100 % of
existing content preserved, no dark mode, no new heavy deps.

## Where the branch stands

Green: `npm run build` → 11/11 static routes · `npm run lint` clean · no horizontal overflow at
390 px on `/`, `/services`, `/contact`, `/resources` · lightbox a11y (dialog/aria-modal/Escape/
focus-return) · FAQ accordion works · gallery + resources downloads all present (12 files) ·
preloader once/session · door wipe fires on internal nav · three.js is a lazy chunk, home only.

Current numbers (gzip, apples-to-apples with the live site):

| Metric | Live `main` | Branch |
|---|---|---|
| First-load `/` | 188.9 KB gz | 197.8 KB gz |
| First-load `/services` | — | 201.7 KB gz |
| First-load `/contact` · `/resources` | — | 193.4 · 188.1 KB gz |
| Lazy three.js chunk | none | 179.4 KB gz (home only) |

---

## P0 — Merge blocker

### 1. Services container wall is collapsed — all 12 cards render 0 px tall

**What the user sees:** the entire "What we do / all forwarding services" wall on `/services`
is a row of ~40 px colored slivers. Service names, icons, and the flip-to-detail content are
clipped out of view.

**Evidence:**
- `.container-card` `offsetHeight = 0`; Playwright `Locator.screenshot` fails with
  “element is not visible”.
- `.container-card-inner` computes `height: 0px` despite having Tailwind class `h-64` (256 px).
- Same rule is baked into the production export CSS (`out/_next/static/chunks/25qvsdz_tf8uf.css`):
  `container-card-inner{width:100%;height:100%}`.
- Injection test `.container-card{height:16rem}` instantly restores the full 12-card wall
  (`/tmp/opencode/shots/wall-after-patch.png`, `card-flipped.png` — back face + `aria-pressed`
  both correct).

**Root cause:** Tailwind v4 puts utilities in `@layer utilities`. The unlayered custom rule
`.container-card-inner { height: 100% }` (globals.css line ~996) always beats the layered `h-64`
utility regardless of specificity. Parent `.container-card` has auto height and the faces are
`position: absolute`, so `100 %` resolves to 0.

**Fix (minimal):** in `next-app/src/app/globals.css`, remove `height: 100%` from
`.container-card-inner` (let the component's `h-64` size it), or set an explicit height on
`.container-card`. While in there: add a `:focus-visible` ring for the cards (globals.css has no
`focus-visible` rules today; keyboard tabbing to the wall must show focus).

**Acceptance:** every `.container-card` `offsetHeight ≥ 256`; flip shows the waybill back;
keyboard Enter/Space flips; focus ring visible; screenshots re-taken (element shots, not
full-page stitch — see Process §1). Also add this assertion to the verification script so it
can never silently regress again.

### 2. Reduced motion leaves content invisible until scroll

**Evidence:** with `reduced_motion="reduce"`, `/` renders 16 `.reveal` elements at `opacity: 0`
before scroll; they only pop in as they intersect (spec requires “all animation off, content
fully visible”). This is the same class of specificity bug: the reduced-motion block
(`.reveal { opacity: 1; … }`, line ~182) loses to `.js .reveal:not(.visible)` (line ~172).

**Fix:** in the `prefers-reduced-motion` block use the winning selector form
(`html.js .reveal:not(.visible) { opacity: 1; transform: none; }`).

**Acceptance:** with reduce emulation, hidden-reveal count is 0 on every route without scrolling.

---

## P1 — Correctness

### 3. WebGL-off logs three.js errors before the fallback appears

`--disable-webgl` produces 3 console errors (`THREE.WebGLRenderer: A WebGL context could not be
created…`) before the static fallback (4 arcs + 5 dots) renders — the fallback itself looks fine
(`/tmp/opencode/shots/nowebgl-proper.png`). The spec's “no errors” claim doesn't hold.
**Fix:** feature-detect a WebGL context on a scratch canvas before `new THREE.WebGLRenderer()`;
skip the import/instantiation entirely when absent.

### 4. Mobile nav relies on `backdrop-filter` for legibility

`.nav-blur` = `rgba(250,248,244,0.97)` + `blur(12px)`. Where backdrop-filter is unavailable
(headless, older browsers, some low-power modes) the 3 % bleed is unblurred and faint text
shows through under the logo; measured on the scrolled mobile capture.
**Fix:** make the nav fully opaque (`#FAF8F4`) at least below `md`, keep blur as a desktop nicety.

---

## P2 — Trust, copy & consistency (mostly small, several need a client decision)

| # | Item | Action / owner |
|---|---|---|
| 5 | Promise cards say `03.1–03.3` inside “MANIFEST · 04 — PROMISE” | Renumber to `04.x` |
| 6 | Marquee: “Zero detention, most of the time” | Hedge hurts B2B trust — client copy decision |
| 7 | WhatsApp float is saturated `#25D366`, off-palette | Restyle to brand teal / lower saturation |
| 8 | 404 inherits homepage `<title>` | Give it a dedicated title (per Next 16 docs check supported mechanism for `not-found.tsx`) |
| 9 | Contact map is default Google style; rest of site uses muted Esri | Accept, or swap to a muted embed/static map |
| 10 | Coverage map clips “Ludhiana/Jalandhar” labels at the top edge | Nudge centre/zoom so the home hub label sits fully inside the frame |
| 11 | Gallery = generic Unsplash stock (port, ship, warehouse) | Ask client for 3 real operation photos — biggest trust win per byte |
| 12 | Motion density (preloader, stamp cursor) still unsigned | Client verdict — already tracked in `docs/progress.md` |
| 13 | “Trusted Service” (data) is the 4th homepage mini-card and gets the orange accent | Optional: recolor cycle so the accent lands on a stronger service; data stays untouched |

---

## P3 — Performance & micro-polish

1. **Gate the three.js load.** The 179.4 KB gz chunk fires right after hydration on `/`. Consider
   loading it on idle / when the hero is visible / on first “Drag to spin” interaction; measure
   LCP before and after. Budget note: home adds ~188 KB gz over live `main` (initial + three),
   inside the plan's 250 KB cap, but the chunk is the single biggest lever left.
2. **SplitReveal sr-only duplicate.** Headline text exists twice in the DOM (visual words are
   `aria-hidden`, plus `sr-only` plain text). Correct for screen readers; crawlers see the string
   twice. Low risk — optionally switch to an `aria-label` pattern.
3. **FAQ without JS.** Answers 2–6 are in the DOM but unopenable without JS. A tiny `<noscript>`
   style can expand all `.faq-answer` for no-JS readers.
4. **Banner landmark.** The site chrome is a bare `<nav>`; wrapping it in `<header>` gives
   assistive tech the expected `banner` landmark.

---

## Process — the part that let P0 ship

Full-page stitched screenshots produced both false blanks (promise/why sections looked empty;
they were fine) and false “fine” (the wall read as intentional strips). Two fixes:

1. **Verify geometry, not just pictures.** Add to the verification script:
   `containerCardH > 0`, `hiddenReveals === 0` under reduce, `webglErrors === 0` on the
   WebGL-off pass. Element screenshots (`locator.screenshot`) for interactive components.
2. **Update `tasks/lessons.md`** with the two patterns:
   - Tailwind v4: unlayered custom CSS beats `@layer utilities` — never pair an unlayered
     `height: 100%` with a Tailwind height utility; check with `getComputedStyle`.
   - Stitched full-page captures mask/ghost reveal content — settle scroll **and** assert DOM
     visibility before judging.

Also refresh `docs/progress.md`: mark M7 (build+lint) verified, record this plan, keep the client
inputs list (CHA license, testimonials, motion verdict, merge strategy). Note the merge-strategy
question still stands: this branch carries the 6 resources commits; decide resources-first-then-
rebase vs ship-together before any PR.

## Suggested order

1. P0 #1 wall fix + focus ring, re-verify with geometry assertions
2. P0 #2 reduced-motion selector fix
3. P1 #3 WebGL feature-detect · #4 opaque mobile nav
4. P2 batch — renumber promise cards, 404 title, map centring, WhatsApp restyle (client calls
   flagged for copy/photos/motion)
5. P3 perf gating + optional micro-polish
6. Docs: lessons.md + progress.md; fresh vision pass on the re-captured screenshots
7. Client preview → taste sign-off → merge decision

## Explicitly not doing

Dark mode · new dependencies · rebuilding sections that already pass · touching `lib/data.ts`
content (client-owned) · scroll-driven port flythrough (spec-cut).
