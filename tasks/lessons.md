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

## Domain (Oct 2026)
- The live domain is `www.shivaaylogistics.in`; `shivaaylogistics.com` was never ours but sat in og:url, JSON-LD `url` and the README, so production advertised the wrong canonical URL. Before writing any absolute site URL, check `AGENTS.md` facts and `curl -sI` the domain — don't copy it from existing metadata.
