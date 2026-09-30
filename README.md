# Biryani Spot — Digital Menu

A responsive, family-friendly digital restaurant menu built with React, TypeScript and Vite.

## Current features

- Biryani Spot family-restaurant branding with the refined production logo
- 111 menu items transcribed from the supplied restaurant menu photographs
- Veg / Non-Veg filtering
- Search across dishes and categories
- Category quick-navigation buttons
- Responsive mobile-first menu cards
- Half / Full pricing display where supplied
- Add-to-selection list with quantity controls
- Selection side panel with live item count and menu total
- Empty-state and reset controls
- Warm, professional, non-neon restaurant-focused UI
- Accessible button labels and keyboard focus states
- SEO-friendly page title and description
- PWA manifest and SPA fallback support
- GitHub Actions CI for TypeScript build and lint checks on `main`

## Menu data

The prices and item names currently shown are based on the restaurant's supplied printed menu photographs. Restaurant staff should perform a final spelling and price verification before public launch.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## CI/CD

GitHub Actions runs the production build and lint checks for pushes and pull requests targeting `main`.

The project is intentionally kept on the `main` branch as requested. No feature branch is required for the current workflow.

## Final restaurant information still required

These should be added only after confirmation from the restaurant owner:

- Confirmed restaurant address
- Confirmed phone number
- Google Maps location
- Official social media links
- Final menu spelling and price approval
- Real restaurant / food photographs
- Final hosting domain and deployment configuration

Cloudflare deployment is intentionally not configured until the final restaurant details and owner approval are available.
