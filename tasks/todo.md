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

---

# Light-Mode Redesign — 2026-06-12

## Goal
Replace the dark `midnight` + `amber` + `teal` palette with a light-mode minimalist cobalt-on-white design. Client feedback: "too dark, doesn't feel logistics/Indian, want light mode and minimalist." Scope: colors and typography only — section structure preserved.

## Status
**Complete.** Build clean, lint clean, visual confirmed on all 3 pages.

## Direction Locked
- **Palette**: Cobalt `#1E3A8A` accent on white base
- **Rhythm**: Soft tints (cool `#F4F7FF` for service tags, warm `#FAF6EE` for mission)
- **Single dark moment**: Cobalt CTA banner on home and contact pages
- **Typography**: Inter + Outfit (unchanged — already in project)

## Implementation

### Spec & Plan
- `docs/superpowers/specs/2026-06-12-shivaay-logistics-light-mode-redesign.md` (276 lines)
- `docs/superpowers/plans/2026-06-12-shivaay-light-mode-redesign.md` (1318 lines, 22 tasks)

### Files Changed (22)
**Foundation:**
- `next-app/src/app/globals.css` — full rewrite (164 → 164 lines, but every token + class is new)

**Layout & Shell:**
- `next-app/src/app/layout.tsx` — `themeColor: #FFFFFF`
- `next-app/src/components/layout/Navbar.tsx` — light blur, ink text, cobalt active
- `next-app/src/components/layout/Footer.tsx` — white bg + hairline border, ink text
- `next-app/src/components/layout/WhatsAppFloat.tsx` — z-index 60

**Home Page (7 components):**
- `HeroSection.tsx` — white bg, cobalt accent on stat numbers + headline span
- `ServiceTags.tsx` — cool tint section, white cards
- `WhyPartnerSection.tsx` — white bg + border-top
- `NetworkMap.tsx` + `NetworkMapSection.tsx` — cobalt markers and route lines
- `MissionSection.tsx` — warm cream section, white cards
- `TestimonialsSection.tsx` — white bg + border-top, cobalt active dot
- `CTASection.tsx` — cobalt banner (single dark moment)

**Services Page (2 components):**
- `ServiceGrid.tsx` — white cards, cobalt border-l accent
- `GalleryLightbox.tsx` — light bg, cobalt close button

**Contact Page (3 components + 1 inline CTA):**
- `ContactForm.tsx` — white inputs, cobalt focus ring
- `ContactInfo.tsx` — white cards, cobalt hover
- `OfficeMap.tsx` — light wrapper
- `contact/page.tsx` — light page + inline cobalt CTA replicating home treatment

**Page Wrappers:**
- `app/services/page.tsx` — light theme
- `app/not-found.tsx` — white 404 with cobalt underline

**Logo (correctness fix):**
- `next-app/public/logo.svg` + `assets/img/logo.svg` — amber stroke → cobalt, white text → ink, dim text → ink-dim
- Dropped `brightness-110` filter from Navbar and Footer `<Image>`

### Verification (3 subagents in parallel)
1. **Build + Lint** subagent: 0 errors, 0 warnings, 4 routes static, 5.3s compile
2. **Spec compliance** subagent: all 22 expected tokens present, section rhythm correct, exactly 1 dark section, cobalt accents in all 9 expected locations
3. **Visual** subagent: all 3 pages render correctly, cobalt CTA banner correct, form focus ring shows cobalt glow

**Critical issue caught & fixed:** Logo SVG used white text + amber stroke from the dark design. Both compliance reviewer and visual reviewer flagged it independently. Fixed in 4 files (2 SVGs + 2 component filter removals) and re-verified.

### Lessons
- Logo SVGs are a frequent blind spot in dark→light redesigns. Spec called this out as a risk and it materialized.
- 3-subagent parallel verification (build / spec / visual) caught the logo issue in one pass instead of letting it ship.

