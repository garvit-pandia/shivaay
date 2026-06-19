# Shipment Ticker + Compliance Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CSS-only shipment ticker above the navbar and a server-rendered compliance credentials strip above the footer — both site-wide, both zero-client-JS.

**Architecture:** Two new server components rendered in `layout.tsx`. Ticker = pure CSS `@keyframes` marquee with content duplicated for seamless loop; reduced-motion guard shows a static subset. Compliance = static credential pills from `data.ts`. Neither uses `"use client"`, hooks, or state. Data lives in `data.ts` alongside existing exports.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19, TypeScript 5, Tailwind v4. No new dependencies. No test framework — verification = `npm run build` + `npm run lint` + Playwright.

**Spec:** `docs/superpowers/specs/2026-06-19-ticker-compliance-design.md`

**Lint gotchas** (from `tasks/lessons.md` + `next-app/AGENTS.md`):
- No `useState`/`useEffect` in these components (server components) → no `react-hooks` rule exposure.
- Use `next/link` for any internal links, `next/image` for images — N/A here (no links/images in these components; lucide icons only).
- Lucide: named imports, not barrel (`import { ShieldCheck } from "lucide-react"`).

**All paths relative to** `/home/garvit/projects/logistics1`. Run `npm` commands from `next-app/`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `next-app/src/lib/data.ts` | Modify (append ~30 lines) | `TickerItem`, `tickerItems`, `Credential`, `credentials` |
| `next-app/src/app/globals.css` | Modify (append ~40 lines) | `.ticker-*` classes, `@keyframes ticker-scroll`, reduced-motion |
| `next-app/src/components/layout/ShipmentTicker.tsx` | Create (~35 lines) | Server component: label + scrolling track (items rendered twice) |
| `next-app/src/components/layout/ComplianceStrip.tsx` | Create (~30 lines) | Server component: credential pills row |
| `next-app/src/app/layout.tsx` | Modify (3 edits) | Render `<ShipmentTicker />` above `<Navbar />`, `<ComplianceStrip />` above `<Footer />` |

---

### Task 1: Add ticker + credentials data to `data.ts`

**Files:**
- Modify: `next-app/src/lib/data.ts` (append at end of file, after `serviceOptions`)

- [ ] **Step 1: Append the four exports**

Open `next-app/src/lib/data.ts`. At the very end of the file (after the `serviceOptions` array closing `];`), append:

```typescript
export interface TickerItem {
  event: string;
  ref: string;
  route: string;
  time: string;
}

export const tickerItems: TickerItem[] = [
  { event: "Customs cleared",      ref: "MSCU-4729384", route: "Mundra → Ludhiana",      time: "8m ago" },
  { event: "ICEGATE filing approved", ref: "SH-2841",   route: "Ludhiana export",         time: "14m ago" },
  { event: "Container loaded",     ref: "TCLU-8816204", route: "Mumbai → Hamburg",        time: "23m ago" },
  { event: "BL issued",            ref: "HLCU-2024477", route: "Mundra sea FCL",          time: "31m ago" },
  { event: "Dispatched",           ref: "CON-7702341", route: "Delhi ICD → Ludhiana",     time: "42m ago" },
  { event: "Arrived",              ref: "MSKU-1190382", route: "Mundra port",             time: "1h ago" },
  { event: "Door delivery",        ref: "TRK-5520",    route: "Mumbai → Pune",           time: "1h ago" },
  { event: "Customs cleared",      ref: "TEMU-6641029", route: "Amritsar border",         time: "1h ago" },
  { event: "Loaded",               ref: "MAEU-4470821", route: "Mundra → Rotterdam",      time: "2h ago" },
  { event: "Filing approved",      ref: "SH-3018",     route: "Delhi ICD import",        time: "2h ago" },
  { event: "Sailed",               ref: "MSCU-7720193", route: "Mumbai → Jebel Ali",      time: "3h ago" },
  { event: "Arrived",              ref: "CRXU-3001847", route: "Chennai port",            time: "3h ago" },
  { event: "Dispatched",           ref: "TRK-9182",    route: "Ludhiana → Jalandhar",    time: "4h ago" },
  { event: "Customs cleared",      ref: "TCLU-5592107", route: "Mundra → Delhi",          time: "5h ago" },
  { event: "Booked",               ref: "SH-4190",     route: "Ludhiana → Mundra FCL",   time: "6h ago" },
];

export interface Credential {
  label: string;
  value: string;
  icon: "shield-check" | "badge-check" | "file-text" | "award";
}

// DEMO VALUES — replace with real credentials before production.
// Internally consistent: IEC and GSTIN share PAN prefix AALCS8394K.
export const credentials: Credential[] = [
  { label: "IEC Code",                  value: "AALCS8394K",        icon: "file-text" },
  { label: "Customs Broker License",    value: "CB/PUN/2021/00847", icon: "shield-check" },
  { label: "GSTIN",                     value: "03AALCS8394K1Z5",   icon: "badge-check" },
  { label: "ISO 9001:2015",             value: "Certified",         icon: "award" },
  { label: "ISO 28000",                 value: "Certified",         icon: "award" },
];
```

Notes:
- `TickerItem` uses a structured shape (not pre-formatted strings) so the component can compose the display consistently and the data stays queryable.
- `Credential.icon` is a string literal union matching lucide icon names the `Icon` wrapper accepts. (Confirm the `Icon` component at `next-app/src/components/ui/Icon.tsx` accepts these — if not, adjust the union. The existing components use `Icon icon={ShieldCheck}` with the imported component, not a string. **Check this in Step 2 before committing.**)

- [ ] **Step 2: Verify the Icon component's API**

Run: `cat next-app/src/components/ui/Icon.tsx`
If `Icon` takes `icon={SomeComponent}` (the lucide component directly, as seen in `Navbar.tsx:6,56`), then the `Credential.icon` string union won't work as-is. **Adjust the design:** change `Credential` to not carry icon info, and have `ComplianceStrip` map credential labels → icons internally via a lookup object. Update the `credentials` array to drop the `icon` field. Revised shape:

```typescript
export interface Credential {
  label: string;
  value: string;
}
```

And the component (Task 3) will own the icon mapping:
```tsx
const iconMap: Record<string, LucideIcon> = {
  "IEC Code": FileText,
  "Customs Broker License": ShieldCheck,
  "GSTIN": BadgeCheck,
  "ISO 9001:2015": Award,
  "ISO 28000": Award,
};
```

**Use this revised shape (no `icon` field on `Credential`).** Update the `credentials` array in Step 1 to remove the `icon` properties before committing.

- [ ] **Step 3: Type-check**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/data.ts
git commit -m "feat(ticker): add tickerItems and credentials data"
```

---

### Task 2: Add ticker + compliance CSS to `globals.css`

**Files:**
- Modify: `next-app/src/app/globals.css` (append at end of file)

- [ ] **Step 1: Append the ticker CSS**

At the very end of `globals.css`, append:

```css
/* ---- Shipment ticker ---- */
.ticker-bar {
  background: #FAF8F4;
  border-bottom: 1px solid #E8E4DB;
  height: 32px;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;
}
.ticker-label {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6B5E4A;
  background: #FFFFFF;
  border-right: 1px solid #E8E4DB;
  white-space: nowrap;
}
.ticker-track {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  white-space: nowrap;
  will-change: transform;
  animation: ticker-scroll 40s linear infinite;
}
.ticker-track:hover {
  animation-play-state: paused;
}
.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  font-size: 12px;
  color: #1E1B18;
}
.ticker-item::after {
  content: "·";
  margin-left: 22px;
  color: #C9C2B5;
}
.ticker-item:last-child::after {
  content: "";
  margin-left: 0;
}
.ticker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0F766E;
  flex: 0 0 auto;
}

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation: none;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ticker-track::-webkit-scrollbar { display: none; }
}
```

Notes:
- The track translates `-50%` because the component renders the item list **twice** end-to-end. At `-50%` the second copy is exactly where the first started → seamless loop.
- `.ticker-label` has a white bg + right border so it reads as a fixed "tab" on the left edge while the track scrolls past it.
- `will-change: transform` hints the browser to GPU-composite the track — smoother on long pages.
- Reduced-motion: animation off, horizontal scroll enabled (scrollbar hidden for cleanliness). User can swipe/scroll the track manually.

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/globals.css
git commit -m "feat(ticker): add marquee css + reduced-motion guard"
```

---

### Task 3: Create `ShipmentTicker.tsx`

**Files:**
- Create: `next-app/src/components/layout/ShipmentTicker.tsx`

- [ ] **Step 1: Write the component**

Create `next-app/src/components/layout/ShipmentTicker.tsx`:

```tsx
import { tickerItems } from "@/lib/data";

export function ShipmentTicker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker-bar" role="marquee" aria-label="Recent shipment activity">
      <span className="ticker-label">Recent activity</span>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-dot" aria-hidden="true" />
            <span>
              {item.event} · {item.ref} · {item.route} · {item.time}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

Notes:
- Server component (no `"use client"`). Zero client JS.
- `items = [...tickerItems, ...tickerItems]` duplicates the list so the `-50%` translate loops seamlessly.
- `key={i}` is acceptable here — the list is static and never reordered. (Index keys are only an anti-pattern for mutable lists.)
- `role="marquee"` is the ARIA role for scrolling content; `aria-label` gives screen readers a name. The content is decorative-ish; this is the lightest accessible treatment without `aria-live` (which would announce every item and be noisy).

- [ ] **Step 2: Commit**

```bash
git add next-app/src/components/layout/ShipmentTicker.tsx
git commit -m "feat(ticker): add ShipmentTicker server component"
```

---

### Task 4: Create `ComplianceStrip.tsx`

**Files:**
- Create: `next-app/src/components/layout/ComplianceStrip.tsx`

- [ ] **Step 1: Write the component**

First confirm the `Icon` component's import shape by reading `next-app/src/components/ui/Icon.tsx`. It almost certainly re-exports a lucide icon with a `className` prop. Create `next-app/src/components/layout/ComplianceStrip.tsx`:

```tsx
import { ShieldCheck, BadgeCheck, FileText, Award, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { credentials } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  "IEC Code": FileText,
  "Customs Broker License": ShieldCheck,
  "GSTIN": BadgeCheck,
  "ISO 9001:2015": Award,
  "ISO 28000": Award,
};

export function ComplianceStrip() {
  if (credentials.length === 0) return null;
  return (
    <section
      className="bg-cream border-t border-border"
      aria-label="Compliance and certifications"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-4 flex flex-wrap items-center justify-center gap-2.5">
        {credentials.map((c) => {
          const IconComp = iconMap[c.label] ?? ShieldCheck;
          return (
            <span
              key={c.label}
              className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1.5 text-[13px]"
            >
              <Icon icon={IconComp} size={14} className="shrink-0 text-teal" aria-hidden="true" />
              <span className="text-ink-dim">{c.label}</span>
              <span className="font-semibold text-ink">{c.value}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
```

Notes:
- Server component. The `iconMap` is a module-level constant — no per-render cost.
- `if (credentials.length === 0) return null` — the opt-in safety net from the spec. Even though we ship demo values, this means removing all entries hides the strip entirely. Defensive.
- `flex-wrap` + `justify-center` → pills wrap to 2 rows on mobile, stay centered.
- `LucideIcon` type import: confirm it's exported from `lucide-react` (it is, in v1.17). If `npx tsc --noEmit` complains, switch the type to `React.ComponentType<{ size?: number; className?: string }>`.

- [ ] **Step 2: Type-check + lint**

Run: `cd next-app && npx tsc --noEmit` → 0 errors.
Run: `cd next-app && npm run lint` → 0 errors 0 warnings (the pre-existing `<img>` warning in HeroSection is unrelated and acceptable).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/layout/ComplianceStrip.tsx
git commit -m "feat(compliance): add ComplianceStrip server component"
```

---

### Task 5: Wire both into `layout.tsx`

**Files:**
- Modify: `next-app/src/app/layout.tsx`

- [ ] **Step 1: Add imports**

At the top of `layout.tsx`, alongside the existing layout component imports (after the `ScrollReveal` import, line 6), add:

```tsx
import { ShipmentTicker } from "@/components/layout/ShipmentTicker";
import { ComplianceStrip } from "@/components/layout/ComplianceStrip";
```

- [ ] **Step 2: Render the ticker above the navbar**

In the `<body>` JSX, the current order is:
```tsx
<Navbar />
<main id="main-content">{children}</main>
<Footer />
<WhatsAppFloat />
<ScrollReveal />
```

Insert `<ShipmentTicker />` as the **first** child of `<body>` (before `<Navbar />`):
```tsx
<ShipmentTicker />
<Navbar />
<main id="main-content">{children}</main>
<Footer />
<WhatsAppFloat />
<ScrollReveal />
```

- [ ] **Step 3: Render the compliance strip above the footer**

Insert `<ComplianceStrip />` between `</main>` and `<Footer />`:
```tsx
<main id="main-content">{children}</main>
<ComplianceStrip />
<Footer />
```

Final body order:
```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>
<ShipmentTicker />
<Navbar />
<main id="main-content">{children}</main>
<ComplianceStrip />
<Footer />
<WhatsAppFloat />
<ScrollReveal />
```

Notes:
- The skip-link stays the first focusable element (it's `position: absolute`, pulled out of flow). Verify in Task 6 that focusing it still surfaces it above the ticker (z-200 vs ticker z-auto — should be fine, but check).
- The ticker is in normal flow above the sticky navbar. When the user scrolls, the ticker scrolls away and the navbar sticks to the top — standard announcement-bar behavior. No CSS change to navbar needed.

- [ ] **Step 4: Build + lint**

Run: `cd next-app && npm run build` → 0 errors, 4 static routes.
Run: `cd next-app && npm run lint` → 0 new errors/warnings.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/app/layout.tsx
git commit -m "feat(layout): wire ticker + compliance strip site-wide"
```

---

### Task 6: Visual + behavioural verification

**Files:** None modified — verification only.

- [ ] **Step 1: Build and serve**

Run: `cd next-app && npm run build`
Serve: `npx serve out -l 4173` (background or separate shell).
Confirm: `curl -s http://localhost:4173/ | grep -oE 'Recent activity|MSCU-4729384|IEC Code|AALCS8394K|ISO 9001'` returns hits — server-rendered HTML contains both features.

- [ ] **Step 2: Playwright desktop (1280px)**

Navigate to `http://localhost:4173/`. Snapshot + screenshot to `screenshots/ticker-compliance-desktop.png`. Confirm:
- Ticker bar visible at very top (above navbar), scrolling.
- "Recent activity" label fixed on the left.
- Hovering the ticker pauses it.
- Scroll down → ticker scrolls off, navbar sticks to top.
- Compliance strip visible above footer with 5 pills (IEC, License, GSTIN, ISO 9001, ISO 28000).

- [ ] **Step 3: Playwright mobile (375px)**

Resize to 375x667. Navigate to `/`. Screenshot `screenshots/ticker-compliance-mobile.png`. Confirm:
- Ticker readable (text not clipped vertically).
- Compliance pills wrap to 2 rows, centered, no horizontal overflow.

- [ ] **Step 4: Reduced-motion**

Emulate `prefers-reduced-motion: reduce` (via `playwright_browser_run_code_unsafe` setting `window.matchMedia` before navigation, or Playwright's emulation). Reload `/`. Confirm:
- Ticker is static (not scrolling). First few items visible, rest accessible via horizontal scroll (scrollbar hidden).
- Compliance strip unchanged (it has no animation).

- [ ] **Step 5: Skip-link + hydration check**

Desktop session: tab through the page from the top. Confirm the skip link appears above the ticker when focused. Capture console messages (`playwright_browser_console_messages`, level `warning`) — confirm no hydration warnings (both new components are server-rendered with no client state, so this should be trivially clean).

- [ ] **Step 6: Document + final commit**

Append a short verification record to `tasks/lessons.md` (or new `tasks/ticker-compliance-verification.md`) with: build/lint status, screenshot paths, any fixes. If fixes were needed, commit them:
```bash
git add -A
git commit -m "fix(ticker): <what was fixed>"
```

---

## Self-Review Checklist (run before declaring done)

- [ ] **Spec coverage:** Ticker above navbar (Task 3+5), 15 items (Task 1), CSS marquee + pause + reduced-motion (Task 2), no-JS safe (Task 2 reduced-motion = no-JS behavior). Compliance above footer (Task 4+5), 5 demo credentials (Task 1), opt-in render (Task 4 null guard). Both site-wide (Task 5). ✓
- [ ] **No placeholders:** All code complete, no "TBD". ✓
- [ ] **Type consistency:** `TickerItem` fields (`event`, `ref`, `route`, `time`) match Task 3 usage. `Credential` fields (`label`, `value`) match Task 4 usage (after removing `icon` per Task 1 Step 2). ✓
- [ ] **Lint gotchas:** No hooks in new components (server components). Named lucide imports. ✓
- [ ] **Verification has teeth:** Build + lint + 4 Playwright checks (desktop, mobile, reduced-motion, skip-link/hydration). ✓
