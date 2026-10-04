# Biryani Spot — Digital Menu

A responsive, family-friendly digital restaurant menu built with React, TypeScript and Vite.

## What is implemented

- Professional light, warm family-restaurant visual system
- Biryani Spot brand logo integrated across the menu
- Complete menu transcription from the supplied printed menu photographs
- Veg / Non-Veg filtering
- Search across dishes and categories
- Category quick navigation
- Responsive mobile-first layout
- Half / Full pricing where the printed menu provides both sizes
- Useful table-selection helper with quantity controls and live total
- Clear empty states and reset controls
- Keyboard focus states and accessible labels
- Portable asset paths for GitHub Pages and other static hosts
- PWA manifest and SEO metadata
- Automated CI validation
- Automated CD deployment to GitHub Pages from main

## Menu source

The displayed item names and prices are based on the restaurant's supplied printed menu photographs. Before public launch, the restaurant owner should perform a final spelling and price verification.

The app intentionally does not invent dish photographs. Real restaurant/food photography can be added later when the owner supplies approved images.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## CI / CD

The project uses only the main branch, as requested.

### CI

Every push and pull request targeting main runs:

1. Dependency installation
2. TypeScript production build
3. Oxlint validation

### CD

Every push to main builds the Vite production bundle and deploys the generated dist/ directory through GitHub Pages.

GitHub Pages must be enabled in Settings → Pages → Build and deployment → Source → GitHub Actions for the repository.

Expected project-site URL:

https://shiva31rama-cell.github.io/Biryani-Spot-Digital-Menu/

## Final owner information still required

These should only be added after confirmation from the restaurant owner:

- Confirmed restaurant address
- Confirmed phone number
- Google Maps location
- Official social media links
- Final menu spelling and price approval
- Approved real restaurant / food photographs
- Final hosting domain, if a custom domain is preferred

No unconfirmed contact details or fake restaurant information are included in the application.
