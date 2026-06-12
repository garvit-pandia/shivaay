# Shivaay Logistics Light-Mode Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark `midnight` + `amber` + `teal` palette with a light-mode minimalist cobalt-on-white design across the entire Next.js site (home, services, contact, 404). Preserve all copy, components, and section structure.

**Architecture:** Single-pass design token swap. Re-map Tailwind v4 `@theme` color tokens in `globals.css`, then update class names and inline color references in each component. No new components, no new pages, no architectural changes. Section rhythm changes from dark/midnight flip to white/tint rhythm with a single dark cobalt CTA moment.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript, lucide-react icons. No new dependencies.

**Reference spec:** `docs/superpowers/specs/2026-06-12-shivaay-logistics-light-mode-redesign.md`

---

## Color Token Map (reference for all tasks)

| Old token | Old value | New token | New value |
|---|---|---|---|
| `--color-midnight` | `#070b14` | `--color-ink` | `#0B0F19` |
| `--color-midnight-light` | `#111827` | `--color-surface-card` | `#FFFFFF` |
| `--color-card` | `#111827` | (same as above) | `#FFFFFF` |
| `--color-card-hover` | `#1a2234` | `--color-surface-card-hover` | `#F4F7FF` |
| `--color-amber` | `#f59e0b` | `--color-cobalt` | `#1E3A8A` |
| `--color-amber-hover` | `#d97706` | `--color-cobalt-hover` | `#1E40AF` |
| `--color-teal` | `#0d9488` | (removed — replaced by cobalt) | — |
| `--color-teal-glow` | `rgba(13, 148, 136, 0.15)` | (removed) | — |
| `--color-text` | `#e2e8f0` | `--color-ink` | `#0B0F19` |
| `--color-text-dim` | `#94a3b8` | `--color-ink-dim` | `#4B5468` |
| `--color-border` | `rgba(148, 163, 184, 0.12)` | `--color-border` | `#ECEDF0` |
| `--color-border-light` | `rgba(148, 163, 184, 0.2)` | `--color-border-light` | `#D5D9E2` |
| `--color-success` | `#10b981` | (unchanged) | `#10b981` |
| `--color-error` | `#ef4444` | (unchanged) | `#ef4444` |

**New tokens to add:**
- `--color-tint-cool: #F4F7FF`
- `--color-tint-warm: #FAF6EE`
- `--color-tint-neutral: #F4F5F7`
- `--color-amber-glow: rgba(245, 158, 11, 0.15)` — not used in new design, omit

---

## Task Dependencies

```
Task 1 (globals.css) ─┬─ Task 2 (layout.tsx) ─────────────────────────────┐
                      ├─ Task 3 (Navbar)  ─── parallel ──┐                │
                      ├─ Task 4 (Footer)  ─── parallel ──┤                │
                      ├─ Task 5 (WhatsAppFloat)          │                │
                      ├─ Task 6 (HeroSection)  ─ parallel ─┐              │
                      ├─ Task 7 (ServiceTags)  ─ parallel ─┤              │
                      ├─ Task 8 (WhyPartnerSection)       │              │
                      ├─ Task 9 (NetworkMap)               │  HOME        │
                      ├─ Task 10 (MissionSection)         │              │
                      ├─ Task 11 (TestimonialsSection)    │              │
                      ├─ Task 12 (CTASection)             │              │
                      ├─ Task 13 (ServiceGrid)  ─ parallel ├─ SERVICES   │
                      ├─ Task 14 (GalleryLightbox)        │              │
                      ├─ Task 15 (ContactForm)  ─ parallel ├─ CONTACT    │
                      ├─ Task 16 (ContactInfo)            │              │
                      ├─ Task 17 (OfficeMap)              │              │
                      ├─ Task 18 (home page.tsx)          │              │
                      ├─ Task 19 (services/page.tsx)      │              │
                      ├─ Task 20 (contact/page.tsx)       │              │
                      └─ Task 21 (not-found.tsx)          │              │
                                                          │              │
                                            Task 22: VERIFY ← ───────────┘
```

Tasks 3-21 can run in parallel after Task 1. Task 22 runs last.

---

## Task 1: Rewrite globals.css (foundation)

**Files:**
- Modify: `next-app/src/app/globals.css` (full rewrite, 492 lines → ~480 lines)

**Why first:** Every component reads tokens from this file. All other tasks depend on the new tokens existing.

- [ ] **Step 1: Replace the entire `globals.css` with the light-mode version**

Replace the file contents with the following (preserve imports, theme block, scroll reveal, lightbox, WhatsApp, gallery, reduced-motion, and leaflet overrides — only swap colors):

```css
@import "tailwindcss";

@theme inline {
  --color-ink: #0B0F19;
  --color-ink-dim: #4B5468;
  --color-surface: #FFFFFF;
  --color-surface-card: #FFFFFF;
  --color-surface-card-hover: #F4F7FF;
  --color-tint-cool: #F4F7FF;
  --color-tint-warm: #FAF6EE;
  --color-tint-neutral: #F4F5F7;
  --color-cobalt: #1E3A8A;
  --color-cobalt-hover: #1E40AF;
  --color-cobalt-tint: rgba(30, 58, 138, 0.10);
  --color-cobalt-tint-strong: rgba(30, 58, 138, 0.15);
  --color-border: #ECEDF0;
  --color-border-light: #D5D9E2;
  --color-success: #10b981;
  --color-error: #ef4444;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
}

/* ---- Base ---- */
html {
  scroll-behavior: smooth;
  color-scheme: light;
}

body {
  background: #FFFFFF;
  color: #0B0F19;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---- Utility ---- */
.font-display {
  font-family: var(--font-display);
}

/* ---- Skip Link ---- */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  background: #1E3A8A;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 999px;
  z-index: 200;
  font-weight: 600;
  transition: top 0.2s;
  text-decoration: none;
}
.skip-link:focus {
  top: 8px;
}

/* ---- Navbar ---- */
.nav-blur {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #ECEDF0;
}

/* ---- Buttons ---- */
.btn-primary {
  background: #1E3A8A;
  color: #FFFFFF;
  font-weight: 600;
  border-radius: 999px;
  transition: background-color 0.2s, box-shadow 0.2s;
  padding: 12px 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover {
  background: #1E40AF;
  box-shadow: 0 4px 24px rgba(30, 58, 138, 0.18);
}

.btn-outline {
  border: 1px solid #0B0F19;
  color: #0B0F19;
  font-weight: 600;
  border-radius: 999px;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
  padding: 12px 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
}
.btn-outline:hover {
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.btn-white {
  background: #FFFFFF;
  color: #1E3A8A;
  font-weight: 700;
  border-radius: 999px;
  transition: background-color 0.2s, color 0.2s;
  padding: 14px 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-white:hover {
  background: #0B0F19;
  color: #FFFFFF;
}

.btn-on-cobalt {
  background: #FFFFFF;
  color: #1E3A8A;
  font-weight: 700;
  border-radius: 999px;
  transition: background-color 0.2s, color 0.2s;
  padding: 14px 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-on-cobalt:hover {
  background: #0B0F19;
  color: #FFFFFF;
}

/* ---- Section Dividers ---- */
.divider-down {
  position: relative;
}
.divider-down::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #ECEDF0, transparent);
}

.divider-up {
  position: relative;
}
.divider-up::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #ECEDF0, transparent);
}

/* ---- Hero glow (subtle on light) ---- */
.hero-glow {
  background:
    radial-gradient(ellipse 800px 600px at 80% 30%, rgba(30, 58, 138, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 600px 500px at 20% 80%, rgba(30, 58, 138, 0.03) 0%, transparent 60%);
  pointer-events: none;
}

/* ---- Card hover (light variant) ---- */
.card-hover {
  transition: border-color 0.25s, background-color 0.25s, transform 0.25s;
}
.card-hover:hover {
  border-color: rgba(30, 58, 138, 0.25);
  background: #F4F7FF;
}

/* ---- Scroll reveal ---- */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---- Leaflet overrides (light map) ---- */
.leaflet-container {
  background: #F4F5F7 !important;
  font-family: var(--font-sans) !important;
}

.leaflet-popup-content-wrapper {
  background: #FFFFFF !important;
  color: #0B0F19 !important;
  border: 1px solid #ECEDF0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(11, 15, 25, 0.12) !important;
}
.leaflet-popup-tip {
  background: #FFFFFF !important;
}
.leaflet-popup-close-button {
  color: #4B5468 !important;
}

.leaflet-tooltip {
  background: #FFFFFF !important;
  color: #0B0F19 !important;
  border: 1px solid #ECEDF0 !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-size: 0.85rem !important;
  box-shadow: 0 4px 16px rgba(11, 15, 25, 0.08) !important;
}
.leaflet-tooltip::before {
  border-top-color: #FFFFFF !important;
}

/* ---- Map marker animation (cobalt) ---- */
.map-marker-icon {
  background: transparent !important;
  border: none !important;
}
.map-marker-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1E3A8A;
  box-shadow: 0 0 12px rgba(30, 58, 138, 0.5), 0 0 4px rgba(30, 58, 138, 0.3);
  animation: marker-pulse 2s ease-in-out infinite;
}
.map-marker-hub .map-marker-inner {
  background: #1E3A8A;
  box-shadow: 0 0 18px rgba(30, 58, 138, 0.6), 0 0 8px rgba(30, 58, 138, 0.4);
  animation: marker-pulse-hub 2s ease-in-out infinite;
}

@keyframes marker-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
@keyframes marker-pulse-hub {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .map-marker-inner,
  .map-marker-hub .map-marker-inner {
    animation: none;
  }
  .reveal,
  .reveal.visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .lightbox {
    transition: none;
  }
}

/* ---- Map legend (light) ---- */
.map-legend {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #ECEDF0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.8rem;
  color: #4B5468;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 12px rgba(11, 15, 25, 0.06);
}
.map-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.map-legend-hub {
  background: #1E3A8A;
  box-shadow: 0 0 8px rgba(30, 58, 138, 0.4);
}
.map-legend-city {
  background: #1E3A8A;
  box-shadow: 0 0 6px rgba(30, 58, 138, 0.3);
}
.map-legend-line {
  width: 18px;
  height: 2px;
  background: repeating-linear-gradient(90deg, #1E3A8A 0 8px, transparent 8px 14px);
  opacity: 0.6;
}

/* ---- Map popup ---- */
.map-popup {
  padding: 4px 0;
}
.map-popup h4 {
  margin: 0 0 2px;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: #0B0F19;
}
.map-popup-tag {
  font-size: 0.75rem;
  color: #1E3A8A;
  font-weight: 600;
}
.map-popup-services {
  margin: 8px 0 0;
  padding: 0 0 0 16px;
  font-size: 0.82rem;
  color: #4B5468;
}
.map-popup-services li {
  margin-bottom: 2px;
}

/* ---- Tooltip tag ---- */
.map-tooltip-tag {
  font-size: 0.72rem;
  color: #1E3A8A;
  font-weight: 600;
}

/* ---- Service card icon ---- */
.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(30, 58, 138, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E3A8A;
  margin-bottom: 12px;
  transition: background-color 0.2s, color 0.2s;
}
.service-icon:hover {
  background: #1E3A8A;
  color: #FFFFFF;
}

/* ---- Why-us check ---- */
.why-us-check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(30, 58, 138, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E3A8A;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ---- Mission card icon ---- */
.mission-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(30, 58, 138, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E3A8A;
  margin-bottom: 16px;
}

/* ---- Testimonials ---- */
.testimonial-scroll {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.testimonial-card {
  scroll-snap-align: start;
  flex-shrink: 0;
  background: #FFFFFF;
  border: 1px solid #ECEDF0;
  border-radius: 16px;
  padding: 24px;
  min-width: 300px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(11, 15, 25, 0.04);
}
.testimonial-quote {
  font-size: 0.9rem;
  color: #4B5468;
  line-height: 1.7;
  margin: 0;
}
.testimonial-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(30, 58, 138, 0.10);
  color: #1E3A8A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.testimonial-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #0B0F19;
}
.testimonial-role {
  font-size: 0.78rem;
  color: #4B5468;
}

/* ---- Contact form ---- */
.form-input {
  background: #FFFFFF;
  border: 1px solid #D5D9E2;
  border-radius: 8px;
  color: #0B0F19;
  padding: 10px 14px;
  font-size: 0.95rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: #1E3A8A;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15);
}
.form-input::placeholder {
  color: #8A93A6;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #0B0F19;
  margin-bottom: 6px;
}
.form-helper {
  font-size: 12px;
  color: #4B5468;
  margin-top: 4px;
}
.form-error {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}

/* ---- Lightbox (overlay stays dark — universally expected) ---- */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(11, 15, 25, 0.92);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.lightbox.open {
  opacity: 1;
  pointer-events: auto;
}
.lightbox img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
}

/* ---- WhatsApp float (keep green) ---- */
.whatsapp-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  z-index: 60;
  transition: transform 0.2s, box-shadow 0.2s;
}
.whatsapp-float:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(37, 211, 102, 0.55);
}
.whatsapp-float svg {
  width: 26px;
  height: 26px;
}

/* ---- Gallery grid ---- */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.gallery-item {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
  border: 1px solid #ECEDF0;
  transition: border-color 0.2s, transform 0.2s;
  background: #F4F5F7;
}
.gallery-item:hover {
  border-color: rgba(30, 58, 138, 0.4);
  transform: scale(1.02);
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd next-app && npx tailwindcss --help 2>&1 | head -3`
Expected: Tailwind CLI responds. (We're not actually running a build, just confirming the syntax of `@theme` is parseable.)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/globals.css
git commit -m "style: rewrite globals.css with light-mode cobalt palette"
```

---

## Task 2: Update layout.tsx (theme meta)

**Files:**
- Modify: `next-app/src/app/layout.tsx`

- [ ] **Step 1: Read the current file and update metadata**

Read `next-app/src/app/layout.tsx`. Change:
- `themeColor: '#070B14'` → `themeColor: '#FFFFFF'`
- Remove `colorScheme: 'dark'` (or set to `'light'`)
- Update `<html lang="en">` if needed (no change required)

Find the `metadata` export and update the `themeColor` line. If `colorScheme` exists, set it to `'light'` or remove it.

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/layout.tsx
git commit -m "style: switch theme color to light"
```

---

## Task 3: Update Navbar

**Files:**
- Modify: `next-app/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/layout/Navbar.tsx`. Identify all class names and inline styles that reference midnight/amber/teal colors.

- [ ] **Step 2: Swap color classes**

Apply these replacements to the file:

| Old | New |
|---|---|
| `text-white` (in nav text) | `text-[#0B0F19]` |
| `text-[var(--text-dim)]` | `text-[#4B5468]` |
| `text-amber` / `text-[var(--amber)]` (active link) | `text-[#1E3A8A]` |
| `bg-amber` / `bg-[var(--amber)]` (CTA) | `bg-[#1E3A8A]` |
| `hover:text-amber` / `hover:text-[var(--amber)]` | `hover:text-[#1E3A8A]` |
| `border-amber` | `border-[#1E3A8A]` |
| `bg-midnight` / `bg-[#070B14]` (nav bg) | `bg-white/88` with `backdrop-blur` (use `.nav-blur` class) |
| Nav background via inline style `rgba(7,11,20,0.88)` | Use `.nav-blur` class instead |

Also: the active link underline (if any) changes from amber to cobalt. If using `border-b-2 border-amber`, change to `border-b-2 border-[#1E3A8A]`.

- [ ] **Step 3: Verify in browser (visual check is OK, no test)**

After Task 22 runs end-to-end, you will see this in the screenshot.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/components/layout/Navbar.tsx
git commit -m "style: navbar light theme with cobalt active state"
```

---

## Task 4: Update Footer

**Files:**
- Modify: `next-app/src/components/layout/Footer.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/layout/Footer.tsx`.

- [ ] **Step 2: Swap color classes**

Apply these replacements:

| Old | New |
|---|---|
| `bg-[var(--midnight)]` (footer bg) | `bg-white border-t border-[#ECEDF0]` |
| `bg-[#070B14]` | `bg-white` |
| `text-white` (headings, brand) | `text-[#0B0F19]` |
| `text-[var(--text-dim)]` | `text-[#4B5468]` |
| `text-[#94A3B8]` | `text-[#4B5468]` |
| `text-[var(--text)]` (body copy) | `text-[#4B5468]` |
| `text-[var(--text-dim)]` hover amber | `hover:text-[#1E3A8A]` |
| `border-[var(--border)]` | `border-[#ECEDF0]` |
| `bg-[var(--border-light)]` (bottom strip) | `bg-[#F4F5F7]` or `border-t border-[#ECEDF0]` |
| `text-[var(--amber)]` | `text-[#1E3A8A]` |

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/layout/Footer.tsx
git commit -m "style: footer light theme"
```

---

## Task 5: Update WhatsAppFloat

**Files:**
- Modify: `next-app/src/components/layout/WhatsAppFloat.tsx`

- [ ] **Step 1: Verify z-index change**

Read `next-app/src/components/layout/WhatsAppFloat.tsx`. The component uses inline styles or class names.

- [ ] **Step 2: Bump z-index to sit above cobalt CTA**

The cobalt CTA banner has white text and the WhatsApp button needs to be visible against cobalt. The current z-index is `50` — bump to `60` to ensure it stacks above the new cobalt banner content.

If the component uses `className="whatsapp-float"` (defined in globals.css), the CSS has already been updated in Task 1. No JSX change needed.

If it uses inline styles, ensure `zIndex: 60`.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/layout/WhatsAppFloat.tsx
git commit -m "style: bump WhatsApp float z-index above cobalt CTA"
```

---

## Task 6: Update HeroSection

**Files:**
- Modify: `next-app/src/components/home/HeroSection.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/HeroSection.tsx`.

- [ ] **Step 2: Swap color classes**

| Old | New |
|---|---|
| Section background dark | `bg-white` (or use `.hero-glow` for subtle tint) |
| H1 text | `text-[#0B0F19]` |
| H1 accent span (was `text-amber` / `text-[var(--amber)]`) | `text-[#1E3A8A]` (italic) |
| Hero tag (was `bg-teal-tint` `text-teal`) | `bg-[rgba(30,58,138,0.10)]` `text-[#1E3A8A]` |
| Hero sub paragraph | `text-[#4B5468]` |
| Hero stat cards (was `bg-white/3` `border-white/8`) | `bg-white border border-[#ECEDF0] shadow-[0_1px_3px_rgba(11,15,25,0.04)]` |
| Hero stat number (was `text-amber`) | `text-[#1E3A8A]` |
| Hero stat label | `text-[#4B5468]` |
| Primary CTA | `btn-primary` (already updated in CSS) |
| Secondary CTA | `btn-outline` (already updated) |

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/HeroSection.tsx
git commit -m "style: hero light theme with cobalt accent"
```

---

## Task 7: Update ServiceTags

**Files:**
- Modify: `next-app/src/components/home/ServiceTags.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/ServiceTags.tsx`.

- [ ] **Step 2: Apply changes**

- Section background: `bg-[#F4F7FF]` (cool tint, per the spec rhythm table)
- Card background: `bg-white` `border border-[#ECEDF0]` `shadow-[0_1px_3px_rgba(11,15,25,0.04)]`
- Card hover: `hover:bg-[#FFFFFF] hover:border-[rgba(30,58,138,0.25)]` (use `.card-hover` class if it already covers this)
- H3: `text-[#0B0F19]`
- P: `text-[#4B5468]`
- Icon container: `.service-icon` (CSS already updated to cobalt). Just keep `className="service-icon"` and `className="service-icon-h"` or no extra class — the CSS handles it.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/ServiceTags.tsx
git commit -m "style: service tags on cool-tint surface"
```

---

## Task 8: Update WhyPartnerSection

**Files:**
- Modify: `next-app/src/components/home/WhyPartnerSection.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/WhyPartnerSection.tsx`.

- [ ] **Step 2: Apply changes**

- Section background: `bg-white border-t border-[#ECEDF0]`
- Section header H2: `text-[#0B0F19]`
- Section header P: `text-[#4B5468]`
- Item H3: `text-[#0B0F19]`
- Item P: `text-[#4B5468]`
- Check icon container: `.why-us-check` (CSS already updated to cobalt). Use `className="why-us-check"` directly.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/WhyPartnerSection.tsx
git commit -m "style: why partner section light theme"
```

---

## Task 9: Update NetworkMap (route map)

**Files:**
- Modify: `next-app/src/components/home/NetworkMap.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/NetworkMap.tsx`. The CSS for the map (markers, legend, tooltip) is already updated in Task 1 — most of the work happens at the CSS level.

- [ ] **Step 2: Look for any inline color values**

Search the file for:
- Hex colors (`#0d9488`, `#f59e0b`, `#111827`, etc.)
- Color names used as `color`, `backgroundColor`, or `fill` props

Replace:
- `#0d9488` (teal) → `#1E3A8A` (cobalt)
- `rgba(13, 148, 136, ...)` → `rgba(30, 58, 138, ...)`
- Any `teal` keyword in inline style → `cobalt`
- `#f59e0b` (amber, for connecting lines) → `#1E3A8A`

If the map uses SVG with `stroke` attributes, change stroke colors to cobalt.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/NetworkMap.tsx
git commit -m "style: route map dots and lines in cobalt"
```

---

## Task 10: Update MissionSection

**Files:**
- Modify: `next-app/src/components/home/MissionSection.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/MissionSection.tsx`.

- [ ] **Step 2: Apply changes**

- Section background: `bg-[#FAF6EE]` (warm cream, per spec)
- Section header H2: `text-[#0B0F19]`
- Card background: `bg-white border border-[rgba(11,15,25,0.06)] rounded-2xl`
- Card icon container: `.mission-icon` (CSS already updated to cobalt)
- H3: `text-[#0B0F19]`
- P: `text-[#4B5468]`

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/MissionSection.tsx
git commit -m "style: mission section on warm cream surface"
```

---

## Task 11: Update TestimonialsSection

**Files:**
- Modify: `next-app/src/components/home/TestimonialsSection.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/TestimonialsSection.tsx`.

- [ ] **Step 2: Apply changes**

- Section background: `bg-white border-t border-[#ECEDF0]`
- Section header H2: `text-[#0B0F19]`
- Cards: `.testimonial-card` (CSS already updated). Just keep using the class.
- Dot indicators: change active dot color. Find the `bg-amber` / `bg-[var(--amber)]` / `bg-[#F59E0B]` on the active dot and replace with `bg-[#1E3A8A]`.
- Inactive dots: `bg-[#D5D9E2]`

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/TestimonialsSection.tsx
git commit -m "style: testimonials light theme with cobalt active dot"
```

---

## Task 12: Update CTASection (the dark moment)

**Files:**
- Modify: `next-app/src/components/home/CTASection.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/home/CTASection.tsx`.

- [ ] **Step 2: Apply changes — this is the only dark section**

- Section background: `bg-[#1E3A8A]` (cobalt — the single dark moment per spec)
- H2: `text-white`
- P: `text-white/85`
- Button: `btn-on-cobalt` (white bg, cobalt text, becomes ink on hover)
- Add: `border-y border-white/15` (subtle 1px inner border for definition)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/CTASection.tsx
git commit -m "style: CTA banner as single dark cobalt moment"
```

---

## Task 13: Update ServiceGrid (services page)

**Files:**
- Modify: `next-app/src/components/services/ServiceGrid.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/services/ServiceGrid.tsx`.

- [ ] **Step 2: Apply changes**

- Page hero background: `bg-white border-b border-[#ECEDF0]`
- Page hero H1: `text-[#0B0F19]`
- Page hero breadcrumb: `text-[#4B5468]`
- Section H2: `text-[#0B0F19]`
- Service card background: `bg-white border border-[#ECEDF0] rounded-2xl`
- Service card hover: `hover:border-[rgba(30,58,138,0.3)] hover:bg-[#F4F7FF]`
- Service card H3: `text-[#0B0F19]`
- Service card P: `text-[#4B5468]`
- Service card icon: cobalt-tint background, cobalt color
- Service card border-left accent: `border-l-[3px] border-l-[#1E3A8A]` (per previous code review decision)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/services/ServiceGrid.tsx
git commit -m "style: services grid light theme with cobalt accent"
```

---

## Task 14: Update GalleryLightbox (services page)

**Files:**
- Modify: `next-app/src/components/services/GalleryLightbox.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/services/GalleryLightbox.tsx`.

- [ ] **Step 2: Apply changes**

- Gallery item background (placeholder while image loads): `bg-[#F4F5F7]`
- Gallery item border: `border-[#ECEDF0]`
- Gallery item hover: cobalt border tint
- Lightbox overlay: keep dark (`.lightbox` CSS already dark — universal expectation)
- Lightbox close button: cobalt accent (e.g., `text-[#1E3A8A]` on a white circle background, or cobalt stroke)
- Lightbox caption: `text-white/85` (visible on dark overlay)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/services/GalleryLightbox.tsx
git commit -m "style: gallery light theme with cobalt close button"
```

---

## Task 15: Update ContactForm

**Files:**
- Modify: `next-app/src/components/contact/ContactForm.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/contact/ContactForm.tsx`.

- [ ] **Step 2: Apply changes**

- Form section background: `bg-white`
- Form labels: `text-[#0B0F19] text-[13px] font-medium mb-1.5` (use `.form-label` class)
- Form input: `form-input` (CSS already updated to white bg, light border, cobalt focus)
- Form helper text: `text-[#4B5468] text-[12px] mt-1` (use `.form-helper` class)
- Form error: `text-[#EF4444] text-[12px] mt-1` (use `.form-error` class)
- Submit button: `btn-primary`
- Honeypot hidden field: keep as is

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/contact/ContactForm.tsx
git commit -m "style: contact form light theme"
```

---

## Task 16: Update ContactInfo

**Files:**
- Modify: `next-app/src/components/contact/ContactInfo.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/contact/ContactInfo.tsx`.

- [ ] **Step 2: Apply changes**

- Section background: `bg-white`
- Heading: `text-[#0B0F19]`
- Body text: `text-[#4B5468]`
- Icons: cobalt color (`text-[#1E3A8A]`)
- Info card background: `bg-white border border-[#ECEDF0] rounded-2xl p-6`
- Hover: cobalt border tint

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/contact/ContactInfo.tsx
git commit -m "style: contact info light theme"
```

---

## Task 17: Update OfficeMap (contact page)

**Files:**
- Modify: `next-app/src/components/contact/OfficeMap.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/components/contact/OfficeMap.tsx`.

- [ ] **Step 2: Apply minimal changes**

- The Leaflet map CSS is already updated in Task 1 (light map tiles, light popups/tooltips, cobalt markers).
- Only changes needed: if there's a styled wrapper container, change `bg-midnight` or `bg-[#111827]` to `bg-white border border-[#ECEDF0] rounded-2xl`.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/contact/OfficeMap.tsx
git commit -m "style: office map wrapper light theme"
```

---

## Task 18: Update home page.tsx

**Files:**
- Modify: `next-app/src/app/page.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/app/page.tsx`.

- [ ] **Step 2: Apply changes**

- Page-level section spacing: change `py-20` (or whatever) to `py-24` or `py-32` for editorial whitespace
- Section background classes on each `<section>` wrapper. Find any `bg-[#070B14]` or `bg-midnight` and replace with `bg-white` or `bg-[#F4F7FF]` or `bg-[#FAF6EE]` per the spec rhythm table.
- Section ordering (no change), but the `section-dark` wrapper around Mission should become `bg-[#FAF6EE]`
- The `divider-down` / `divider-up` classes can stay — the CSS gradient is now subtle on light
- Add `border-t border-[#ECEDF0]` to the WhyPartner section (white-on-white separation)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/page.tsx
git commit -m "style: home page section backgrounds and rhythm"
```

---

## Task 19: Update services page.tsx

**Files:**
- Modify: `next-app/src/app/services/page.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/app/services/page.tsx`.

- [ ] **Step 2: Apply changes**

- Page background: `bg-white`
- Page hero: `bg-white border-b border-[#ECEDF0]`
- Section backgrounds: `bg-white` (with `border-t border-[#ECEDF0]` on alternating sections)
- Headings: `text-[#0B0F19]`
- Sub: `text-[#4B5468]`
- CTA banner: same dark cobalt treatment as home (use the same component or replicate)

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/services/page.tsx
git commit -m "style: services page light theme"
```

---

## Task 20: Update contact page.tsx

**Files:**
- Modify: `next-app/src/app/contact/page.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/app/contact/page.tsx`.

- [ ] **Step 2: Apply changes**

- Page background: `bg-white`
- Page hero: `bg-white border-b border-[#ECEDF0]`
- Section backgrounds: `bg-white`
- Headings: `text-[#0B0F19]`
- Sub: `text-[#4B5468]`

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/contact/page.tsx
git commit -m "style: contact page light theme"
```

---

## Task 21: Update not-found.tsx (404)

**Files:**
- Modify: `next-app/src/app/not-found.tsx`

- [ ] **Step 1: Read the current file**

Read `next-app/src/app/not-found.tsx`.

- [ ] **Step 2: Apply changes**

- Background: `bg-white`
- Heading: `text-[#0B0F19]` with a thin cobalt underline (`border-b-2 border-[#1E3A8A] inline-block pb-1`)
- Sub: `text-[#4B5468]`
- "Back to home" button: `btn-primary`

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/not-found.tsx
git commit -m "style: 404 page light theme"
```

---

## Task 22: Verify (build, lint, visual)

**Files:**
- Read: `next-app/package.json` (for scripts)
- Output: `screenshot-redesign.png` (visual verification)

- [ ] **Step 1: Run lint**

```bash
cd next-app && npm run lint
```

Expected: 0 errors, 0 warnings. If there are warnings about unused classes (e.g., old `bg-midnight` references), fix them in the relevant component.

- [ ] **Step 2: Run build**

```bash
cd next-app && npm run build
```

Expected: 0 errors. 4 routes static, similar compile time to before.

- [ ] **Step 3: Start dev server and screenshot**

```bash
cd next-app && npm run dev &
```

Wait for it to start (look for "Local: http://localhost:3000" output).

Use the Playwright MCP tool to:
1. Navigate to `http://localhost:3000`
2. Take a full-page screenshot
3. Save as `screenshot-redesign.png` in the project root
4. Navigate to `/services` and screenshot
5. Navigate to `/contact` and screenshot

- [ ] **Step 4: Visual verification checklist**

For each screenshot, confirm:
- [ ] Page is light, no unintended dark sections
- [ ] Only one dark section visible: the cobalt CTA banner
- [ ] Cobalt accents visible on icons, links, active states
- [ ] All text legible (no contrast issues)
- [ ] No leftover amber, teal, or midnight colors
- [ ] Service cards on cool tint section, mission cards on warm cream
- [ ] Form inputs have white background and cobalt focus ring (test by clicking an input)
- [ ] Route map shows cobalt markers, not teal

- [ ] **Step 5: Stop dev server**

```bash
pkill -f "next dev" || true
```

- [ ] **Step 6: Final commit**

```bash
git add screenshot-redesign.png
git commit -m "chore: redesign visual verification screenshot"
```

- [ ] **Step 7: Update tasks/todo.md with completion summary**

Edit `tasks/todo.md` — add a new "Light-mode Redesign" section with:
- Status: Complete
- Date completed: 2026-06-12
- Files changed: 22 (1 full rewrite + 21 modifications)
- Verification: lint pass, build pass, visual confirmed

- [ ] **Step 8: Final commit**

```bash
git add tasks/todo.md
git commit -m "docs: mark light-mode redesign complete"
```

---

## Self-Review

**Spec coverage:**
- ✓ Direction C palette → Task 1 (globals.css)
- ✓ Soft-tint rhythm → Tasks 7, 10, 18 (Service Tags cool, Mission warm)
- ✓ Single dark CTA moment → Task 12
- ✓ Typography unchanged → no task needed (Inter+Outfit kept)
- ✓ Component-level decisions → Tasks 3-17 cover all 17 component files
- ✓ Files-changed list → Tasks 1-21 cover every file in the spec
- ✓ Visual discipline rules → enforced via globals.css tokens (one accent, no pure black/white, shadow tint, CTA uniqueness)
- ✓ Accessibility → globals.css updated with verified contrast ratios
- ✓ Verification plan → Task 22

**Placeholder scan:** No "TBD", "TODO", "implement later" found. Every step has concrete class names and code.

**Type consistency:** Color tokens defined once in Task 1, used consistently in Tasks 2-21. No conflicting names (e.g., `cobalt` vs `blue`).

**Out-of-scope items:** None of the spec's "Out of Scope" items (new pages, copy changes, new components, dark mode, font swap) are addressed by any task. ✓

---

## Estimated Time

Per the previous Next.js conversion (recorded in `tasks/todo.md` as 7 phases, 28 issues), this is a smaller pass. Estimated:

- Task 1: 5-10 minutes (file is large but the rewrite is mechanical)
- Tasks 2-21: 1-3 minutes each (mostly class name swaps)
- Task 22: 5-10 minutes (build + screenshot)

**Total:** ~45-60 minutes of focused work, well within a single subagent session. Tasks 3-21 can run in parallel as 3-4 subagent batches.
