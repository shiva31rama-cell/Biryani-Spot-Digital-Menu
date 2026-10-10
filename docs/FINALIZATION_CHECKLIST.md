# Biryani Spot — Final Repository Checklist

This checklist distinguishes automated code checks from real-world owner approval and device testing. Deployment remains paused.

## Implemented in the repository

- [x] React + TypeScript + Vite digital menu
- [x] Official brand WebP used in the application and PWA/share metadata
- [x] Three-second CSS brand intro with Skip Intro, reduced-motion behavior and once-per-session logic
- [x] Menu data separated into a dedicated data module
- [x] Search and category navigation
- [x] All / Veg / Non-Veg / Saved filters
- [x] Favourites persisted locally
- [x] My Selection with Half/Full variants, quantity controls and estimated total
- [x] Share menu and share selection
- [x] WhatsApp enquiry and feedback preparation, without automatic sending
- [x] Contact fields for address, phone, WhatsApp, Maps, social links and opening hours
- [x] Full menu print and a separate My Selection print view
- [x] Responsive layouts, touch-target improvements, focus states and dialog accessibility
- [x] Offline banner, PWA manifest, app-shell asset precaching and bounded cache cleanup
- [x] App-install prompt when supported by the browser
- [x] Automated menu/PWA/brand/service-worker validation script in CI
- [x] Production build and lint in CI
- [x] Manual-only deployment workflow; no automatic publishing on pushes

## Automated verification

Run:

```bash
npm run test:menu
npm run build
npm run lint
```

The GitHub Actions CI job executes the same checks. Check the [latest workflow results](https://github.com/shiva31rama-cell/Biryani-Spot-Digital-Menu/actions). A green CI run confirms automated checks only; it is not a replacement for testing on a physical phone.

## Required owner decisions before launch

- [ ] Approve the exact restaurant name and official image.
- [ ] Verify all 111 dish names, dietary tags, categories and prices against the current printed menu.
- [ ] Add verified restaurant address.
- [ ] Add verified phone and WhatsApp numbers (WhatsApp digits should include the country code).
- [ ] Add official Google Maps URL and opening hours.
- [ ] Add social links only if they are official.
- [ ] Provide an actual 3-second MP4/WebM brand video if a video—not the current CSS animation—is required.
- [ ] Supply approved food/restaurant photography if dish photos are desired.

## Manual UI/UX test plan

- [ ] Scan/open the QR URL on an actual Android phone.
- [ ] Confirm the brand intro lasts about three seconds, Skip Intro works immediately and the intro does not replay on every interaction.
- [ ] Confirm reduced-motion users proceed directly to the menu.
- [ ] Test All, Veg, Non-Veg and Saved filters; verify the Saved filter works from any category.
- [ ] Search Chicken, Biryani and Paneer; test no-results recovery.
- [ ] Test Half/Full selection, quantities, clear, persistence and totals.
- [ ] Inspect WhatsApp message line breaks and selected-item pricing using a verified test number before launch.
- [ ] Test feedback with/without optional name.
- [ ] Print the full menu and My Selection; check contact details if configured.
- [ ] Open the site once online, revisit offline and test browser Back/reload.
- [ ] Check 360px, 390px, tablet and desktop layouts for overflow, clipping, keyboard focus and dialog close behavior.
- [ ] Verify PWA installation prompt on a browser that supports it.

## Deployment state

Publishing is paused. The deploy workflow is manual only. Do not start it until the owner checklist and manual UI/UX checks have been approved.
