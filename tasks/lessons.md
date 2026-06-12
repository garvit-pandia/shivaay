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
- `react-hooks/set-state-in-effect`: Cannot call setState synchronously inside useEffect. Use refs for flags, or move state updates to event handlers (e.g., onClick on Links instead of useEffect on pathname change)
- `react-hooks/immutability`: Cannot access a variable before it is declared in the same scope. For self-referencing callbacks (like recursive requestAnimationFrame), use `useRef` to hold the function
- Always use `<Link>` from `next/link` for internal navigation, never raw `<a>` tags
- Always use `<Image>` from `next/image` instead of `<img>` — warnings now, errors in future versions

## Verification Discipline
- "Deleted" in todo.md doesn't mean actually deleted — always verify with `ls` or `git status`
- Run `npm run lint` in addition to `npm run build` — build can pass while lint fails
