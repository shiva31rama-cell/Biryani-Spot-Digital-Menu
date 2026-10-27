# Biryani Spot Digital Menu

A mobile-first digital menu for Biryani Spot Family Restaurant, built with React, TypeScript and Vite. The menu currently contains **113 dishes across 13 categories** and supports English/Telugu-script display, category browsing, dietary filtering, Half/Full options where defined, and a persistent customer selection.

## Repository map

For a high-level architecture diagram and code-ownership rules, see [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md).

| Path | Purpose | Edit when you need to… |
| --- | --- | --- |
| `src/data/menu.ts` | Canonical menu categories, dish names, dietary flags and prices | Add, remove, rename or reprice a dish |
| `src/data/specials.ts` | Owner-managed list of currently promoted special dishes | Add or remove a homepage special without duplicating its menu price |
| `src/config/restaurant.ts` | Restaurant address, phone, WhatsApp, Maps link and hours | Update owner-confirmed contact information |
| `src/i18n.ts` | English-to-Telugu-script display mappings | Adjust Telugu-script labels without changing menu data |
| `src/App.tsx` | React UI and menu interactions | Change application behavior or page structure |
| `src/index.css` | Layout, responsive behavior and visual styling | Change appearance, spacing or responsive layout |
| `src/main.tsx` | React entry point and production service-worker registration | Change app startup |
| `index.html` | Document title, metadata, icon links and app mount point | Update browser/share metadata |
| `public/*.png` | Brand and category food-image assets | Replace the corresponding approved image |
| `public/manifest.webmanifest` | Installable web-app metadata | Change the PWA name, colors or icon metadata |
| `public/sw.js` | Offline caching and cache-version lifecycle | Change caching behavior (increment `CACHE_NAME` when needed) |
| `scripts/validate-menu.mjs` | Automated data, asset and metadata checks | Extend validation coverage |
| `.github/workflows/build.yml` | CI checks on main and pull requests | Change verification steps |
| `.github/workflows/deploy.yml` | Cloudflare Workers deployment workflow | Change publication process |
| `wrangler.jsonc` | Cloudflare Worker name and static-assets configuration | Change Worker deployment configuration |
| `docs/` | Owner checklist and restaurant-information template | Maintain project handoff documentation |
| `docs/PROJECT_STRUCTURE.md` | Architecture map and file-ownership rules | Understand how the repository is organized |

## Menu-data conventions

All dish records live in `src/data/menu.ts`; do not maintain a second list of prices in the UI.

- `single(name, price, veg, category)` represents one price, for example `single('Veg Noodles', 80, true, 'Noodles')`.
- `sized(name, half, full, category, veg?)` represents Half and Full prices, in that order, for example `sized('Chicken Dum Biryani', 150, 250, "Biryani's")`.
- Keep each dish inside its matching `group(...)` category, preserve unique generated IDs and keep the dietary flag correct.
- When editing prices, change only the approved price values. Have the restaurant owner verify all prices against the current printed menu before publishing.

## Restaurant specials

The homepage's current specials are managed in `src/data/specials.ts`. It currently promotes Pudina Kabab, Garlic Kabab, Punjabi Chicken Biryani, Methi Chicken, and Palak Chicken. The list can grow beyond 15 items without adding new price records.

To add or remove a special:
1. Open `src/data/specials.ts`.
2. Add or remove the exact dish name in `SPECIAL_DISH_NAMES`.
3. Make sure the dish already exists in `src/data/menu.ts`; its price and category are taken from that canonical menu record.
4. Confirm `npm run test:menu` and `npm run build` pass.

Do not duplicate prices in the specials file. A Half/Full dish automatically displays its existing starting price; single-price dishes display their existing menu price.

### Current categories

1. Non-Veg Soups
2. Veg Soups
3. Veg Starters
4. Non-Veg Starters
5. Tandoori Starter
6. Veg Tandoori Starter
7. Biryani's
8. Veg Friedrice
9. Noodles
10. Non Veg Friedrice
11. Roti & Naan
12. Veg Curries
13. Non Veg Curries

## Homepage special-dish photos

The five current homepage specials use image files stored in `public/specials/`. Upload the files with these exact names:

- `pudina-kabab.png`
- `garlic-chicken.png`
- `punjabi-chicken-biryani.png`
- `methi-chicken.png`
- `palak-chicken.png`

The mapping is maintained in `src/data/specials.ts`. The Garlic Kabab card deliberately reuses `garlic-chicken.png` as requested. The image files are photos for the special cards only; dish names and prices remain sourced from `src/data/menu.ts`. If a photo has not been uploaded yet, the UI falls back to the category artwork.

Open the [GitHub upload folder](https://github.com/shiva31rama-cell/Biryani-Spot-Digital-Menu/tree/main/public/specials) and choose **Add file → Upload files** to add them directly to `public/specials/`.

## Category-image conventions

Category image references are declared in `CATEGORY_PHOTOS` in `src/App.tsx`. The files are expected directly inside `public/` and their filenames must match exactly. They are category-level photos, not a separate photo assigned to every dish. If a category image is renamed, update the mapping and the validation test together.

Current category assets:

`non-veg-soups.png`, `veg-soups.png`, `veg-starters.png`, `non-veg-starters.png`, `tandoori-starter.png`, `veg-tandoori-starter.png`, `biryanis.png`, `veg-friedrice.png`, `noodles.png`, `non-veg-friedrice.png`, `roti-naan.png`, `veg-curries.png`, and `non-veg-curries.png`.

## Restaurant configuration

Edit `src/config/restaurant.ts` only with information confirmed by the owner:

- `address`: public-facing address
- `phone`: number used by the call link
- `whatsapp`: country code and number as digits only (no plus sign, spaces or dashes)
- `mapsUrl`: the intended Google Maps location
- `openingHours`: verified opening hours
- `instagramUrl` / `facebookUrl`: official profiles only; leave empty until confirmed

Do not put API keys or credentials in the repository.

## Local development

Requires a supported Node.js version for the current Vite toolchain.

```bash
npm install
npm run dev
```

## Checks before handoff

Run all three commands:

```bash
npm run test:menu
npm run build
npm run lint
```

The menu-validation script checks category/item totals, IDs, categories, price structure, representative prices, category-image assets, PWA metadata and service-worker syntax. CI runs the same validation plus the production build and lint. A passing CI run validates code and data structure; the restaurant owner must still approve the business content and current prices.

Check [GitHub Actions](https://github.com/shiva31rama-cell/Biryani-Spot-Digital-Menu/actions) for workflow results.

## Deployment to Cloudflare Workers

The Worker name is `biryani-spot-digital-menu`. Deployment is configured in `.github/workflows/deploy.yml` and `wrangler.jsonc`.

The workflow triggers on pushes to `main` and can be run manually. It requires these repository secrets at **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`: a token with the required Cloudflare Workers deployment permissions.
- `CLOUDFLARE_ACCOUNT_ID`: the account ID that owns the Worker.

If either secret is absent or invalid, the deployment workflow stops before deployment. Never share the API token in chat or commit it into a file. Verify the latest workflow result before assuming that the live site has been updated.

## Launch review

Before launch, the owner should verify every dish name, price, Half/Full size, vegetarian classification, category, image, contact detail and opening hour. Then test the site on an actual phone, including language toggle, search, dietary filters, selection quantities/totals, WhatsApp enquiry, refresh/offline revisit, and narrow-screen layout.

The WhatsApp feature prepares an enquiry for the customer to review and send. It is not an automated order-confirmation or payment system.
