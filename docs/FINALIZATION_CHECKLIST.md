# Biryani Spot — Finalization Checklist

This checklist is for the final restaurant handoff. It deliberately separates code work from facts that must be confirmed by the restaurant.

## Already implemented

- Responsive React + TypeScript + Vite menu
- Restaurant branding and welcome screen
- Category navigation
- Search
- Veg / Non-Veg filters
- Menu cards and pricing display
- Half / Full price display where supplied
- Order-list drawer with quantity controls
- Empty states and reset controls
- Mobile-friendly layout
- SEO metadata
- PWA manifest and favicon
- SPA fallback for static hosting
- GitHub Actions build workflow

## Must be confirmed before production launch

- [ ] Official restaurant logo
- [ ] Exact restaurant name spelling/capitalisation
- [ ] Exact menu spelling
- [ ] Every menu price checked against the latest printed menu
- [ ] Address
- [ ] Phone / WhatsApp number
- [ ] Google Maps destination
- [ ] Social links, if the restaurant wants them displayed
- [ ] Actual restaurant/food photographs, if available
- [ ] Whether the Order List is only a selection helper or should submit an order
- [ ] Final approval from the restaurant/sir

## Final technical test

1. Open the site on a phone.
2. Open every category.
3. Search for Chicken, Biryani and Paneer.
4. Test All / Veg / Non-Veg filters.
5. Add several items to the Order List.
6. Increase and decrease quantities.
7. Clear the Order List.
8. Refresh and verify expected local cart behaviour.
9. Check that no text is clipped on small screens.
10. Run `npm run build` and confirm GitHub Actions passes.
11. Only after approval, configure Cloudflare hosting.

## Important

Do not invent restaurant contact details, location, photographs, or menu prices. Replace placeholders only after the restaurant confirms them.
