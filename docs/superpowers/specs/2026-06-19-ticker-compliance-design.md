# Shipment Ticker + Compliance Strip — Design Spec

> **Source:** `future.md` #2 (ticker, brainstormed 2026-06-13) + #10 (compliance strip, added 2026-06-19). Part of the 4-feature "10x MVP" package.
> **Context:** This is an **experimental/demo site**. Per owner direction (2026-06-19), compliance credentials use **generated, realistic-looking placeholder values** — not real numbers. Ticker items are plausible fabricated events (not live data).

## Goal

Two site-wide trust/alive signals:
1. **Shipment ticker** — a thin marquee at the very top edge of every page, rolling pseudo-recent shipment events. Sells "this company moves things right now" on first paint.
2. **Compliance strip** — a compact credential/badge row above the footer on every page. Signals regulatory legitimacy (IEC, CBIC license, GSTIN, ISO).

## Why

A regional customs broker's hardest sell is "we're active and we're legit." The ticker addresses *active* (things are clearing right now); the compliance strip addresses *legit* (we hold the right papers). Both are low-effort, high-signal, and match the warm-editorial palette without adding visual noise. Together they frame every page visit with motion + authority.

## Scope

**In scope:**
- Both elements render site-wide via `layout.tsx`.
- Ticker: pure CSS animation (no JS beyond hydration-safe SSR), pause on hover, reduced-motion static fallback, no-JS shows the items in a static row.
- Compliance strip: server component, static credentials from `data.ts`, opt-in rendering (empty values = strip hidden — defensive even though we're filling demo values).
- Mobile responsive (ticker truncates gracefully, strip wraps).

**Out of scope:**
- Real data feeds / API integration (static export constraint — no backend).
- Clickable ticker items (no detail pages).
- Tradable ISO logos (use styled text pills, not trademarked marks).
- The word "LIVE" anywhere — the ticker is pseudo-data; labeling it live would be deceptive even on a demo.

## A. Shipment Ticker

### Placement
Very top edge of `<body>`, **above** the sticky navbar. Navbar remains `sticky top-0` — the ticker scrolls away with the page, navbar sticks to the top once it reaches it. Standard announcement-bar pattern.

### Visual
- Height: ~32px. Background `cream` (`#FAF8F4`), bottom hairline `border-border`.
- Left edge: small label "Recent activity" in `text-ink-dim` `text-[11px]` uppercase tracking-wide, fixed (doesn't scroll), separated by a hairline divider. This frames the scrolling items without claiming "live."
- Scrolling track: CSS `@keyframes ticker-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`. Content duplicated (items rendered twice) for seamless loop. Duration ~40s linear infinite. Pause on `:hover`.
- Each item: teal status dot (4px) + text in `text-ink` `text-xs`. Separator: middle dot `·` in `text-ink-dim`.
- Items do **not** include emojis (warm-editorial restraint). Just dot + text.

### Items (15 authored, plausible)
Format: `<Event> · <ref> · <route> · <relative time>`

Examples (full set in `data.ts`):
- `Customs cleared · MSCU-4729384 · Mundra → Ludhiana · 8m ago`
- `ICEGATE filing approved · SH-2841 · Ludhiana export · 14m ago`
- `Container loaded · TCLU-8816204 · Mumbai → Hamburg · 23m ago`
- `BL issued · HLCU-2024477 · Mundra sea FCL · 31m ago`
- `Dispatched · CON-7702341 · Delhi ICD → Ludhiana · 42m ago`
- `Arrived · MSKU-1190382 · Mundra port · 1h ago`
- `Door delivery · TRK-5520 · Mumbai → Pune · 1h ago`
- `Customs cleared · TEMU-6641029 · Amritsar border · 1h ago`
- `Loaded · MAEU-4470821 · Mundra → Rotterdam · 2h ago`
- `Filing approved · SH-3018 · Delhi ICD import · 2h ago`
- `Sailed · MSCU-7720193 · Mumbai → Jebel Ali · 3h ago`
- `Arrived · CRXU-3001847 · Chennai port · 3h ago`
- `Dispatched · TRK-9182 · Ludhiana → Jalandhar · 4h ago`
- `Customs cleared · TCLU-5592107 · Mundra → Delhi · 5h ago`
- `Booked · SH-4190 · Ludhiana → Mundra FCL · 6h ago`

Container prefixes (MSCU, TCLU, HLCU, MAEU, MSKU, TEMU, CRXU) are real carrier prefixes — adds plausibility for industry eyes.

### Behaviour
- **JS:** None required. Pure CSS animation. SSR-safe — server renders the items twice inside the track; CSS animates.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` sets `animation: none` and lets the track flow horizontally with `overflow-x: auto` so users can scroll manually if interested. (Or simpler: hide overflow and show first 3-4 items static — chosen for simplicity.)
- **No-JS:** Identical to reduced-motion (CSS-only, no JS dependency).
- **Pause on hover:** `:hover { animation-play-state: paused }` on the track.

### Files
| File | Action |
|---|---|
| `next-app/src/lib/data.ts` | Add `TickerItem` interface + `tickerItems: TickerItem[]` (15 items) |
| `next-app/src/app/globals.css` | Add `.ticker-*` classes + `@keyframes ticker-scroll` + reduced-motion guard |
| `next-app/src/components/layout/ShipmentTicker.tsx` | Create (server component — pure markup + CSS class) |
| `next-app/src/app/layout.tsx` | Render `<ShipmentTicker />` before `<Navbar />` |

## B. Compliance & Certifications Strip

### Placement
Immediately **above** the footer, site-wide (in `layout.tsx`, between `<main>` and `<Footer />`). Thin strip, doesn't compete with page content.

### Visual
- Background `cream` (`#FAF8F4`), top hairline `border-border`. Height ~48-56px (wraps on mobile).
- Centered flex row of credential pills. Each pill: small icon (lucide `BadgeCheck` or `ShieldCheck` in teal, 14px) + label + value, in `text-xs`/`text-[13px]`.
- Pills: `bg-white border border-border rounded-full px-3 py-1.5` — soft, editorial, no heavy badge graphics.
- On mobile: wraps to 2 rows of 2-3 pills each.

### Credentials (generated, demo-only — clearly marked in `data.ts` with a comment)
Per owner direction 2026-06-19: fill with realistic-looking numbers for demo. **A `// DEMO VALUES — replace with real before production` comment will sit above the object** so this is never mistaken for real on handoff.

| Credential | Demo value | Format note |
|---|---|---|
| IEC Code | `AALCS8394K` | 10-char DGFT format (2 alpha + 7 alnum + 1 alpha) |
| Customs Broker License | `CB/PUN/2021/00847` | CBIC regional format |
| GSTIN | `03AALCS8394K1Z5` | 15-char GST format (Punjab state code 03) |
| ISO 9001:2015 | Certified | Text pill, not a number |
| ISO 28000 (Supply Chain Security) | Certified | Logistics-specific, signals expertise |

IEC + GSTIN share the PAN prefix `AALCS8394K` — internally consistent (GSTIN is built from PAN). Realistic touch.

### Files
| File | Action |
|---|---|
| `next-app/src/lib/data.ts` | Add `Credential` interface + `credentials: Credential[]` (5 items, demo-flagged) |
| `next-app/src/components/layout/ComplianceStrip.tsx` | Create (server component) |
| `next-app/src/app/layout.tsx` | Render `<ComplianceStrip />` between `</main>` and `<Footer />` |

## Architecture

```
layout.tsx (server)
  ├─ <ShipmentTicker />        (NEW, server, pure CSS marquee)
  ├─ <Navbar />                (sticky top-0 — unaffected)
  ├─ <main>{children}</main>
  ├─ <ComplianceStrip />       (NEW, server, static pills)
  └─ <Footer />
```

Both new components are **server components** (no `"use client"`, no hooks, no state). Zero JS added to the client bundle. This is the lightest possible implementation and respects the static-export constraint perfectly.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Ticker distracting on long content pages | Scrolls away on scroll; only visible at top of page. Pause-on-hover. |
| Marquee causes layout shift / CLS | Fixed 32px height, items overflow hidden — no shift. |
| Reduced-motion users get a broken half-hidden strip | Reduced-motion media query shows static first 3 items, hides the rest cleanly. |
| Demo credentials mistaken for real | Inline `// DEMO VALUES` comment in `data.ts`; credentials are plausible but the comment makes handoff safe. |
| ISO trademark concerns | Text pills "ISO 9001:2015 Certified" — no logo, no trademarked mark. |
| Ticker items look fake to industry eyes | Real carrier container prefixes (MSCU/TCLU/HLCU/MAEU/MSKU), real port names, plausible event types. |
| Navbar `sticky top-0` breaks because ticker is above it | Ticker is a normal-flow sibling above navbar, not a wrapper. Navbar still sticks to viewport top once the ticker scrolls past. No CSS change to navbar. |

## Testing / Verification

No test framework. Verification per project pattern:
1. `npm run build` — 0 errors, 4 routes static.
2. `npm run lint` — 0 errors 0 warnings (no new warnings).
3. Playwright desktop: ticker scrolling, compliance pills visible above footer, no horizontal overflow.
4. Playwright mobile (375px): ticker readable, compliance pills wrap to 2 rows.
5. Playwright reduced-motion: ticker static (first items visible), no animation.
6. Hydration: no console warnings (both are server components with no client state — should be trivially clean).
7. Skip-link still works (it's positioned absolute, z-200; ticker is z-auto — verify skip link still appears above ticker on focus).

## Success Criteria
- Ticker scrolls seamlessly across the top of every page, pauses on hover, scrolls away on scroll.
- Compliance strip shows 5 credential pills above the footer on every page.
- Both respect reduced-motion.
- Both look correct at 375px, 768px, 1280px.
- `npm run build` + `npm run lint` clean.
- Navbar stickiness and skip-link unaffected.
- Zero new client JS bundle (both server components).
