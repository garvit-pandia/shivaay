# Resources — Source Manifest

Provenance record for every document downloaded into `next-app/public/downloads/`
for the `/resources/files` page (Shivaay Logistics website).

- **Downloaded from:** `https://www.ilgshipping.com/files` (client-approved reference site)
- **Downloaded on:** 2026-10-03
- **Files stored in:** `next-app/public/downloads/`
- **Code data layer:** `next-app/src/lib/resources.ts`
- **Naming note:** filenames were normalized during download (spaces and URL-encoding
  removed). Original on-site names are recorded below. Display titles match the
  reference page, with one typo corrected: "E-seling Circular" → "E-sealing Circular"
  (file 1 below).

## Direct downloads (shown as cards on `/resources/files`)

| # | Display title | Saved as | Original name on reference site | Size (bytes) | SHA-256 |
|---|---------------|----------|--------------------------------|--------------|---------|
| 1 | E-sealing Circular | `CustomNotification.pdf` | `CustomNotification.pdf` | 1,308,395 | `8a3b03a08754e44058a5ae15a6870ba1851cbf56685b081880b2e2b076d7af51` |
| 2 | RODTEP AAEOU | `Appendix4RERODTEPEOU.pdf` | `Appendix4RERODTEPEOU.pdf` | 2,512,031 | `defb1847ddedab94923db1823f0e877df5f8c49d2bc560eefd01e685d98432f8` |
| 3 | RODTEP Schedule | `RODTEPNEW.pdf` | `RODTEPNEW.pdf` | 2,571,047 | `fc9c27c9e354b014e192794e66eb914bbf4abd68f01fdf626129176aa1a35827` |
| 4 | New DBK Circular | `NewDBKcircular.pdf` | `NewDBKcircular.pdf` | 3,033,547 | `8cd700ce6f961b03cb0680adee3f2c77e5fb2f6b4229ba3007457fd5f70c64c0` |
| 5 | List of KYC Documents | `KYC.docx` | `KYC.docx` | 14,587 | `021c284d03c7f9bfb83b6b18c9197336560a7eec94ea33c30454aa6f90b75db0` |
| 6 | Form A Blank | `FormA.doc` | `FormA.doc` | 25,600 | `40448b2d93ecf8486c613806bfbf81bb59214288a8aa984098737084f8fd9a37` |

## "Supporting Documents" dropdown group

| # | Display title | Saved as | Original name on reference site | Size (bytes) | SHA-256 |
|---|---------------|----------|--------------------------------|--------------|---------|
| 7 | DBK DECLARATION (Word) | `DBKDECLARATION.docx` | `DBKDECLARATION.docx` | 13,897 | `4670d59b0e1679af61724d7ed18be565b9f162cabe68387f85b9b744b0b6eb0b` |
| 8 | Declaration | `declaration.pdf` | `declaration.pdf` | 725,283 | `4257565f0c18d0a376f5dc28bfc1af66f21f8835e2eb5e7b4275785aa2e88d83` |
| 9 | Value Declaration | `ValueDeclaration.pdf` | `ValueDeclaration.pdf` | 16,290 | `73a7cbb72b3c6472eaf2ce4a3faf8809a7e15aef6bfac55b8f3a523bd436ad51` |
| 10 | Import Docs Empty | `ImportDocsEmpty.pdf` | `ImportDocsEmpty.pdf` | 1,688,651 | `5f636b59bde43c47c6b9473f140fb0ea0ca6b7623b215c15c7d43fac778e658f` |

## "Latest/Notification" dropdown group

| # | Display title | Saved as | Original name on reference site | Size (bytes) | SHA-256 |
|---|---------------|----------|--------------------------------|--------------|---------|
| 11 | RICE NEW NOTIFICATION WEF 01.05.25 | `RICENEWNOTIFICATION.pdf` | `RICENEWNOTIFICATION.pdf` | 366,673 | `b5725d8662ad5eb5b4d309b3e7a432365dada5a3b3ca952f5d8780897be9e208` |
| 12 | Trade Notice 04-signed | `TradeNotice.pdf` | `TradeNotice .pdf` (space before extension) | 1,455,043 | `c60a72167bf45e028e35f834b3a8f5b13af32bd5acef823e15e2bb5707c256c1` |

## Source URLs

All files were downloaded from
`https://www.ilgshipping.com/downloadfiles/<original-name>` — e.g.
`https://www.ilgshipping.com/downloadfiles/TradeNotice%20.pdf` for file 12.

## Other resources content (not files)

- `/resources/links` — 5 government portal links (ICE Gate, DGFT, duty calculator,
  exchange rate, shipping bill enquiry). URLs in `src/lib/resources.ts`.
- `/resources/documents` — 9 document-requirement checklists (informational only,
  nothing downloadable). Content in `src/lib/resources.ts`.
- `/resources/ports` — 8 Ludhiana ICD/CFS facilities with Google Maps embeds.
  Data in `src/lib/resources.ts`.

## 3D models (homepage hero)

| File | Source | License | Downloaded |
|---|---|---|---|
| `truck.glb`, `box.glb`, `cone.glb` | Kenney Car Kit 3.1 — https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip | CC0 (license copy: `public/models/LICENSE-kenney-car-kit.txt`) | 2026-10-05 |

Models were extracted from the kit and are tinted to the brand palette at runtime
(`Trucks.tsx`). Reference projects (Meridian Terminal, cargoShip3JS, shipping_container)
were studied for patterns only — no code was copied.

The GLBs reference the kit's shared `Textures/colormap.png`, served at
`public/models/Textures/colormap.png` (all materials are replaced at runtime, so it
only keeps the loader free of missing-texture errors).
