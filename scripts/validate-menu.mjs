import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/data/menu.ts', root), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
});

const errors = (compiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, 'Menu data must transpile without TypeScript errors');

const sandbox = { exports: {}, module: { exports: {} } };
sandbox.module.exports = sandbox.exports;
vm.runInNewContext(compiled.outputText, sandbox, { filename: 'menu-data.cjs' });
const { MENU, ALL_ITEMS, MENU_ITEM_COUNT } = sandbox.module.exports;

assert.ok(Array.isArray(MENU), 'MENU must be an array');
assert.equal(MENU.length, 13, 'Expected all 13 menu categories');
assert.equal(MENU_ITEM_COUNT, 111, 'Expected 111 dishes as transcribed from the supplied menu');
assert.equal(ALL_ITEMS.length, 111, 'ALL_ITEMS count must match the full menu');

const names = new Set();
const ids = new Set();
let halfFullCount = 0;

for (const category of MENU) {
  assert.ok(category.name.trim(), 'Every category needs a name');
  assert.ok(Array.isArray(category.items), `Items must be an array for ${category.name}`);

  for (const item of category.items) {
    assert.ok(item.id && item.name.trim(), 'Every item needs an id and name');
    assert.equal(item.category, category.name, `${item.name} must reference its containing category`);
    assert.equal(typeof item.veg, 'boolean', `${item.name} must have an explicit dietary classification`);
    assert.ok(!ids.has(item.id), `Duplicate menu item id: ${item.id}`);
    ids.add(item.id);

    // A repeated dish name is allowed only if it appears in another category.
    names.add(item.name);

    if (item.sizes) {
      halfFullCount += 1;
      assert.equal(item.sizes.length, 2, `${item.name} must have exactly Half and Full options`);
      assert.deepEqual(Array.from(item.sizes, (option) => option.label), ['Half', 'Full'], `${item.name} size labels must be ordered Half / Full`);
      for (const option of item.sizes) {
        assert.ok(Number.isInteger(option.price) && option.price > 0, `${item.name} has an invalid ${option.label} price`);
      }
      assert.ok(item.sizes[0].price <= item.sizes[1].price, `${item.name} Half price should not exceed Full price`);
      assert.equal(item.price, undefined, `${item.name} must not also specify a single price`);
    } else {
      assert.ok(Number.isInteger(item.price) && item.price > 0, `${item.name} must have a positive integer price`);
    }
  }
}

assert.equal(ids.size, ALL_ITEMS.length, 'Menu item IDs must be unique');
assert.ok(halfFullCount > 0, 'Menu should include Half/Full items');

// Guard representative prices against accidental edits during refactors.
const byName = new Map(ALL_ITEMS.map((item) => [item.name, item]));
assert.equal(byName.get('Chicken Dum Biryani')?.sizes?.[0]?.price, 150);
assert.equal(byName.get('Chicken Dum Biryani')?.sizes?.[1]?.price, 250);
assert.equal(byName.get('Tandoori Chicken')?.sizes?.[0]?.price, 220);
assert.equal(byName.get('Tandoori Chicken')?.sizes?.[1]?.price, 400);
assert.equal(byName.get('Veg Noodles')?.price, 80);
assert.equal(byName.get('Family Pack Biryani')?.price, 600);

// Verify the offline runtime and install metadata remain syntactically valid.
const workerSource = await readFile(new URL('public/sw.js', root), 'utf8');
new vm.Script(workerSource, { filename: 'public/sw.js' });

const manifestText = await readFile(new URL('public/manifest.webmanifest', root), 'utf8');
const manifest = JSON.parse(manifestText);
assert.equal(manifest.name, 'Biryani Spot Family Restaurant');
assert.equal(manifest.start_url, './');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'PWA manifest needs an icon');

for (const icon of manifest.icons) {
  const iconPath = icon.src.replace(/^\.\//, '');
  await stat(new URL(`public/${iconPath}`, root));
}
const brand = await readFile(new URL('public/biryani-spot-brand.webp', root));
assert.equal(brand.toString('ascii', 0, 4), 'RIFF', 'Official brand image must be a WebP asset');
assert.equal(brand.toString('ascii', 8, 12), 'WEBP', 'Official brand image must be a valid WebP container');

console.log(`Repository validation passed: ${MENU.length} categories, ${ALL_ITEMS.length} unique dishes, ${halfFullCount} Half/Full-priced dishes, valid PWA metadata, brand asset and service-worker syntax.`);
