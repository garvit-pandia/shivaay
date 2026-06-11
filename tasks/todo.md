# Shivaay Logistics — Next.js Conversion Plan

## Goal
Convert vanilla HTML/CSS/JS logistics website into Next.js 16 with real interactive Leaflet map. Preserve all original content and dark theme.

## Status
**All phases complete.** Builds and serves all routes.

---

## Review Results

All 28 issues from code review addressed across 7 phases:

### Phase 1 — Content Accuracy (C2, C3, C4, M2) ✅
- Split `homepageServices` (4 cards) from full `services` (12) in data.ts
- Updated ServiceTags to use correct array
- Fixed CTASection to accept props
- Removed duplicate CTA from contact page

### Phase 2 — Critical Bugs (C1, H7) ✅
- Fixed ScrollReveal re-observation on client nav (usePathname)
- Deleted dead `app/actions/contact.ts`

### Phase 3 — Accessibility (H1, H2, L3, L4) ✅
- H1: Added skip link to root layout
- H2: Lightbox has Escape key, focus trap, role="dialog", aria-modal, focus restoration
- L3: TestimonialsSection has role="region", aria-label, tabIndex
- L4: prefers-reduced-motion disables reveals, lightbox, marker pulse

### Phase 4 — Performance (H3, H4, H5, M6, M8) ✅
- H3: Split ServiceGrid (server) + GalleryLightbox (client) — reduces JS bundle
- H4/H5: Named imports for lucide-react icons, remotePatterns in next.config
- M6: Changed barrel `import * as Icons` to named imports
- M8: `scrollWheelZoom={false}` on map

### Phase 5 — SEO (M3, M4, L8) ✅
- M3: JSON-LD LocalBusiness structured data on home page
- M4: twitter:card added to layout metadata
- L8: Added openGraph + twitter to services and contact pages

### Phase 6 — Polish (M1, M5, H6, M9, L2, L6, L7) ✅
- M1: Added `.divider-up` CSS class (mirrors `.divider-down`)
- M5: Added not-found.tsx dark 404 page
- H6: Fixed duplicate/conflicting IDs (btn-primary, btn-white)
- M9: Added honeypot hidden field to contact form
- L2: Memoized divIcon in CityMarkers with useMemo
- L6: Changed lg:grid-cols-4 → lg:grid-cols-3 (matches original)
- L7: Added `border-l-[3px] border-l-teal` to service cards

### Phase 7 — Build Verification ✅
- Build: 0 errors, 4 routes static, 4.4s compile
- curl: 200 / 200 /services 200 /contact 404 /nonexistent
