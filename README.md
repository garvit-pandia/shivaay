# Shivaay Logistics

Official website for **Shivaay Logistics** — customs broker and logistics facilitator based in Ludhiana, Punjab. 15+ years serving businesses across India with customs clearance, freight forwarding, and end-to-end supply chain solutions.

**Live site:** [shivaaylogistics.com](https://shivaaylogistics.com)

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Lucide** icons
- **Esri Light Gray Canvas** basemap for the coverage map (Base + Reference overlay, no API key required)
- Hosted on Vercel

## Pages

- `/` — Hero, services overview, coverage network, mission, testimonials, CTA
- `/services` — All 12 forwarding services, gallery, CTA
- `/contact` — Office info, inquiry form, office map, phone CTA
- `/resources` — Resources hub
- `/resources/links` — Transport & customs portals (ICE Gate, DGFT, etc.)
- `/resources/documents` — Required-documents checklists by process
- `/resources/files` — Downloadable circulars, declarations and forms
- `/resources/ports` — Clearance ports/ICDs/CFS in Ludhiana with maps
- `/not-found` — Custom 404

## Development

```bash
cd next-app
npm install
npm run dev          # http://localhost:5182 (port pinned — see projects2/PORT-REGISTRY.md)
npm run build        # production build
npm run lint         # eslint
```

## Project structure

```
.
├── next-app/              # the actual Next.js application
│   ├── src/
│   │   ├── app/           # routes (App Router)
│   │   ├── components/    # React components
│   │   └── lib/           # data + utilities
│   └── public/            # static assets (logo, etc.)
├── docs/                  # design specs & implementation plans
├── tasks/                 # session todo + lessons learned
└── .agents/               # custom skills
```

## Design documentation

See `docs/superpowers/specs/` for design specs and `docs/superpowers/plans/` for implementation plans.

## Resources content

The `/resources` pages are data-driven from `next-app/src/lib/resources.ts` (portal links, document checklists, download entries, port facilities).

- Downloadable documents live in `next-app/public/downloads/`
- Provenance (display titles, original filenames, sizes, SHA-256) is recorded in [`docs/resources-source-manifest.md`](docs/resources-source-manifest.md)

## Contact

**Shivaay Logistics**
Plot No. 116, Street No. 8, Ganesh Nagar, Ludhiana-141015 (Pb.)
+91 88474-67790
shivaaylogistics2022@gmail.com
