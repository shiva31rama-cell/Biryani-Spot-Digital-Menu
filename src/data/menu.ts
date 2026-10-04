export type SizeOption = { label: 'Half' | 'Full'; price: number };
export type MenuItem = {
  id: string;
  name: string;
  veg: boolean;
  price?: number;
  sizes?: SizeOption[];
  category: string;
};
export type MenuCategory = {
  name: string;
  short: string;
  description: string;
  items: MenuItem[];
};

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const single = (name: string, price: number, veg: boolean, category: string): MenuItem => ({ id: slug(name), name, price, veg, category });
const sized = (name: string, half: number, full: number, category: string, veg = false): MenuItem => ({
  id: slug(name), name, veg, category, sizes: [{ label: 'Half', price: half }, { label: 'Full', price: full }],
});
const group = (name: string, short: string, description: string, items: MenuItem[]): MenuCategory => ({ name, short, description, items });

export const MENU: MenuCategory[] = [
  group('Non-Veg Soups', 'NV', 'Warm and comforting favourites', [
    single('Chicken Hot & Sour Soup', 100, false, 'Non-Veg Soups'), single('Chicken Manchow Soup', 100, false, 'Non-Veg Soups'),
    single('Chicken Sweet Corn Soup', 100, false, 'Non-Veg Soups'), single('Chicken Clear Soup', 100, false, 'Non-Veg Soups'),
    single('Chicken Coriander Clear Soup', 100, false, 'Non-Veg Soups'),
  ]),
  group('Veg Soups', 'VG', 'Light and flavourful vegetarian soups', [
    single('Veg Soup', 100, true, 'Veg Soups'), single('Veg Hot Sour Soup', 100, true, 'Veg Soups'),
    single('Veg Manchow Soup', 100, true, 'Veg Soups'), single('Veg Sweet Corn Soup', 100, true, 'Veg Soups'),
    single('Veg Coriander Clear Soup', 100, true, 'Veg Soups'), single('Lemon Corn Soup', 100, true, 'Veg Soups'),
  ]),
  group('Veg Starters', 'VG', 'Crispy and spicy vegetarian starters', [
    single('Veg Manchuria', 100, true, 'Veg Starters'), single('Veg 65', 100, true, 'Veg Starters'),
    single('Paneer Manchuria', 180, true, 'Veg Starters'), single('Paneer Chilli', 180, true, 'Veg Starters'),
    single('Paneer 65', 180, true, 'Veg Starters'), single('Mushroom Chilli', 200, true, 'Veg Starters'),
    single('Mushroom Manchuria', 200, true, 'Veg Starters'), single('Mushroom 65', 200, true, 'Veg Starters'),
    single('Baby Corn Chilli', 200, true, 'Veg Starters'), single('Baby Corn 65', 200, true, 'Veg Starters'),
    single('Baby Corn Manchuria', 200, true, 'Veg Starters'),
  ]),
  group('Non-Veg Starters', 'NV', 'Popular chicken and egg starters', [
    single('Egg Manchuria', 150, false, 'Non-Veg Starters'), single('Egg 65', 150, false, 'Non-Veg Starters'),
    single('Chilli Chicken', 200, false, 'Non-Veg Starters'), single('Chicken Manchuria', 200, false, 'Non-Veg Starters'),
    single('Chicken 65', 200, false, 'Non-Veg Starters'), single('Ginger Chicken', 200, false, 'Non-Veg Starters'),
    single('Dragon Chicken', 250, false, 'Non-Veg Starters'), single('Chicken Majesty', 250, false, 'Non-Veg Starters'),
    single('Chicken 555', 250, false, 'Non-Veg Starters'), single('Kaju Chicken', 250, false, 'Non-Veg Starters'),
    single('Chicken Lollipop (6)', 180, false, 'Non-Veg Starters'), single('Chicken Wings (15)', 200, false, 'Non-Veg Starters'),
    single('Lemon Chicken', 250, false, 'Non-Veg Starters'), single('Chicken Gulzar', 300, false, 'Non-Veg Starters'),
    single('Stick Chicken', 250, false, 'Non-Veg Starters'), single('Schezwan Chicken', 200, false, 'Non-Veg Starters'),
    single('Garlic Chicken', 200, false, 'Non-Veg Starters'), single('Chicken Keema Balls', 300, false, 'Non-Veg Starters'),
    single('Guntur Mirapakay Kodi', 300, false, 'Non-Veg Starters'),
  ]),
  group('Tandoori Starter', 'T', 'Tandoor favourites with half and full options', [
    sized('Tandoori Chicken', 220, 400, 'Tandoori Starter'), sized('Tandoori Kabab', 140, 280, 'Tandoori Starter'),
    sized('Chicken Tikka', 150, 300, 'Tandoori Starter'), sized('Pudina Kabab', 250, 500, 'Tandoori Starter'),
    sized('Pudina Tikka', 150, 300, 'Tandoori Starter'), sized('Garlic Kabab', 250, 500, 'Tandoori Starter'),
    sized('Garlic Tikka', 150, 300, 'Tandoori Starter'), sized('Lahori Kabab', 250, 500, 'Tandoori Starter'),
    sized('Lahori Tikka', 150, 300, 'Tandoori Starter'),
  ]),
  group('Veg Tandoori Starter', 'VG', 'Paneer, mushroom and baby corn from the tandoor', [
    single('Paneer Tikka', 200, true, 'Veg Tandoori Starter'), single('Mushroom Tikka', 200, true, 'Veg Tandoori Starter'),
    single('Baby Corn Tikka', 200, true, 'Veg Tandoori Starter'),
  ]),
  group("Biryani's", 'B', 'The signature rice dishes of Biryani Spot', [
    sized('Chicken Dum Biryani', 150, 250, "Biryani's"), sized('Chicken Fry Biryani', 150, 250, "Biryani's"),
    sized('Chicken Rost Biryani', 150, 250, "Biryani's"), sized('Mutton Dum Biryani', 300, 400, "Biryani's"),
    sized('Mutton Rost Biryani', 300, 400, "Biryani's"), single('Rambo Biryani', 300, false, "Biryani's"),
    single('Chicken Boneless Biryani', 300, false, "Biryani's"), single('Kabab Biryani', 300, false, "Biryani's"),
    sized('Prawns Biryani', 300, 400, "Biryani's"), sized('Mixed Biryani', 300, 400, "Biryani's"),
    single('Mughalai Biryani', 350, false, "Biryani's"), single('Punjabi Chicken Biryani', 300, false, "Biryani's"),
    single('Biryani Spot Special Biryani', 350, false, "Biryani's"), single('Family Pack Biryani', 600, false, "Biryani's"),
  ]),
  group('Veg Friedrice', 'FR', 'Freshly prepared vegetarian fried rice', [
    single('Veg Friedrice', 80, true, 'Veg Friedrice'), single('SP. Veg Friedrice', 200, true, 'Veg Friedrice'),
    single('Schezwan Friedrice', 120, true, 'Veg Friedrice'), single('Paneer Friedrice', 160, true, 'Veg Friedrice'),
    single('Kaju Friedrice', 160, true, 'Veg Friedrice'), single('Sweet Corn Friedrice', 160, true, 'Veg Friedrice'),
    single('Mushroom Friedrice', 160, true, 'Veg Friedrice'),
  ]),
  group('Noodles', 'NO', 'Classic wok-tossed noodles', [
    single('Veg Noodles', 80, true, 'Noodles'), single('Chicken Noodles', 100, false, 'Noodles'),
  ]),
  group('Non Veg Friedrice', 'FR', 'Chicken, egg, mixed and mutton fried rice', [
    sized('Chicken Friedrice', 100, 150, 'Non Veg Friedrice'), sized('Double Egg Friedrice', 100, 150, 'Non Veg Friedrice'),
    single('SP. Chicken Friedrice', 250, false, 'Non Veg Friedrice'), sized('Chicken Schezwan Friedrice', 120, 160, 'Non Veg Friedrice'),
    sized('Mixed Friedrice', 300, 400, 'Non Veg Friedrice'), single('Triple Friedrice', 250, false, 'Non Veg Friedrice'),
    sized('Mutton Friedrice', 300, 400, 'Non Veg Friedrice'),
  ]),
  group('Roti & Naan', 'RN', 'Tandoori breads and naan', [
    single('Tandoori Roti', 20, true, 'Roti & Naan'), single('Tandoori Butter Roti', 25, true, 'Roti & Naan'),
    single('Butter Naan', 40, true, 'Roti & Naan'), single('Plain Naan', 30, true, 'Roti & Naan'),
    single('Garlic Naan', 50, true, 'Roti & Naan'), single('Cheese Naan', 60, true, 'Roti & Naan'),
    single('Masala Kulcha', 70, true, 'Roti & Naan'),
  ]),
  group('Veg Curries', 'VG', 'Rich vegetarian curries to pair with breads', [
    single('Paneer Curry', 150, true, 'Veg Curries'), single('Paneer Butter Masala', 150, true, 'Veg Curries'),
    single('Kaju Paneer', 200, true, 'Veg Curries'), single('Kaju Tamota', 150, true, 'Veg Curries'),
    single('Kaju Masala', 200, true, 'Veg Curries'), single('Palak Paneer', 150, true, 'Veg Curries'),
    single('Mushroom Curry', 200, true, 'Veg Curries'), single('Baby Corn Curry', 180, true, 'Veg Curries'),
  ]),
  group('Non Veg Curries', 'NV', 'Hearty curries for a complete meal', [
    single('Chicken Boneless Curry', 150, false, 'Non Veg Curries'), single('Butter Chicken', 150, false, 'Non Veg Curries'),
    single('Chicken Kohlapuri', 150, false, 'Non Veg Curries'), single('Kadai Chicken', 150, false, 'Non Veg Curries'),
    single('Hyderabadi Curry', 150, false, 'Non Veg Curries'), single('Mogalai Chicken', 200, false, 'Non Veg Curries'),
    single('Chicken Patiala Curry', 200, false, 'Non Veg Curries'), single('Chicken Tikka Masala', 200, false, 'Non Veg Curries'),
    single('Mutton Curry', 250, false, 'Non Veg Curries'), single('Prawns Curry', 250, false, 'Non Veg Curries'),
    single('Chicken Keema Masala', 250, false, 'Non Veg Curries'), single('Palak Chicken', 200, false, 'Non Veg Curries'),
    single('Methi Chicken', 200, false, 'Non Veg Curries'),
  ]),
];

export const ALL_ITEMS = MENU.flatMap((category) => category.items);
export const MENU_ITEM_COUNT = ALL_ITEMS.length;
