# Biryani Spot — Digital Menu

A mobile-first QR digital menu for Biryani Spot Family Restaurant, built with React, TypeScript and Vite. The customer can scan a table QR code, see the official brand intro, browse the supplied menu and prepare a selection without creating an account.

## Product features

- Official Biryani Spot brand image integrated into the intro, header, hero, footer, favicon/share metadata and PWA icon.
- Three-second CSS brand animation with Skip Intro, reduced-motion support and once-per-session behavior. The menu appears automatically after the intro.
- 111 menu items in 13 data-driven categories, with supplied prices and Half/Full sizes where applicable.
- Instant dish/category search and All, Veg, Non-Veg and Saved/Favourites filters.
- Persistent favourites and My Selection in local browser storage, with quantity controls and estimated total.
- Share menu and share selection, including clipboard fallback where supported.
- WhatsApp enquiry and feedback message preparation. The customer still reviews and sends the message; this is not an online order or payment system.
- Optional restaurant contact, call, Maps, opening-hours and social actions configured from one owner-controlled file.
- Printable menu and a dedicated print view for My Selection.
- Responsive UI, accessible labels, visible focus, dialog semantics, Escape-to-close and mobile-friendly touch targets.
- Live offline status, PWA manifest, offline app-shell caching and an install prompt where the browser supports it.
- SEO/share metadata, portable relative assets, and manual-only deployment workflow.

## Local development

Requires a supported Node.js version for the Vite toolchain.

```bash
npm install
npm run dev
```

## Verification commands

Run these before handoff:

```bash
npm run test:menu
npm run build
npm run lint
```

`npm run test:menu` validates the menu's expected category/item counts, unique IDs, category references, explicit dietary flags, positive prices, Half/Full price structure and representative price checks. It also parses the PWA manifest, checks the official WebP brand asset and parses the service-worker JavaScript.

The GitHub Actions CI workflow runs the menu validation, TypeScript/Vite production build and Oxlint. Check the [Actions page](https://github.com/shiva31rama-cell/Biryani-Spot-Digital-Menu/actions) for the latest result.

## Owner-confirmed restaurant configuration

Edit `src/config/restaurant.ts` only with verified information:

- `address`: full address customers should use
- `phone`: phone number for the Call action
- `whatsapp`: WhatsApp number including country code; digits only, no plus sign or spaces
- `mapsUrl`: official Google Maps destination URL
- `instagramUrl` and `facebookUrl`: official social profile URLs
- `openingHours`: verified opening hours

Empty values intentionally remain unconfigured; they are not replaced with invented restaurant facts. The WhatsApp function also checks the configured number before creating a `wa.me` link.

## Menu and media verification

Menu names, classifications and prices were transcribed from the menu supplied for this project. The validation test protects the total item count and selected representative prices, but it cannot prove every transcription matches the latest physical menu. The restaurant owner should verify every dish name, category, dietary classification, size and price before public launch.

The official brand image is stored at `public/biryani-spot-brand.webp`. The current three-second intro is a CSS animation using this image; a separate MP4/WebM brand video has not been supplied or integrated. Dish-specific food photography is not fabricated; add real approved images when available.

## Offline/PWA behavior

The service worker precaches the app shell and built JavaScript/CSS, caches successful same-origin assets, and uses a network-first strategy for page navigations. It removes only older cache keys beginning with `biryani-spot-`, so it does not clear unrelated apps' caches on a shared origin. On first-ever use while already offline, the app cannot be downloaded; open it successfully once online first.

## Deployment is intentionally paused

Deployment is deliberately manual and does not run on ordinary pushes. The workflow can be triggered from GitHub Actions only when the restaurant is approved for launch. GitHub Pages also needs to be enabled in Settings → Pages → Build and deployment → Source → GitHub Actions. No deployment is being performed as part of this finalization pass.

Static asset paths use Vite's relative base to support project subpaths on GitHub Pages and other static hosts.

## Final launch checklist

- [ ] Owner confirms restaurant name and official brand asset.
- [ ] Owner verifies all 111 menu entries, vegetarian/non-vegetarian classifications, spellings and prices against the current menu.
- [ ] Owner provides verified address, phone, WhatsApp, Maps URL and opening hours.
- [ ] Owner approves any social links and real food/restaurant photographs.
- [ ] Latest CI validation, build and lint all pass.
- [ ] Manually test QR entry, intro skip/reduced-motion, search, filters, favourites, sizes, quantities, totals, WhatsApp message contents, feedback, print and offline revisit on an actual phone.
- [ ] Review the built site on phone, tablet and desktop before manually deploying.

No credentials, payment collection, fake order confirmation, fake reviews, fake ratings or invented contact details are included.
