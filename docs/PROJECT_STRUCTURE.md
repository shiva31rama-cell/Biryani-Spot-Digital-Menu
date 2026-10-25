# Repository Structure and Code Ownership

This document is the quick reference for maintaining the Biryani Spot Digital Menu repository.

## High-level architecture

```text
Browser / QR visitor
  └── index.html
      └── src/main.tsx
          └── src/App.tsx
              ├── src/data/menu.ts          canonical dish data and prices
              ├── src/data/specials.ts      owner-managed homepage specials
              ├── src/config/restaurant.ts  restaurant contact/config
              ├── src/i18n.ts               English / Telugu-script labels
              └── src/index.css             visual styling and responsive layout

Static assets
  └── public/
      ├── biryani-spot-logo.png
      ├── [13 category image files]
      ├── manifest.webmanifest
      ├── favicon.svg / brand-logo.svg
      └── sw.js

Quality and deployment
  ├── scripts/validate-menu.mjs
  ├── .github/workflows/build.yml
  ├── .github/workflows/deploy.yml
  └── wrangler.jsonc
```

## Source-file responsibility

| File | Single responsibility | Source-of-truth note |
| --- | --- | --- |
| `src/data/menu.ts` | Typed category and dish records | Only place where menu prices and dish records should be edited |
| `src/data/specials.ts` | Names of dishes promoted in the homepage specials section | Add/remove special names here; prices still come from `menu.ts` |
| `src/config/restaurant.ts` | Address, phone, WhatsApp, Maps, social URLs, opening hours | Values must be owner-confirmed |
| `src/i18n.ts` | Display copy in Telugu script | Does not own menu prices, product IDs, or ordering data |
| `src/App.tsx` | Page composition, filtering, selection state and user interactions | UI behavior; keep business data in the data/config modules |
| `src/index.css` | Colors, layout, responsive and interaction styles | No business data or prices should be stored here |
| `src/main.tsx` | Mount the React application and register the service worker in production | App startup only |
| `index.html` | Document metadata, title, icon links and the React root element | Browser/search/social-preview metadata |
| `public/` | Images, manifest, service worker and other static assets | Public filenames are case-sensitive on deployment |
| `scripts/validate-menu.mjs` | Automated assertions for menu, images, metadata and service-worker syntax | Keep checks aligned with intended repository behavior |
| `.github/workflows/build.yml` | CI: install, validate, build, lint | Runs on pushes and pull requests targeting `main` |
| `.github/workflows/deploy.yml` | Publish built assets to Cloudflare Workers | Requires both Cloudflare repository secrets |
| `wrangler.jsonc` | Worker name and the `dist/` assets directory | Cloudflare deployment configuration |
| `README.md` | Setup instructions, maintenance guide and key links | Start here when onboarding or updating the project |
| `docs/FINALIZATION_CHECKLIST.md` | Owner approval and manual QA checklist | Update when launch requirements change |
| `docs/RESTAURANT_INFO_TEMPLATE.md` | Structured form for owner-provided details | Use to collect changes before editing the config |

## Rules for safe edits

1. Change a dish price only in `src/data/menu.ts`. Use `single()` for a single price and `sized()` for Half / Full.
2. Change the homepage specials list only in `src/data/specials.ts`. Use the exact dish name already defined in `menu.ts`; do not copy prices into the specials file. The list can grow past 15 entries.
3. When adding a dish, keep the category, dietary flag, ID uniqueness and item count consistent. Update validation expectations only when the menu itself is intentionally changed.
4. When renaming a category image, change both `CATEGORY_PHOTOS` in `src/App.tsx` and the asset list in `scripts/validate-menu.mjs`.
5. Increase the cache name in `public/sw.js` when a change needs to invalidate previously cached assets.
6. Never commit API tokens, passwords, or other secrets. Cloudflare deployment credentials belong in GitHub Actions repository secrets.
7. Make changes directly on `main` only when that is the chosen workflow, and inspect GitHub Actions after committing.

## Standard checks

```bash
npm install
npm run test:menu
npm run build
npm run lint
```

## Known deployment prerequisite

`.github/workflows/deploy.yml` triggers for updates to `main` and supports manual invocation. It checks for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; if either is absent, it exits before building or publishing. A successful code check alone does not prove that production deployment succeeded.
