# Shivaay Logistics — Website Design Spec

**Date:** 2026-06-11
**Client:** Shivaay Logistics (Customs Broker & Logistics Facilitator)
**Contact:** Mandeep Singh, +91 88474-67790 / +91 93165-33756
**Address:** Plot No. 116, Street No. 8, Ganesh Nagar, 33 Feet Road, Near Ashiana Enclave, Mundian Kalan, Ludhiana-141015 (Pb.)

## Goal

A professional, trust-building multi-page website showcasing Shivaay Logistics' freight forwarding and customs brokerage services, driving inquiries through phone calls and a contact form.

## Pages

1. **Home** (`index.html`) — Hero, service highlights, why-us with animated route map, mission/vision/commitment, testimonials, CTA banner
2. **Services** (`services.html`) — All 12 forwarding services, fleet/network image gallery, testimonials, CTA
3. **Contact** (`contact.html`) — Contact details, inquiry form (mailto), Google Maps embed, floating WhatsApp button

## Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Midnight (primary) | `#070B14` | page background, nav, footer, dark sections |
| Midnight light | `#111827` | card backgrounds, muted sections |
| Card hover | `#1A2234` | card hover states |
| Amber (accent) | `#F59E0B` | CTAs, links, highlights, hover states, nav active indicator |
| Amber hover | `#D97706` | active/pressed states |
| Amber glow | `rgba(245,158,11,0.15)` | shadow glows on CTA hover |
| Teal (secondary) | `#0D9488` | tag card icons, route map dots, secondary highlights |
| Teal glow | `rgba(13,148,136,0.15)` | shadow glows on teal elements |
| Card bg | `#111827` | cards, form background |
| Text | `#E2E8F0` | body copy |
| Text dim | `#94A3B8` | secondary text, captions, breadcrumbs |
| Border | `rgba(148,163,184,0.12)` | dividers, input borders |
| Success | `#10B981` | success states |
| Error | `#EF4444` | validation errors |

### Typography
- **Display/Headings:** Outfit (600, 700, 800), letter-spacing -0.02em
- **Body:** Inter (400, 500, 600, 700)
- **Type scale:** 12/14/16/18/20/24/32/40/48/56/72, with `clamp()` for responsive sizing
- **Line-height:** 1.15 headings, 1.6 body
- **Text balance:** `text-wrap: balance` on headings

### Spacing & Layout
- Container: 1280px max-width with 24px padding
- Section padding: 80px 24px (64px on mobile)
- Spacing scale: 4 8 12 16 20 24 28 32 40 48 64 80 96
- Breakpoints: 375 / 480 / 640 / 768 / 1024 / 1280

### z-index scale
- 10: elevated cards
- 20: sticky navbar
- 30: dropdown/mobile menu
- 50: overlay/lightbox
- 100: toasts/notifications
- 200: skip-to-content link

## Signature Elements

1. **Animated route map** — SVG world map with pulsing orange dots at 5 service cities (Ludhiana, Amritsar, Delhi, Mumbai, Mundra), connected by animated dashed lines
2. **Diagonal section dividers** — SVG clip-paths echoing the brand flyer's angled cut aesthetic
3. **The loading pulse** — consistent orange pulse animation for all async states

## Tech Stack

- Static HTML + custom CSS + vanilla JS (no build step, no frameworks)
- Google Fonts: Outfit + Inter with `display=swap`
- Lucide icons v0.468 via CDN (`unpkg.com/lucide@0.468.0`)
- No framework dependencies
- Dark-mode-first design with `color-scheme: dark`

## Performance Strategy

- font-display: swap, preload critical subset
- Images: loading="lazy", explicit width/height
- JS: loaded with defer
- No render-blocking resources above the fold

## Accessibility

- Focus-visible: 2px orange ring, 2px offset
- All text ≥ 4.5:1 contrast
- Semantic HTML throughout
- ARIA labels on icon-only buttons
- Form labels always visible
- skip-to-content link
- prefers-reduced-motion respected
- Full keyboard navigation

## Content Notes

- 3 generated testimonials with realistic Indian business names
- 6 Unsplash placeholder images for fleet gallery
- Service descriptions match the brand flyer
