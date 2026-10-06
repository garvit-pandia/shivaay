<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shivaay app conventions

- Static export (`output: "export"`) — no server APIs; client components for interactivity only
- Components by domain: `src/components/{home,services,resources,layout,ui}`; data in `src/lib/data.ts` and `src/lib/resources.ts`
- Downloads live in `public/downloads/` — provenance in `../docs/resources-source-manifest.md`
- Dev: `npm run dev` → localhost:5182 · Verify: `npm run build` && `npm run lint`
- Use existing design tokens (`ink`, `ink-dim`, `teal`, `cream`, `border`) and patterns (`reveal`, `card-hover`, `btn-outline`, `font-serif` headings)
- Hero is R3F (`components/hero/`, lazy + home-only): never import `three`/`@react-three/*` outside it — keep pure helpers three-free (`lib/hero-ease.ts`). CC0 GLBs live in `public/models/` with provenance in `../docs/resources-source-manifest.md`. Cursor contract: `data-scan` / `data-waybill` / `data-stamp`. Verify hero with `python3 scripts/verify_hero.py --base-url http://localhost:5299` against a fresh export.

### Verification gotchas
- Scroll-reveal pages (`.reveal`): scroll through before screenshots, or below-fold cards look "missing" (opacity 0 until observed)
- Google Maps embed iframes need ~5s for tiles in headless browsers
- Coverage map tiles: Esri Light Gray Canvas (keyless). Do not switch back to Carto — `basemaps.cartocdn.com` now watermarks keyless usage with "API KEY REQUIRED"

