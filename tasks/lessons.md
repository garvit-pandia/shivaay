# Lessons Learned

## Code Review Pattern
- When a review says "named imports" for lucide-react, check that the import actually includes `useMemo` when adding `useMemo` calls
- Barrel imports (`import * as Icons`) create a single-entry pattern that's correctly identified by code review — worth fixing for bundle size

## Build Pattern
- Always run the build after any subagent completes work — subagents can miss TypeScript errors
- Use `npm run build` not `next build` directly (easier to be correct about the path)

## Component Splitting
- Server/Client split: keep data-fetching/rendering in server, interactivity in client
- GalleryLightbox pattern: export separate client component, keep service grid server-only

## Accessibility Checklist
- Lightbox: Escape key, focus trap, role="dialog", aria-modal, focus restoration (5 items)
- Skip link must be first focusable element, visible on focus
- prefers-reduced-motion needs explicit rules for reveal animations

## React 19 / Next.js 16 Lint Rules
- `react-hooks/set-state-in-effect`: Cannot call setState synchronously inside useEffect. Use refs for flags, or move state updates to event handlers (e.g., onClick on Links instead of useEffect on pathname change). To close menus on route change without an effect, use the adjust-during-render pattern (`const [prev, setPrev] = useState(pathname); if (prev !== pathname) { setPrev(pathname); closeMenus(); }`)
- `react-hooks/immutability`: Cannot access a variable before it is declared in the same scope. For self-referencing callbacks (like recursive requestAnimationFrame), use `useRef` to hold the function
- Always use `<Link>` from `next/link` for internal navigation, never raw `<a>` tags
- Always use `<Image>` from `next/image` instead of `<img>` — warnings now, errors in future versions

## Verification Discipline
- "Deleted" in todo.md doesn't mean actually deleted — always verify with `ls` or `git status`
- Run `npm run lint` in addition to `npm run build` — build can pass while lint fails

## Visual Redesign Patterns
- Logo SVGs need explicit verification after dark→light redesigns. A logo designed for a dark background typically uses white fills + light strokes that become invisible on white. Always grep the SVG for `fill="#FFFFFF"` and `stroke="..."` color values during color-scheme swaps.
- `brightness-110` and similar image filters were applied to compensate for dark-background logos. They become harmful on light backgrounds. Remove them in the same commit as the SVG fix.
- 3-subagent parallel verification (build / spec-compliance / visual-screenshot) catches blind spots in one pass. The logo issue was flagged independently by both the spec reviewer and the visual reviewer.

## Screenshot Hygiene
- Save all screenshot artifacts to `screenshots/` at the project root, never to the root directly
- `screenshots/` is gitignored — do not `git add` screenshots unless explicitly asked

## Workflow
- Brainstorming skill produces good results even with one "do whatever is best" mandate — pick the simplest defensible option, write the spec, commit, proceed.
- Subagent-driven implementation works well for mechanical class-name swaps across many files. Dispatch one subagent with the full plan + spec + foundation CSS context, let it commit per-task, then run parallel verification.

## Git & Deploy
- Fresh clones may have no git identity — check `git config user.email` before the first commit and set repo-local `user.name`/`user.email` to match the existing commit author (`git log -1 --format='%an <%ae>'`).
- Vercel preview deployments are **publicly accessible** as of Oct 2026 — Vercel Authentication was disabled at the project level so the client can review without a Vercel account. Previews CAN now be verified with `curl` (expect 200, not 302 → `vercel.com/sso-api`). If auth is ever re-enabled, this reverts and they must be verified locally instead.

## External Services
- Tile providers can change policy without notice: Carto began returning "API KEY REQUIRED" watermarked placeholder tiles for keyless usage (Oct 2026) — the coverage map broke with no code change. Swapped to Esri Light Gray Canvas (Base + Reference overlay, keyless). If a map goes blank/watermarked, verify the provider response and swap the `TileLayer` URL rather than debugging the app.

## Verification Tooling
- Server-rendered HTML arrives as one long line: `grep -c` counts matching *lines* (always 1). Use `grep -o … | wc -l` for occurrence counts.
- Scroll-reveal pages must be scrolled through and settled before screenshots, or below-fold `.reveal` cards appear missing (phantom bugs).
- Google Maps iframes need several seconds to load tiles in headless browsers; a blank map early on is not proof of failure.
- Stitched `fullPage: true` captures are not evidence either way: on reveal-heavy pages they produced phantom blanks (sections looked empty but were fine) and phantom "fine" (a 0px wall looked like an intentional strip design). Element screenshots + DOM geometry assertions (`offsetHeight`, computed `opacity`) are the source of truth.
- Playwright `.focus()` does not trigger `:focus-visible` — test focus rings with real `keyboard.press('Tab')` before declaring them broken.

## Living-Yard Hero (Oct 2026)
- `overflow-x: hidden` on `body` creates a scroll container that breaks `position: sticky` descendants — use `overflow-x: clip` instead.
- A top-level `import "three"` in a lib module reachable from an eager client component pulls three.js into the initial bundle (found: 100 KB gz leak via `hero-poses.ts` ← `useHeroProgress`). Keep pure helpers in a three-free module (`hero-ease.ts`); verify with `grep` for three markers across the exported HTML's initial scripts.
- Dev-server staleness on WSL2 is real: `curl` the served CSS chunk for a new class before doubting code; if stale, `rm -rf .next` + restart beats repeated edits. Production verification always runs against a fresh `out/` export on :5299.
- Node 22 runs TypeScript tests directly (`node --experimental-strip-types --test`), but imports need explicit `.ts` extensions and `tsconfig` needs `allowImportingTsExtensions` + `tests` excluded.
- rAF timestamps can run *behind* `performance.now()`: clamp loop `dt` at 0 and clamp driven values into range, or one bad frame throws curve sampling.
- Truncated pyramid legs need splayed A-frames + cross-braces to read at diorama scale; flat dark steel (`#1E1B18`) pops against teal stacks.
- Pointer-events choreography for canvas-under-copy: wrapper `pointer-events: none`, text block `pointer-events: auto` — keeps text selectable while the yard stays hoverable.
- Screenshot timing: captures taken during the 2.75 s preloader show doors, not the hero — wait it out (or assert DOM state, not pixels) for fallback evidence shots.

## Immersive Redesign (Oct 2026)
- `style={{ background: color }}` shorthand wipes `background-image` from motif classes (`.corrugated`) — always use `backgroundColor` longhand when combining inline color with class textures.
- `Math.random()` in a `useState` initializer causes SSR/client hydration mismatch (dev "N issues" badge) — use a seeded PRNG (mulberry32) for initial values; effect-internal randomness is fine.
- Playwright `fullPage: true` screenshots defeat scroll-reveal animations (below-fold `.reveal` cards shoot invisible) — use scroll-settle loops + viewport shots per section.
- Preloader capture needs a FRESH browser context (sessionStorage `sl-seen` skips it on repeat) and sub-1.5s timing, or you shoot the hero and think the preloader is broken.
- Headless WebGL needs `--enable-unsafe-swiftshader --use-angle=swiftshader` flags, else three.js canvases mount at 0 size and look like code bugs.
- `mask-image` with data-URI turbulence SVG can render elements fully transparent in Chromium — dropped it for the stamp badge rather than debugging the filter.
- Tailwind v4 cascade layers: unlayered author CSS (e.g. `.mono-label { font-size }`) OVERRIDES `text-*` utilities — put component defaults in `@layer components` so utilities still win.
- The nastier variant of that collision: unlayered `height: 100%` on a child beats the Tailwind height utility on the SAME element — `.container-card-inner`'s `h-64` lost, and with absolutely-positioned faces the whole services wall rendered 0px tall. Put sizing on the parent (`height: 16rem`) or in `@layer components`; geometry checks (`offsetHeight`), not screenshots, catch this.
- Reduced-motion overrides must repeat the hiding rule's specificity: `.reveal { opacity: 1 }` lost to `.js .reveal:not(.visible)`. Match it (`html.js .reveal:not(.visible)`) — same pattern for `.js .container-card:not(.dealt)`.
- Ephemeral static-export preview: `python3 -m http.server <free-51xx>` inside `next-app/out/` verifies the real production build (no dev overlay, real `.html` URLs); kill it after the run.

## Agent Tooling (Oct 2026)
- **Model capabilities change under you.** `deepseek-flash` gained native image input, but OpenCode's `~/.cache/opencode/models.json` (dated Sep 4) still said `attachment: false`, and the global `AGENTS.md` still forbade reading images directly. Verify capability empirically — a blind test image (random number + word + shape) settles it in one call — rather than trusting cached metadata or written rules.
- **Provider migrations break pinned subagent models silently.** `agent/vision.md` pinned `commandcode/deepseek-v4.1-flash`, which fails with `Invalid 'Authorization' header` after the GOAT subscription lapsed. `opencode-go/*` also fails without an active Go subscription. Check that subagent `model:` pins still resolve before relying on them.
- Screenshots are now read **directly** by the main model — no vision subagent round-trip (it returned a lossy text description, not pixels).
- **Browser automation:** `webapp-testing` skill (Python Playwright, verified installed) is the primary path for scripted/e2e work. `agent-browser` (0.27.0 + Chrome 154, installed Oct 2026) covers ad-hoc interactive clicking. The Playwright MCP was removed from `opencode.json` — it pinned `chromium-1226`, which no longer existed.
- **agent-browser usage:** load version-matched docs first with `agent-browser skills get core` — it serves them from the installed binary, so they can't go stale. Core loop: `open <url>` → `snapshot -i` for `@eN` refs → act → re-snapshot. Refs are reassigned every snapshot and go stale the moment the page changes.
- **Screenshot timing:** a capture taken right after `networkidle` catches the Preloader/door transition mid-flight (rotated card, sliced headline) and reads as broken layout. Sleep ~3-4s after load before shooting.
- Headless WebGL caveat: see `--enable-unsafe-swiftshader --use-angle=swiftshader` under Immersive Redesign — an absent GlobeHero in a headless capture is a flag issue, not a regression.

## Domain (Oct 2026)
- The live domain is `www.shivaaylogistics.in`; `shivaaylogistics.com` was never ours but sat in og:url, JSON-LD `url` and the README, so production advertised the wrong canonical URL. Before writing any absolute site URL, check `AGENTS.md` facts and `curl -sI` the domain — don't copy it from existing metadata.

## V3 Redesign (Oct 2026)
- **Never delete CSS by "start marker → next occurrence of some later marker".** Cutting from `/* Leaflet overrides */` to the first `@keyframes wipe-out` silently removed ~650 lines (stamps, waybills, corrugated, preloader/cursor `position: fixed`) because the end marker was far below. Build and lint still passed — missing CSS is not an error. Cut whole rules by exact boundaries, print what was removed, and `git diff --stat` the file (deletions should match the intended line count).
- Symptoms of missing global CSS are indirect: fixed overlays (preloader, WhatsApp, cursor) fall into normal flow and shift layout after ScrollTrigger measured → pinned sections stop short. When a pin/scrub "ends early", record body-children heights over time before blaming GSAP.
- ScrollTrigger only re-measures on load/resize. `components/motion/gsap.ts` re-measures on document-height changes (body ResizeObserver, debounced) — keep it; late layout shifts otherwise break pins.
- `python3 -m http.server` has no `cleanUrls`: `/services` is the server's 404 page (empty `<html>` class), not the app. Test `/services.html`.
- `pkill -f "<pattern>"` inside a Bash call can match its own shell's command line and kill it (exit 144). Kill by PID from `ss -ltnp`.
- Headless SwiftShader rasterises SVG on the CPU: viewBox zooms stall to ~10 fps and screenshots can time out when several browsers run at once. Trace before optimising (GPU-process time ≫ main thread = headless artifact); never run parallel Playwright passes together with `verify_hero.py` (flaky `scrub_releases`).
- Lenis' stock CSS sets `.lenis.lenis-smooth iframe { pointer-events: none }` permanently — it would kill the contact map. Use the hand-picked rules in `globals.css` (only while `.lenis-scrolling`).
- Map outlines on an Indian business site must use India's official boundaries: Natural Earth `ne_10m_admin_0_countries_ind` (India point of view), baked by `scripts/gen_india_outline.py`.
- **Never add classes imperatively to an element whose `className` React controls and changes.** React rewrites the whole attribute on re-render, wiping `.visible` (ScrollReveal) or GSAP-added flags: hovered port cards vanished, flipped service cards would have too. Drive state through `data-*`/`aria-*` attributes, or put imperative classes on a parent whose className never changes (`.container-wall.is-dealt`).
- SVG `transform-box: view-box` places the reference box at user-space (0,0), not at the viewBox's top-left: with `viewBox="-120 -120 240 240"`, `transform-origin: 50% 50%` pivots around (120,120). Use `0 0` for a centred viewBox.
- Google Maps `pb=` embed URLs carry real coordinates (`!2d<lng>!3d<lat>`) — `lib/radar.ts#parseEmbedCoords`; search-style embeds (`?q=`) don't.
- `next/font/google … queries have exactly one entry` during `next build` is a transient Google Fonts fetch / stale-cache failure, not a code error: locally `rm -rf .next` + rebuild; on Vercel a retrigger (empty commit) passed. Always check the Vercel commit status after pushing — a local green build does not guarantee the preview built (`gh api repos/garvit-pandia/shivaay/commits/<sha>/status`).
- Never give a GSAP-animated element a CSS `transform` start state: GSAP parses it into pixel `x/y` and stacks `xPercent/yPercent` on top (the transition columns stayed ~900px off-screen). Hide idle elements with visibility/autoAlpha instead. And `autoAlpha: 1` sets `visibility: inherit` — don't key CSS off `visible`.
- **Never combine CSS `scroll-behavior: smooth` with Lenis + ScrollTrigger.** ScrollTrigger records the computed value the first time it touches the scroller (before Lenis adds `html.lenis`) and writes it back *inline* after every `refresh()`, overriding any `html.lenis { scroll-behavior: auto }`. Native smooth scroll then fights Lenis on programmatic scrolls (anchors, `scrollIntoView`, tests' `scrollTo`). Diagnose with `document.documentElement.getAttribute('style')`. Also: verify against a clean-URL server (`npx serve out`) — timing differs from `python -m http.server` and hid this.
- **Don't construct Vercel branch-alias URLs from a formula and hand them to the user.** Aliases longer than 63 chars are truncated + hashed (`shivaay-git-redesign-v3-hero-f-c07be6-…`), so the guessed flapboard link 404'd. Get the alias from `vercel inspect` and `curl` it (expect 200) before reporting a link.
