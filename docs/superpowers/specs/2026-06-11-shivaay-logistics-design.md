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
| Navy (primary) | `#0A1F3D` | nav, footer, headings, dark sections |
| Light navy | `#1A3559` | card hovers, secondary surfaces |
| Orange (accent) | `#F26B1F` | CTAs, links, highlights, hover states |
| Orange hover | `#D45A18` | active/pressed states |
| Background | `#F8FAFC` | page background |
| Card | `#FFFFFF` | cards, form background |
| Body text | `#0F172A` | headings, body copy |
| Muted text | `#64748B` | secondary text, captions |
| Border | `#E2E8F0` | dividers, input borders|
| Success | `#059669` | success states |
| Error | `#DC2626` | validation errors |

### Typography
- **Display/Headings:** Outfit (600, 700, 800)
- **Body:** Inter (400, 500, 600)
- **Type scale:** 12/14/16/18/20/24/32/40/48/56/72
- **Line-height:** 1.15 headings, 1.6 body

### Spacing & Layout
- Container: `max-w-7xl` mx-auto
- Section padding: `py-16 md:py-24`
- Spacing scale: 4 8 12 16 20 24 32 40 48 64 80 96
- Breakpoints: 375 / 640 / 768 / 1024 / 1280

### z-index scale
- 10: elevated cards
- 20: sticky navbar
- 30: dropdown/megamenu
- 50: overlay/lightbox
- 100: toasts/notifications

## Signature Elements

1. **Animated route map** — SVG world map with pulsing orange dots at 5 service cities (Ludhiana, Amritsar, Delhi, Mumbai, Mundra), connected by animated dashed lines
2. **Diagonal section dividers** — SVG clip-paths echoing the brand flyer's angled cut aesthetic
3. **The loading pulse** — consistent orange pulse animation for all async states

## Tech Stack

- Static HTML + Tailwind CSS CDN + vanilla JS (no build step)
- Google Fonts: Outfit + Inter with `display=swap`
- Lucide icons via CDN
- No framework dependencies

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
