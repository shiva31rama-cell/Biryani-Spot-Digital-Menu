import { MENU, type MenuItem } from './menu';

/**
 * Current restaurant-approved specials.
 *
 * Add future specials to this list only after confirming that each dish exists
 * in src/data/menu.ts. Prices and categories remain owned by menu.ts, so the
 * specials list never duplicates or overrides the canonical menu data.
 */
export const SPECIAL_DISH_NAMES = [
  'Pudina Kabab',
  'Garlic Kabab',
  'Punjabi Chicken Biryani',
  'Methi Chicken',
  'Palak Chicken',
] as const;

/**
 * Image filenames for the homepage cards.
 * Upload the matching image files into public/specials/.
 */
export const SPECIAL_DISH_IMAGES: Record<(typeof SPECIAL_DISH_NAMES)[number], string> = {
  'Pudina Kabab': 'pudina-kabab.png',
  'Garlic Kabab': 'garlic-chicken.png',
  'Punjabi Chicken Biryani': 'punjabi-chicken-biryani.png',
  'Methi Chicken': 'methi-chicken.png',
  'Palak Chicken': 'palak-chicken.png',
};

const menuItemsByName = new Map(
  MENU.flatMap((category) => category.items).map((item) => [item.name, item]),
);

/** Resolve the selected names to their existing menu records and prices. */
export const SPECIAL_DISHES: MenuItem[] = SPECIAL_DISH_NAMES.map((name) => {
  const item = menuItemsByName.get(name);

  if (!item) {
    throw new Error(
      `Configured special dish "${name}" was not found in src/data/menu.ts.`,
    );
  }

  return item;
});
