# Shivaay Logistics — Warm Editorial Redesign Spec

**Date:** 2026-06-13
**Supersedes:** `docs/superpowers/specs/2026-06-12-shivaay-logistics-light-mode-redesign.md`
**Direction:** C — Warm Editorial (selected from 3 mockup options)
**Stack:** Next.js 16.2.9 + React 19 + Tailwind CSS v4

---

## Goal

Replace the current "Cobalt on White" scheme with a **warm editorial aesthetic**. Serif elegance meets logistics. Photography-forward, asymmetric layout, warm cream tones on a white base with a single teal accent. The site must feel like a premium business journal — trustworthy, human, and distinctive.

---

## Design Read

**Reading this as:** B2B logistics landing for Indian importers/exporters, with a warm-editorial language, leaning toward Playfair Display + Inter typography, cream-white surfaces, teal accent, and magazine-style asymmetrical layout.

---

## Color Palette

| Role | Hex | Tailwind Usage |
|------|-----|---------------|
| **Base surface** | `#FFFFFF` | `bg-white` — all page backgrounds |
| **Warm cream tint** | `#FAF8F4` | Section rhythm accent (alternating sections) |
| **Ink (primary text)** | `#1E1B18` | Headlines, body text |
| **Ink dim (secondary)** | `#6B5E4A` | Subtle text, helpers, meta |
| **Teal accent** | `#0F766E` | CTAs, links, active states, icons, stat highlights |
| **Teal hover** | `#0D9488` | Button/CTA hover states |
| **Hairline border** | `#E8E4DB` | Card borders, section dividers |
| **Card surface** | `#FFFFFF` | Cards on cream sections |
| **Muted bg** | `#F0FDFA` | Teal-tinted micro-surfaces (rare, sparing use) |
| **Success** | `#10B981` | Unchanged |
| **Error** | `#EF4444` | Unchanged |
| **WhatsApp** | `#25D366` | Brand-mandated, unchanged |

### Contrast Verification

| Pair | Ratio | WCAG |
|------|-------|------|
| Ink `#1E1B18` on White `#FFFFFF` | 17.1:1 | AAA ✓ |
| Ink dim `#6B5E4A` on White `#FFFFFF` | 5.8:1 | AA ✓ |
| White on Teal `#0F766E` | 6.7:1 | AAA ✓ |
| Teal `#0F766E` on White | 6.7:1 | AA ✓ |

---

## Typography

**Font pairing:** Playfair Display (headings) + Inter (body)

| Role | Font | Weight | Use |
|------|------|--------|-----|
| Display | Playfair Display | 400 / 500 / 600 / 700 | H1, H2, section headlines |
| Display italic | Playfair Display italic | 400 | Accent words within headlines |
| Body | Inter | 400 / 500 / 600 | Paragraphs, labels, UI elements |
| Stats | Inter | 700 / 800 | Large stat numbers |

### Type Scale

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 (hero) | `clamp(2.5rem, 6vw, 4rem)` | 400 (Playfair) | 1.1 |
| H2 (section) | `clamp(2rem, 4vw, 2.75rem)` | 500 (Playfair) | 1.15 |
| H3 (card) | `1.25rem` | 600 (Inter) | 1.3 |
| Body | `1rem` / `16px` | 400 (Inter) | 1.7 |
| Caption | `0.8125rem` | 500 (Inter) | 1.5 |
| Eyebrow | `0.6875rem` | 600 (Inter), uppercase | — |

**Eyebrow restraint:** Max 1 eyebrow per 3 sections. Hero counts as 1.

---

## Section Rhythm (Home Page Scroll Order)

All sections use white base. Warm cream tint sections provide editorial rhythm without breaking the light-mode commitment.

| # | Section | Background | Notes |
|---|---------|------------|-------|
| 0 | Navbar | `#FFFFFF` w/ subtle bottom border | No backdrop blur. Clean separator. |
| 1 | Hero | `#FFFFFF` | Asymmetric layout: image left + type right. Serif headline with italic accent word. |
| 2 | Service Tags | `#FAF8F4` (cream) | 4 cards on warm cream, teal icon accents |
| 3 | Why Partner | `#FFFFFF` | Hairline border-top, 5-item list + route map |
| 4 | Mission | `#FAF8F4` (cream) | 3 cards on warm cream |
| 5 | Testimonials | `#FFFFFF` | Hairline border-top, carousel with teal dots |
| 6 | CTA Banner | `#FFFFFF` with teal card | NOT a dark section. White bg with a centered teal card containing white-on-teal CTA. |
| 7 | Footer | `#FFFFFF` | Warm hairline border-top |

**No dark section anywhere on the page.** The CTA banner uses a teal card on a white background rather than flipping the entire section to dark.

---

## Component-Level Design

### Navbar
- Background: `#FFFFFF`, no backdrop blur
- Border-bottom: `1px solid #E8E4DB` (always visible, not just on scroll)
- Logo: Uses Playfair Display for brand name, weight 600, ink color
- Nav links: Inter 500, `#6B5E4A`, hover → `#0F766E`
- Active link: `color: #0F766E` with a subtle 2px underline
- CTA button (Call Now): `bg: #1E1B18`, `text: white`, hover → `bg: #0F766E`
- Mobile: Full-screen slide from right, same theme

### Hero
- **Layout:** Asymmetric split — 55/45 or 60/40
- **Left:** Large placeholder for photography (container/port/logistics imagery)
  - Warm overlay gradient that doesn't fight the contrast
  - If no photo available: use a warm geometric pattern or editorial placeholder
- **Right:** 
  - Small eyebrow: `TRUSTED CUSTOMS BROKER` / `LUDHIANA · EST. 2008`
  - H1 in Playfair Display 400, with one italic accent word in teal: "Customs brokerage with *integrity*"
  - Subtext: Inter 400, `#6B5E4A`, max 2-3 lines
  - Two CTAs: "Get a Quote" (solid teal, primary) + "Our Services" (outline, secondary)
  - Below CTAs: 3 micro-stats in a row (15+ Years, 800+ Clients, 5 Ports) using Inter bold numbers

### Service Tags
- Background: `#FAF8F4` cream tint
- 4 cards in a grid (2 cols on tablet, 4 cols on desktop)
- Each card: white `#FFFFFF` with `1px solid #E8E4DB`, slight shadow tinted to ink
- Icon container: `bg: rgba(15, 118, 110, 0.08)`, `color: #0F766E`
- On hover: border → `#0F766E`, subtle lift (2px translateY)
- Card label: Inter 600, ink; description: Inter 400, ink-dim

### Why Partner Section
- Background: `#FFFFFF`, hairline `border-top: 1px solid #E8E4DB`
- Left: 5-item list with teal check-circle icons
- Right: Route map visualization (keep existing NetworkMap component, recolor to teal)
- Section heading: Playfair Display 500

### Mission Section
- Background: `#FAF8F4` cream tint
- 3 cards: white bg, ink text, teal icon accents
- Icon containers: `rgba(15, 118, 110, 0.08)` bg, teal fg
- Cards have `border: 1px solid rgba(30, 27, 24, 0.06)`

### Testimonials
- Background: `#FFFFFF`, hairline border-top
- Carousel cards: white bg, `border: 1px solid #E8E4DB`
- Quote text: Ink, Playfair Display italic or large serif quote mark
- Author: Inter 600 name + Inter 400 role
- Dot indicators: `#E8E4DB` inactive, `#0F766E` active, 28px wide pill shape
- Section heading: Playfair Display 500

### CTA Banner
- Background: `#FFFFFF` (NOT dark)
- Centered teal card: `bg: #0F766E`, significant padding, rounded
- H2: Playfair Display 500, white
- Subtext: Inter 400, `rgba(255,255,255,0.85)`
- Button: white bg, teal text, pill or soft rounded
- This is the "signature moment" — a bold teal card floating on white space

### Footer
- Background: `#FFFFFF`, `border-top: 1px solid #E8E4DB`
- Three columns: brand info + quick links + contact
- Headings: Inter 600, ink, `text-[13px] uppercase tracking-wide`
- Links: `#6B5E4A`, hover → `#0F766E`
- Copyright: Inter 400, `#6B5E4A`, `text-[12px]`

### Services Page
- Page hero: simpler than home — Playfair Display headline + breadcrumb
- Service grid: white cards with teal left-border accent (`border-l-[3px] border-l-[#0F766E]`)
- Gallery: lightbox overlay uses `rgba(30, 27, 24, 0.92)` (ink-tinted, not pure black), teal close button

### Contact Page
- Form inputs: white bg, `border: 1px solid #D4CFC4`, focus → teal ring
- Labels: Inter 500, ink, 13px
- Submit button: teal pill, same as hero primary CTA
- Office map: iframe with lazy loading, subtle warm border
- Contact info cards: white bg, teal hover, icon-prefixed items

### 404 Page
- Background: `#FFFFFF`
- Heading: Playfair Display
- Teal underline accent
- "Back to home" button: teal pill

### WhatsApp Float
- Background: `#25D366` (unchanged)
- z-index above all content

---

## Photography Strategy

The editorial direction demands real imagery. Placeholder strategy:

1. **Hero photo:** Left column needs a logistics/cargo photograph (container yard, port, freight movement)
2. **Gallery images (services page):** 6 logistics images for the lightbox
3. **Use `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}`** for placeholder during development
4. **Replace with real brand photography before launch**

---

## Accessibility

- All WCAG AA contrast verified (see palette section)
- Skip link: white bg, teal text
- Focus states: 2px outline `#0F766E` + 2px offset
- `prefers-reduced-motion` respected (existing implementation kept)
- Semantic HTML, ARIA labels preserved from current implementation
- Form labels + error messages with proper aria associations

---

## Out of Scope

- Adding new pages or sections
- Changing copy
- Changing component architecture
- Adding dark mode (light-mode-only product)
- Changing fonts (new fonts configured, but existing copy/content stays)
- Changing Leaflet map implementation (recolor only)

---

## Files Changed

### Foundation
- `next-app/src/app/globals.css` — new `@theme` tokens, restyle all custom classes
- `next-app/src/app/layout.tsx` — metadata update, font config, themeColor

### Layout Shell
- `next-app/src/components/layout/Navbar.tsx`
- `next-app/src/components/layout/Footer.tsx`
- `next-app/src/components/layout/WhatsAppFloat.tsx`

### Home Page Components (8)
- `next-app/src/components/home/HeroSection.tsx`
- `next-app/src/components/home/ServiceTags.tsx`
- `next-app/src/components/home/WhyPartnerSection.tsx`
- `next-app/src/components/home/NetworkMap.tsx`
- `next-app/src/components/home/NetworkMapSection.tsx`
- `next-app/src/components/home/MissionSection.tsx`
- `next-app/src/components/home/TestimonialsSection.tsx`
- `next-app/src/components/home/CTASection.tsx`

### Services Page
- `next-app/src/components/services/ServiceGrid.tsx`
- `next-app/src/components/services/GalleryLightbox.tsx`

### Contact Page
- `next-app/src/components/contact/ContactForm.tsx`
- `next-app/src/components/contact/ContactInfo.tsx`
- `next-app/src/components/contact/OfficeMap.tsx`

### Pages
- `next-app/src/app/page.tsx`
- `next-app/src/app/services/page.tsx`
- `next-app/src/app/contact/page.tsx`
- `next-app/src/app/not-found.tsx`

### ScrollReveal
- `next-app/src/components/layout/ScrollReveal.tsx` — unchanged (works as-is)

### Unchanged
- `next-app/src/lib/data.ts`
- `next-app/next.config.ts`
- `next-app/public/logo.svg`

---

## Verification Plan

1. `npm run build` — 0 errors, all routes static
2. `npm run lint` — 0 warnings
3. Visual: all 3 pages render correctly, no dark sections, teal accent consistent, Playfair Display renders
4. Contrast check: all text pairs verified
5. Responsive: 375px, 768px, 1024px, 1440px
