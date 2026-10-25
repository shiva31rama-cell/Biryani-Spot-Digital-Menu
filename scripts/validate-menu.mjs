import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const readRoot = (path) => readFile(new URL(path, root), 'utf8');
const MENU_CATEGORIES = [
  'Non-Veg Soups',
  'Veg Soups',
  'Veg Starters',
  'Non-Veg Starters',
  'Tandoori Starter',
  'Veg Tandoori Starter',
  "Biryani's",
  'Veg Friedrice',
  'Noodles',
  'Non Veg Friedrice',
  'Roti & Naan',
  'Veg Curries',
  'Non Veg Curries',
];
const CATEGORY_IMAGES = [
  'non-veg-soups.png',
  'veg-soups.png',
  'veg-starters.png',
  'non-veg-starters.png',
  'tandoori-starter.png',
  'veg-tandoori-starter.png',
  'biryanis.png',
  'veg-friedrice.png',
  'noodles.png',
  'non-veg-friedrice.png',
  'roti-naan.png',
  'veg-curries.png',
  'non-veg-curries.png',
];

// Compile the TypeScript menu module for validation without importing the React app.
const menuSource = await readRoot('src/data/menu.ts');
const compiled = ts.transpileModule(menuSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, 'Menu data must transpile without TypeScript errors');

const sandbox = { exports: {}, module: { exports: {} } };
sandbox.module.exports = sandbox.exports;
vm.runInNewContext(compiled.outputText, sandbox, { filename: 'menu-data.cjs' });

const { MENU, ALL_ITEMS, MENU_ITEM_COUNT } = sandbox.module.exports;
assert.ok(Array.isArray(MENU), 'MENU must be an array');
assert.equal(MENU.length, MENU_CATEGORIES.length, 'Expected all menu categories');
assert.deepEqual(Array.from(MENU, (category) => category.name), MENU_CATEGORIES);
assert.equal(MENU_ITEM_COUNT, 113, 'Expected 113 dishes from the current menu data');
assert.equal(ALL_ITEMS.length, 113, 'ALL_ITEMS count must match the full menu');

// Verify stable IDs, category references, dietary flags, and price structures.
const ids = new Set();
let halfFullCount = 0;

for (const category of MENU) {
  assert.ok(category.name.trim(), 'Every category needs a name');
  assert.ok(Array.isArray(category.items), 'Items must be an array for ' + category.name);

  for (const item of category.items) {
    assert.ok(item.id && item.name.trim(), 'Every dish needs an ID and name');
    assert.equal(item.category, category.name, item.name + ' must reference its containing category');
    assert.equal(typeof item.veg, 'boolean', item.name + ' must have an explicit dietary classification');
    assert.ok(!ids.has(item.id), 'Duplicate menu item ID: ' + item.id);
    ids.add(item.id);

    if (item.sizes) {
      halfFullCount++;
      assert.equal(item.sizes.length, 2, item.name + ' must have Half and Full options');
      assert.deepEqual(
        Array.from(item.sizes, (option) => option.label),
        ['Half', 'Full'],
        item.name + ' size labels must be ordered Half / Full',
      );

      for (const option of item.sizes) {
        assert.ok(Number.isInteger(option.price) && option.price > 0, item.name + ' has an invalid price');
      }

      assert.ok(item.sizes[0].price <= item.sizes[1].price, item.name + ' Half price must not exceed Full price');
      assert.equal(item.price, undefined, item.name + ' must not also define a single price');
    } else {
      assert.ok(Number.isInteger(item.price) && item.price > 0, item.name + ' must have a positive integer price');
    }
  }
}

assert.equal(ids.size, ALL_ITEMS.length, 'Menu item IDs must be unique');
assert.ok(halfFullCount > 0, 'The menu should include Half/Full items');

// Keep representative values guarded against accidental changes during refactoring.
const byName = new Map(ALL_ITEMS.map((item) => [item.name, item]));
assert.equal(byName.get('Chicken Dum Biryani')?.sizes?.[0]?.price, 150);
assert.equal(byName.get('Chicken Dum Biryani')?.sizes?.[1]?.price, 250);
assert.equal(byName.get('Tandoori Chicken')?.sizes?.[0]?.price, 220);
assert.equal(byName.get('Tandoori Chicken')?.sizes?.[1]?.price, 400);
assert.equal(byName.get('Veg Noodles')?.price, 80);
assert.equal(byName.get('Family Pack Biryani')?.price, 600);

 // Confirm the specials list is a unique, scalable list of existing menu records.
const specialsSource = await readRoot('src/data/specials.ts');
const specialsBlock = specialsSource.match(
  /SPECIAL_DISH_NAMES\s*=\s*\[([\s\S]*?)\]\s*as const/,
);
assert.ok(specialsBlock, 'A SPECIAL_DISH_NAMES list must be defined');
const specialNames = [...specialsBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.ok(specialNames.length >= 5, 'The specials list must contain at least five current specials');
assert.equal(new Set(specialNames).size, specialNames.length, 'Special dish names must be unique');
for (const name of specialNames) {
  assert.ok(byName.has(name), 'Special dish must exist in the main menu data: ' + name);
}
for (const expectedSpecial of [
  'Pudina Kabab',
  'Garlic Chicken',
  'Punjabi Chicken Biryani',
  'Methi Chicken',
  'Palak Chicken',
]) {
  assert.ok(specialNames.includes(expectedSpecial), 'Missing owner-approved special: ' + expectedSpecial);
}

// Validate section headings so the menu data stays easy for the owner to navigate.
for (const heading of [
  'SOUPS',
  'STARTERS',
  'TANDOORI STARTERS',
  'BIRYANIS',
  'RICE, NOODLES AND FRIED RICE',
  'BREADS',
  'CURRIES',
]) {
  const sectionHeading = new RegExp('//\\s*\\d+\\.\\s*' + heading);
  assert.match(menuSource, sectionHeading, 'Menu data needs a numbered section heading for ' + heading);
}

// Make sure the image mapping in App.tsx and the public asset directory agree.
const appSource = await readRoot('src/App.tsx');
for (const imageFile of CATEGORY_IMAGES) {
  assert.ok(appSource.includes("'" + imageFile + "'"), 'App.tsx must map the image ' + imageFile);
  await stat(new URL('public/' + imageFile, root));
}

// Keep the owner-maintained restaurant configuration documented and separate from UI code.
const restaurantConfig = await readRoot('src/config/restaurant.ts');
assert.match(
  restaurantConfig,
  /\/\*\*[\s\S]*?Biryani Spot restaurant details/,
  'Restaurant configuration should have a file-level description',
);

// Verify the PWA manifest, its public icon, and the service-worker syntax.
new vm.Script(await readRoot('public/sw.js'), { filename: 'public/sw.js' });
const manifest = JSON.parse(await readRoot('public/manifest.webmanifest'));
assert.equal(manifest.name, 'Biryani Spot Family Restaurant');
assert.equal(manifest.start_url, './');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length, 'The PWA manifest needs an icon');

for (const icon of manifest.icons) {
  await stat(new URL('public/' + icon.src.replace(/^\.\//, ''), root));
}
await stat(new URL('public/biryani-spot-logo.png', root));
assert.match(await readRoot('public/favicon.svg'), /<svg\b/, 'favicon.svg must contain a valid SVG root element');

console.log(
  'Validation passed: 13 categories, 113 dishes, valid specials, unique IDs, valid pricing, category images, restaurant configuration, PWA metadata and service-worker syntax.',
);
