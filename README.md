# Shivaay Logistics

Official website for **Shivaay Logistics** — customs broker and logistics facilitator based in Ludhiana, Punjab. 15+ years serving businesses across India with customs clearance, freight forwarding, and end-to-end supply chain solutions.

**Live site:** [shivaaylogistics.com](https://shivaaylogistics.com)

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Lucide** icons
- **OpenStreetMap** for the coverage map — shows complete Indian national boundary via embed (free, no API key)
- Hosted on Vercel

## Pages

- `/` — Hero, services overview, coverage network, mission, testimonials, CTA
- `/services` — All 12 forwarding services, gallery, CTA
- `/contact` — Office info, inquiry form, office map, phone CTA
- `/not-found` — Custom 404

## Development

```bash
cd next-app
npm install
npm run dev          # http://localhost:3000
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

## Contact

**Shivaay Logistics**
Plot No. 116, Street No. 8, Ganesh Nagar, Ludhiana-141015 (Pb.)
+91 88474-67790
shivaaylogistics2022@gmail.com
