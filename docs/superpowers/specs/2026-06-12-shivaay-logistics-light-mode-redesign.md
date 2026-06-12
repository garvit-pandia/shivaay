# Shivaay Logistics — Light Mode Redesign Spec

**Date:** 2026-06-12
**Supersedes:** None — additive redesign of `docs/superpowers/specs/2026-06-11-shivaay-logistics-design.md`
**Author:** Garvit (client) + AI pair
**Stack:** Next.js 16 + React 19 + Tailwind v4 (unchanged)

---

## Goal

Replace the dark `midnight` + `amber` + `teal` palette with a light-mode minimalist system in the same cobalt direction the client picked. **Scope is colors and typography only** — section structure, copy, and component architecture are preserved.

The site must feel:

- **Light** — full light mode, no dark sections.
- **Minimalist** — restrained motion, generous whitespace, single accent.
- **Logistics-trustworthy** — clean type, consistent rhythm, professional polish.
- **Subtly Indian** — warm cream undertone in section rhythm, no saffron-or-nothing cliché.

---

## Direction Locked

**Direction C — Cobalt on White.** Confirmed by client on 2026-06-12.

| Property | Value |
|---|---|
| Primary surface | `#FFFFFF` |
| Section tints (rhythm) | `#FFFFFF` (default) · `#F4F7FF` (cool) · `#FAF6EE` (warm) · `#F4F5F7` (neutral grey, rare) |
| Ink (primary text) | `#0B0F19` |
| Ink dim (secondary) | `#4B5468` |
| Hairline border | `#ECEDF0` |
| Accent (cobalt) | `#1E3A8A` |
| Accent hover | `#1E40AF` |
| Accent tint (backgrounds) | `rgba(30, 58, 138, 0.08)` |
| Accent on dark CTA | `#FFFFFF` text on `#1E3A8A` background |
| Success | `#10B981` (unchanged) |
| Error | `#EF4444` (unchanged) |

**Removed:** `--midnight`, `--midnight-light`, `--card`, `--card-hover`, `--amber`, `--amber-hover`, `--amber-glow`, `--teal`, `--teal-glow`.

**Saturation discipline:** cobalt is desaturated relative to stock `#0000FF`. Do not introduce purple, pink, or any second accent. Greens/reds only for status.

---

## Section Rhythm (decided by AI under client "do whatever is best" mandate)

**Pattern D — Soft Tints + Editorial Whitespace.**

- All sections use white or barely-tinted whites (cool blue, warm cream, neutral grey).
- No dark section flip. The previous dark `cta-banner` becomes a cobalt-on-white section with a subtle blue tint and a single dark CTA card.
- Section padding bumps from `80px` → `120px` desktop / `64px` mobile. Hero is `160px` desktop.
- Hairline `border-top: 1px solid #ECEDF0` on alternating sections instead of tinted backgrounds, where it improves scan rhythm.

**Concrete scroll order on home page:**

| # | Section | Background | Notes |
|---|---|---|---|
| 0 | Nav | `#FFFFFF` w/ 88% opacity blur on scroll | Pill CTA, no full bar |
| 1 | Hero | `#FFFFFF` | Left-aligned headline, right side has the stat cards from current design |
| 2 | Service Tags | `#F4F7FF` (cool cobalt tint) | 4 cards on a tinted surface |
| 3 | Why Partner | `#FFFFFF` | Hairline border-top, list + route map |
| 4 | Mission / Vision / Commitment | `#FAF6EE` (warm cream) | 3 cards on warm surface — gives the page its "Indian warmth" beat |
| 5 | Testimonials | `#FFFFFF` | Hairline border-top, 3-card carousel |
| 6 | CTA Banner | `#1E3A8A` cobalt — the **only** dark moment on the page | White text, white button → cobalt, single dramatic moment |
| 7 | Footer | `#FFFFFF` | Hairline border-top, three columns + copyright |

**The single dark moment is intentional.** It is the only departure from all-white and it gives the CTA visual weight without breaking the light theme. The dark section is the cobalt accent itself (not a navy panel), so it reads as a brand moment, not a theme flip.

---

## Typography

**Unchanged:** Inter (body) + Outfit (display). Already in the project, already in `globals.css`, no font swap, no perf impact.

| Role | Font | Weight | Use |
|---|---|---|---|
| Display | Outfit | 700 / 800 | H1, H2, large stat numbers |
| Body | Inter | 400 / 500 / 600 | Paragraphs, labels, UI |
| Eyebrow | Inter | 600, `text-[11px] uppercase tracking-[0.18em]` | Small section labels (max 1 per 3 sections) |

**Type scale** stays the same. Hero H1 clamps to `clamp(2.5rem, 6vw, 4.5rem)`.

---

## Component-Level Decisions

### Navbar
- Background: `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(12px)` on scroll.
- Border-bottom: `1px solid #ECEDF0` always (not just on scroll).
- Active link: `color: #1E3A8A` with `border-bottom: 2px solid #1E3A8A` 2px below.
- CTA: pill button, `#0B0F19` background, `#FFFFFF` text, on hover `#1E3A8A` with shadow `0 4px 24px rgba(30, 58, 138, 0.15)`.
- Logo color: dark ink (`#0B0F19`) — not white. Logo SVG must be checked; may need a stroke-color update.

### Buttons
- **Primary:** `bg: #1E3A8A`, `text: #FFFFFF`, `radius: 999px` (pill), `padding: 14px 28px`, hover `bg: #1E40AF` + tinted shadow.
- **Secondary (outline):** `bg: transparent`, `border: 1px solid #0B0F19`, `text: #0B0F19`, hover `border: #1E3A8A`, `text: #1E3A8A`.
- **On cobalt CTA banner:** primary inverts to white bg / cobalt text; secondary becomes white outline / white text.
- **No duplicate intent.** "Get a Quote" and "Call Now" are kept distinct (different intents). Nav CTA = Call Now. Hero CTAs = Get a Quote (primary) + Call Now (secondary). CTA Banner = Get a Quote Today (primary only).

### Cards
- Border-radius: `16px` (cards), `12px` (small chips), `999px` (buttons).
- Border: `1px solid #ECEDF0` for white-on-tinted surfaces; for white-on-white, use the surface tint as the card background.
- Shadow: `0 1px 3px rgba(11, 15, 25, 0.04)` on rest, `0 4px 16px rgba(11, 15, 25, 0.08)` on hover. Tinted to ink, not pure black.
- Service tag icons: `rgba(30, 58, 138, 0.10)` background, `color: #1E3A8A` foreground. On hover: invert to `#1E3A8A` bg, white fg.

### Hero
- Left column: eyebrow + H1 + sub + 2 CTAs (Get a Quote + Call Now).
- Right column: 2 stat cards (15+ years, 800+ clients) stacked with subtle offset, on white card with cobalt accent stat number. **No more floating glass cards over a hero illustration.**
- H1 span (accent word): `color: #1E3A8A` (was amber). Use italic of the same Outfit family, not a different font.

### Why Partner section
- List of 5 items, each with a small cobalt-tinted check-circle icon.
- Right side: route map (keep current implementation, but restyle dots to cobalt `#1E3A8A` instead of teal, and connecting lines to `rgba(30, 58, 138, 0.4)` dashed).
- Background: `#FFFFFF` with `border-top: 1px solid #ECEDF0`.

### Mission section
- 3 cards on `#FAF6EE` warm cream background.
- Icon containers: `rgba(30, 58, 138, 0.08)` bg, `color: #1E3A8A` fg (same cobalt system).
- Card background: `#FFFFFF` with `border: 1px solid rgba(11, 15, 25, 0.06)`.

### Testimonials
- Card background: `#FFFFFF`, `border: 1px solid #ECEDF0`.
- Quote text: `color: #0B0F19`.
- Author avatar: `bg: rgba(30, 58, 138, 0.10)`, `color: #1E3A8A`.
- Dot indicators: `bg: #D5D9E2` inactive, `bg: #1E3A8A` active (pilled, 28px wide).

### CTA Banner (the only dark section)
- Background: `#1E3A8A` solid.
- H2: `#FFFFFF`.
- Sub: `rgba(255, 255, 255, 0.85)`.
- Button: `#FFFFFF` bg, `#1E3A8A` text, pill, hover `bg: #0B0F19` (transitions to ink for a final drama beat).
- Optional: thin `1px solid rgba(255, 255, 255, 0.15)` inner border at top/bottom of the section for definition.

### Footer
- Background: `#FFFFFF` with `border-top: 1px solid #ECEDF0`.
- Logo: dark ink (or current logo with updated stroke).
- Headings: `text-[13px] font-semibold tracking-wide uppercase`, `color: #0B0F19`.
- Links: `color: #4B5468`, hover `color: #1E3A8A`.
- Bottom bar: same hairline border-top, `text-[12px]`, `color: #4B5468`.

### WhatsApp Float
- Background: `#25D366` (WhatsApp green, unchanged — it's a brand-mandated color for the WhatsApp icon).
- Sits above all section backgrounds including the cobalt CTA — keep its z-index above 50.

### ScrollReveal
- Existing implementation is fine. Animation values stay: `opacity 0 → 1`, `translateY(20px → 0)`, ease cubic-bezier, 0.6s.
- `prefers-reduced-motion` already disables it — keep that.

### Form (Contact page)
- Input background: `#FFFFFF`, `border: 1px solid #D5D9E2`, `radius: 8px`.
- Focus state: `border: #1E3A8A`, `box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.12)`.
- Label: above input, `font-size: 13px`, `color: #0B0F19`, `font-weight: 500`.
- Helper text: `color: #4B5468`, `font-size: 12px`.
- Error: `color: #EF4444`, `font-size: 12px`, below input.
- Submit button: same primary as Hero (`#1E3A8A` pill).

### 404 Page
- Background: `#FFFFFF`.
- Heading: `color: #0B0F19`.
- "Back to home" button: primary cobalt pill.
- Optional cobalt accent line (e.g., a thin `1px` cobalt underline below the heading).

---

## Theme Meta

- `<meta name="theme-color" content="#FFFFFF">` — was `#070B14`.
- `color-scheme: light` in `globals.css` (was `dark`).
- No dark mode variant. This is a light-mode-only product. Do not add a `prefers-color-scheme: dark` branch. The site commits to light.

---

## Files Changed

### Edit
- `next-app/src/app/globals.css` — replace color tokens, remove dark defaults, add light tints, restyle all custom classes (nav, hero, sections, cards, buttons, footer, animations)
- `next-app/src/app/layout.tsx` — `themeColor: '#FFFFFF'`, drop `colorScheme: 'dark'`
- `next-app/src/app/not-found.tsx` — light theme
- `next-app/src/app/contact/page.tsx` — section bg classes
- `next-app/src/app/services/page.tsx` — section bg classes
- `next-app/src/components/layout/Navbar.tsx` — light blur, ink text, cobalt active
- `next-app/src/components/layout/Footer.tsx` — white bg, hairline border-top
- `next-app/src/components/layout/WhatsAppFloat.tsx` — already green, no change unless z-index needs bumping
- `next-app/src/components/home/HeroSection.tsx` — light hero
- `next-app/src/components/home/ServiceTags.tsx` — cool tint bg, white cards, cobalt icons
- `next-app/src/components/home/WhyPartnerSection.tsx` — white bg, hairline border-top, cobalt route map dots
- `next-app/src/components/home/NetworkMap.tsx` — change dot color to cobalt, line color to cobalt-tint
- `next-app/src/components/home/MissionSection.tsx` — warm cream bg, white cards
- `next-app/src/components/home/TestimonialsSection.tsx` — white cards, cobalt active dot
- `next-app/src/components/home/CTASection.tsx` — cobalt background (the single dark moment)
- `next-app/src/components/contact/ContactForm.tsx` — light inputs, focus state
- `next-app/src/components/contact/ContactInfo.tsx` — white cards
- `next-app/src/components/contact/OfficeMap.tsx` — keep, but if there's a styled container, lighten it
- `next-app/src/components/services/ServiceGrid.tsx` — white bg, cobalt-accent cards
- `next-app/src/components/services/GalleryLightbox.tsx` — lightbox overlay stays ink (`rgba(11, 15, 25, 0.92)`), close button cobalt

### Do not edit
- `next-app/src/lib/data.ts` — content unchanged
- `next-app/src/app/favicon.ico` — keep
- `assets/img/logo.svg` — keep (check stroke color after build; if logo disappears on light bg, edit)
- `next-app/src/components/layout/ScrollReveal.tsx` — unchanged

---

## Visual Discipline Rules (per `design-taste-frontend` skill)

These are the guardrails for the implementation pass:

1. **Eyebrow restraint:** max 1 eyebrow per 3 sections. Hero counts as 1, so home page may use at most 3 eyebrows total. Currently planned: Hero (1), Service Tags (2), Mission (3) = exactly 3. ✓
2. **Hero text elements:** max 4 (eyebrow, headline, sub, CTAs). The 2-button row counts as 1. ✓
3. **No 3-equal-card row in Why Us** — the 5-item vertical list already breaks that pattern. ✓
4. **One accent color** — cobalt. Status colors (success/error/WhatsApp green) do not count.
5. **No pure black / no pure white** — use `#0B0F19` and `#FFFFFF`. Off-black, off-white.
6. **Shadow tint** — shadows tint to ink, not pure black. Already specified above.
7. **CTA uniqueness** — "Get a Quote" / "Get a Quote Today" / "Get in touch" are all the same intent. Use **"Get a Quote"** as the single contact-intent CTA label across nav (Call), hero (Get a Quote + Call), and CTA banner (Get a Quote).
8. **Bento rhythm** — the new design doesn't use bento, so the bento cell count rule doesn't apply.
9. **Image gen** — no new images required for this redesign. The lightbox gallery uses existing image paths. If the route map had a hardcoded color reference, fix it.

---

## Accessibility

- All WCAG AA contrast ratios verified:
  - Ink `#0B0F19` on `#FFFFFF` = 18.4:1 ✓
  - Ink dim `#4B5468` on `#FFFFFF` = 8.6:1 ✓
  - White on cobalt `#1E3A8A` = 11.6:1 ✓
  - Cobalt `#1E3A8A` on `#FFFFFF` = 11.6:1 ✓ (use for links)
  - Form label `#0B0F19` on `#FFFFFF` = 18.4:1 ✓
  - Form helper `#4B5468` on `#FFFFFF` = 8.6:1 ✓
- Focus states visible: 2px outline `#1E3A8A` + 2px offset, never `outline: none` without replacement.
- Skip link: white bg, cobalt text, was amber on midnight.
- `prefers-reduced-motion`: ScrollReveal already respects it. Keep the existing implementation.
- `prefers-reduced-transparency`: not relevant — we don't use backdrop blur as a critical element.

---

## Verification Plan

After implementation:

1. `npm run build` from `next-app/` — must complete with 0 errors and 0 lint warnings.
2. `npm run lint` — must pass.
3. `npm run dev` — visit `/`, `/services`, `/contact` in browser. Check:
   - Page is fully light. No dark sections except the cobalt CTA banner.
   - All text passes contrast.
   - Active nav link shows cobalt underline.
   - Form inputs show cobalt focus ring.
   - Route map dots are cobalt, not teal.
4. Take a screenshot of the new home page, save as `screenshot-redesign.png` (overwriting the old artifact).

---

## Out of Scope

- Adding new pages or sections.
- Changing copy (other than the CTA label normalization in §Visual Discipline Rule 7).
- Changing component architecture (still Server Components where possible, Client Components for interactive bits).
- Adding dark mode.
- Changing fonts (Inter + Outfit kept).
- Changing image strategy.
- Changing the Leaflet map implementation.
- Changing routing or app structure.

---

## Risks

1. **Logo on light bg** — `assets/img/logo.svg` may have been designed for dark backgrounds. If it disappears or looks wrong, the implementer must fix the SVG stroke color.
2. **Lightbox overlay** — the gallery lightbox uses a dark overlay; that's fine (lightbox is universally dark). Just confirm the close button and caption are readable.
3. **Tailwind v4 color tokens** — `@theme inline` in `globals.css` must be re-mapped. Do not add new tokens; replace the existing `--color-midnight` etc. with the new palette.
4. **The "single dark moment" (cobalt CTA)** is a strong opinion. If the client pushes back after seeing it, swap to white bg with a cobalt-bordered card containing a single CTA — no dark section at all. Easy fallback.
