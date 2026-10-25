# Biryani Spot — Final Repository Checklist

This checklist separates repository-level checks from decisions and testing that require the restaurant owner.

## Implemented in the repository

- [x] React + TypeScript + Vite digital menu
- [x] Menu data separated from the UI in `src/data/menu.ts`
- [x] Menu data organized into seven labelled sections and 13 categories
- [x] Homepage specials maintained separately from the canonical menu and prices
- [x] Five current owner-provided specials displayed, with the list structured to scale beyond 15 items
- [x] English / Telugu-script display labels, with menu records and prices kept unchanged
- [x] Search, category navigation, and All / Veg / Non-Veg filters
- [x] Customer selection with Half/Full variants, quantity controls and estimated total
- [x] Restaurant configuration separated into `src/config/restaurant.ts`
- [x] Category photo references documented in `CATEGORY_PHOTOS` in `src/App.tsx`
- [x] All 13 category food-image files committed under `public/`
- [x] Responsive layouts, visible focus states, and dialog keyboard handling
- [x] PWA manifest, service-worker asset caching and cache-version management
- [x] Automated menu, category-image, metadata and service-worker checks
- [x] GitHub Actions CI workflow for menu validation, production build and lint
- [x] Cloudflare Workers deployment workflow

## Repository organization

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the source map, ownership rules, and standard edit workflow.

## Automated verification

Run:

```bash
npm install
npm run test:menu
npm run build
npm run lint
```

The CI workflow runs the validation, build and lint automatically. A passing CI run means those code checks succeeded; it does not replace manual restaurant approval or device testing.

Review recent results on the [GitHub Actions page](https://github.com/shiva31rama-cell/Biryani-Spot-Digital-Menu/actions).

## Required owner approvals before public launch

- [ ] Confirm all 113 dish names, 13 categories, dietary flags, spelling and prices against the current approved menu.
- [ ] Confirm the current specials list and any subsequent additions with the owner before promotion.
- [ ] Confirm Half/Full prices and all item names that are size-specific.
- [ ] Approve each category image and confirm its category mapping.
- [ ] Confirm the restaurant address, phone, WhatsApp number, Maps link and opening hours.
- [ ] Provide official social profile links only if the owner wants them displayed.
- [ ] Confirm the language mode is transliteration into Telugu script (not a full semantic translation), if that remains the requirement.
- [ ] Review the actual website on a phone, tablet and desktop.

## Manual UI/UX test plan

- [ ] Open the menu from the QR/public URL on an actual phone.
- [ ] Switch English / తెలుగు and confirm dish data and prices remain unchanged.
- [ ] Test search, category navigation, and All / Veg / Non-Veg filters.
- [ ] Add single-price and Half/Full dishes; adjust quantities and verify estimated totals.
- [ ] Clear a selection and check persistence after a refresh.
- [ ] Test restaurant phone, Maps and WhatsApp enquiry links only with owner-confirmed details.
- [ ] Test narrow-screen layout at widths near 360px and 390px, along with tablet and desktop.
- [ ] Open the site online once, then check reload/offline behavior.

## Deployment status and prerequisites

The deployment workflow is configured to run automatically on pushes to `main`, and it also supports manual invocation from GitHub Actions. It requires the following repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If either is missing or invalid, the workflow stops before deployment. Review the latest workflow result before claiming that production has been updated. Never place the API token in source files or chat.
