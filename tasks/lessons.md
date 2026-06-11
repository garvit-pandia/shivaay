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
