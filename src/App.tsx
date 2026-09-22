import { useMemo, useState } from 'react';

type SizeOption = {
  label: 'Half' | 'Full';
  price: number;
};

type Item = {
  id: string;
  name: string;
  veg: boolean;
  price?: number;
  sizes?: SizeOption[];
};

type Category = {
  name: string;
  short: string;
  description: string;
  items: Item[];
};

type Selection = Record<
  string,
  {
    item: Item;
    option?: SizeOption;
    qty: number;
  }
>;

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const veg = (name: string, price: number): Item => ({
  id: slug(name),
  name,
  price,
  veg: true,
});

const nonVeg = (name: string, price: number): Item => ({
  id: slug(name),
  name,
  price,
  veg: false,
});

const sizes = (
  name: string,
  half: number,
  full: number,
  isVeg = false,
): Item => ({
  id: slug(name),
  name,
  veg: isVeg,
  sizes: [
    { label: 'Half', price: half },
    { label: 'Full', price: full },
  ],
});

const category = (
  name: string,
  short: string,
  description: string,
  items: Item[],
): Category => ({
  name,
  short,
  description,
  items,
});

// Prices transcribed from the restaurant's printed menu supplied for this project.
const MENU: Category[] = [
  category('Non-Veg Soups', 'NV', 'Warm and comforting favourites', [
    nonVeg('Chicken Hot & Sour Soup', 100),
    nonVeg('Chicken Manchow Soup', 100),
    nonVeg('Chicken Sweet Corn Soup', 100),
    nonVeg('Chicken Clear Soup', 100),
    nonVeg('Chicken Coriander Clear Soup', 100),
  ]),
  category('Veg Soups', 'VG', 'Light and flavourful vegetarian soups', [
    veg('Veg Soup', 100),
    veg('Veg Hot Sour Soup', 100),
    veg('Veg Manchow Soup', 100),
    veg('Veg Sweet Corn Soup', 100),
    veg('Veg Coriander Clear Soup', 100),
    veg('Lemon Corn Soup', 100),
  ]),
  category('Veg Starters', 'VG', 'Crispy and spicy vegetarian starters', [
    veg('Veg Manchuria', 100),
    veg('Veg 65', 100),
    veg('Paneer Manchuria', 180),
    veg('Paneer Chilli', 180),
    veg('Paneer 65', 180),
    veg('Mushroom Chilli', 200),
    veg('Mushroom Manchuria', 200),
    veg('Mushroom 65', 200),
    veg('Baby Corn Chilli', 200),
    veg('Baby Corn 65', 200),
    veg('Baby Corn Manchuria', 200),
  ]),
  category('Non-Veg Starters', 'NV', 'Popular chicken and egg starters', [
    nonVeg('Egg Manchuria', 150),
    nonVeg('Egg 65', 150),
    nonVeg('Chilli Chicken', 200),
    nonVeg('Chicken Manchuria', 200),
    nonVeg('Chicken 65', 200),
    nonVeg('Ginger Chicken', 200),
    nonVeg('Dragon Chicken', 250),
    nonVeg('Chicken Majesty', 250),
    nonVeg('Chicken 555', 250),
    nonVeg('Kaju Chicken', 250),
    nonVeg('Chicken Lollipop (6)', 180),
    nonVeg('Chicken Wings (15)', 200),
    nonVeg('Lemon Chicken', 250),
    nonVeg('Chicken Gulzar', 300),
    nonVeg('Stick Chicken', 250),
    nonVeg('Schezwan Chicken', 200),
    nonVeg('Garlic Chicken', 200),
    nonVeg('Chicken Keema Balls', 300),
    nonVeg('Guntur Mirapakay Kodi', 300),
  ]),
  category('Tandoori Starter', 'T', 'Tandoor favourites with half and full options', [
    sizes('Tandoori Chicken', 220, 400),
    sizes('Tandoori Kabab', 140, 280),
    sizes('Chicken Tikka', 150, 300),
    sizes('Pudina Kabab', 250, 500),
    sizes('Pudina Tikka', 150, 300),
    sizes('Garlic Kabab', 250, 500),
    sizes('Garlic Tikka', 150, 300),
    sizes('Lahori Kabab', 250, 500),
    sizes('Lahori Tikka', 150, 300),
  ]),
  category(
    'Veg Tandoori Starter',
    'VG',
    'Paneer, mushroom and baby corn from the tandoor',
    [
      veg('Paneer Tikka', 200),
      veg('Mushroom Tikka', 200),
      veg('Baby Corn Tikka', 200),
    ],
  ),
  category("Biryani's", 'B', 'The signature rice dishes of Biryani Spot', [
    sizes('Chicken Dum Biryani', 150, 250),
    sizes('Chicken Fry Biryani', 150, 250),
    sizes('Chicken Rost Biryani', 150, 250),
    sizes('Mutton Dum Biryani', 300, 400),
    sizes('Mutton Rost Biryani', 300, 400),
    nonVeg('Rambo Biryani', 300),
    nonVeg('Chicken Boneless Biryani', 300),
    nonVeg('Kabab Biryani', 300),
    sizes('Prawns Biryani', 300, 400),
    sizes('Mixed Biryani', 300, 400),
    nonVeg('Mughalai Biryani', 350),
    nonVeg('Punjabi Chicken Biryani', 300),
    nonVeg('Biryani Spot Special Biryani', 350),
    nonVeg('Family Pack Biryani', 600),
  ]),
  category('Veg Friedrice', 'FR', 'Freshly prepared vegetarian fried rice', [
    veg('Veg Friedrice', 80),
    veg('SP. Veg Friedrice', 200),
    veg('Schezwan Friedrice', 120),
    veg('Paneer Friedrice', 160),
    veg('Kaju Friedrice', 160),
    veg('Sweet Corn Friedrice', 160),
    veg('Mushroom Friedrice', 160),
  ]),
  category('Noodles', 'NO', 'Classic wok-tossed noodles', [
    veg('Veg Noodles', 80),
    nonVeg('Chicken Noodles', 100),
  ]),
  category('Non Veg Friedrice', 'FR', 'Chicken, egg, mixed and mutton fried rice', [
    sizes('Chicken Friedrice', 100, 150),
    sizes('Double Egg Friedrice', 100, 150),
    nonVeg('SP. Chicken Friedrice', 250),
    sizes('Chicken Schezwan Friedrice', 120, 160),
    sizes('Mixed Friedrice', 300, 400),
    nonVeg('Triple Friedrice', 250),
    sizes('Mutton Friedrice', 300, 400),
  ]),
  category('Roti & Naan', 'RN', 'Tandoori breads and naan', [
    veg('Tandoori Roti', 20),
    veg('Tandoori Butter Roti', 25),
    veg('Butter Naan', 40),
    veg('Plain Naan', 30),
    veg('Garlic Naan', 50),
    veg('Cheese Naan', 60),
    veg('Masala Kulcha', 70),
  ]),
  category('Veg Curries', 'VG', 'Rich vegetarian curries to pair with breads', [
    veg('Paneer Curry', 150),
    veg('Paneer Butter Masala', 150),
    veg('Kaju Paneer', 200),
    veg('Kaju Tamota', 150),
    veg('Kaju Masala', 200),
    veg('Palak Paneer', 150),
    veg('Mushroom Curry', 200),
    veg('Baby Corn Curry', 180),
  ]),
  category('Non Veg Curries', 'NV', 'Hearty curries for a complete meal', [
    nonVeg('Chicken Boneless Curry', 150),
    nonVeg('Butter Chicken', 150),
    nonVeg('Chicken Kohlapuri', 150),
    nonVeg('Kadai Chicken', 150),
    nonVeg('Hyderabadi Curry', 150),
    nonVeg('Mogalai Chicken', 200),
    nonVeg('Chicken Patiala Curry', 200),
    nonVeg('Chicken Tikka Masala', 200),
    nonVeg('Mutton Curry', 250),
    nonVeg('Prawns Curry', 250),
    nonVeg('Chicken Keema Masala', 250),
    nonVeg('Palak Chicken', 200),
    nonVeg('Methi Chicken', 200),
  ]),
];

const allItems = MENU.flatMap((section) => section.items);
const itemCount = allItems.length;

const priceLabel = (item: Item) =>
  item.sizes
    ? `₹${item.sizes[0].price} / ₹${item.sizes[1].price}`
    : `₹${item.price}`;

export default function App() {
  const [welcome, setWelcome] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [section, setSection] = useState('All');
  const [selection, setSelection] = useState<Selection>({});
  const [selectionOpen, setSelectionOpen] = useState(false);

  const visibleSections = useMemo(() => {
    const q = query.trim().toLowerCase();

    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          group.name.toLowerCase().includes(q);
        const matchesFilter =
          filter === 'all' || (filter === 'veg' ? item.veg : !item.veg);

        return matchesSearch && matchesFilter;
      }),
    })).filter(
      (group) =>
        group.items.length && (section === 'All' || group.name === section),
    );
  }, [query, filter, section]);

  const selected = Object.values(selection);
  const selectedCount = selected.reduce((sum, entry) => sum + entry.qty, 0);
  const selectedTotal = selected.reduce(
    (sum, entry) =>
      sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty,
    0,
  );

  const scrollToMenu = () => {
    setTimeout(() => {
      document
        .getElementById('menu')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const browse = () => {
    setWelcome(false);
    scrollToMenu();
  };

  const chooseSection = (name: string) => {
    setSection(name);
    setQuery('');
    scrollToMenu();
  };

  const addItem = (item: Item, option?: SizeOption) => {
    const key = `${item.id}-${option?.label ?? 'single'}`;

    setSelection((current) => ({
      ...current,
      [key]: {
        item,
        option,
        qty: (current[key]?.qty ?? 0) + 1,
      },
    }));
  };

  const changeQty = (key: string, delta: number) =>
    setSelection((current) => {
      const entry = current[key];

      if (!entry) {
        return current;
      }

      const qty = entry.qty + delta;
      const next = { ...current };

      if (qty <= 0) {
        delete next[key];
      } else {
        next[key] = { ...entry, qty };
      }

      return next;
    });

  const clearSelection = () => setSelection({});

  if (welcome) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <img
            src="/brand-logo.svg"
            className="welcome-logo"
            alt="Biryani Spot Family Restaurant"
          />
          <span className="eyebrow">DIGITAL MENU</span>
          <h1>
            Good food, shared
            <br />
            <em>with family.</em>
          </h1>
          <p>
            Explore the complete restaurant menu, check printed-menu prices and
            make a simple table selection.
          </p>
          <button
            className="primary-button welcome-button"
            onClick={browse}
          >
            View Menu <span>→</span>
          </button>
          <div className="welcome-stats">
            <span>
              <b>{itemCount}</b> dishes
            </span>
            <span>
              <b>Veg</b> &amp; Non-Veg
            </span>
            <span>
              <b>Half</b> &amp; Full choices
            </span>
          </div>
          <small>
            Menu prices are transcribed from the restaurant&apos;s supplied
            printed menu.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand-button"
          onClick={() => {
            setSection('All');
            setQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Biryani Spot home"
        >
          <img src="/brand-logo.svg" alt="" />
          <span>
            <strong>Biryani Spot</strong>
            <small>Family Restaurant</small>
          </span>
        </button>

        <button
          className="cart-button"
          onClick={() => setSelectionOpen(true)}
          aria-label="Open my selection"
        >
          <span className="cart-symbol">+</span>
          <span>My Selection</span>
          {selectedCount > 0 && <b>{selectedCount}</b>}
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-kicker">
              BIRYANI • TANDOORI • MULTI CUISINE
            </span>
            <h2>
              A familiar table.
              <br />
              <em>A memorable meal.</em>
            </h2>
            <p>
              Take your time, explore the menu and find something everyone at
              the table will enjoy.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById('categories')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Browse Categories
              </button>
              <button
                className="secondary-button"
                onClick={() => chooseSection("Biryani's")}
              >
                Biryani Specials
              </button>
            </div>
          </div>

          <div className="hero-brand-panel">
            <img src="/brand-logo.svg" alt="Biryani Spot" />
            <div>
              <strong>Family Restaurant</strong>
              <span>Good food • Great people</span>
            </div>
          </div>
        </section>

        <section className="quick-strip" id="categories">
          <div className="section-intro">
            <span className="eyebrow">EXPLORE THE MENU</span>
            <h2>Choose your section</h2>
            <p>
              Jump directly to a category or search the complete menu.
            </p>
          </div>

          <div className="category-pills">
            <button
              className={
                section === 'All'
                  ? 'category-pill active'
                  : 'category-pill'
              }
              onClick={() => chooseSection('All')}
            >
              All dishes
            </button>

            {MENU.map((group) => (
              <button
                key={group.name}
                className={
                  section === group.name
                    ? 'category-pill active'
                    : 'category-pill'
                }
                onClick={() => chooseSection(group.name)}
              >
                <span>{group.short}</span>
                {group.name}
              </button>
            ))}
          </div>
        </section>

        <section className="menu-toolbar">
          <label className="search-box">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a dish or category"
              aria-label="Search menu"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="diet-buttons">
            <button
              className={
                filter === 'all' ? 'diet-button active' : 'diet-button'
              }
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={
                filter === 'veg'
                  ? 'diet-button active veg'
                  : 'diet-button veg'
              }
              onClick={() => setFilter('veg')}
            >
              <i /> Veg
            </button>
            <button
              className={
                filter === 'nonveg'
                  ? 'diet-button active nonveg'
                  : 'diet-button nonveg'
              }
              onClick={() => setFilter('nonveg')}
            >
              <i /> Non-Veg
            </button>
          </div>
        </section>

        <section className="menu-area" id="menu">
          <div className="menu-heading">
            <div>
              <span className="eyebrow">OUR MENU</span>
              <h2>
                {section === 'All' ? 'Something for everyone' : section}
              </h2>
            </div>
            <span>
              {visibleSections.reduce(
                (sum, group) => sum + group.items.length,
                0,
              )}{' '}
              dishes
            </span>
          </div>

          {!visibleSections.length ? (
            <div className="empty-state">
              <div className="empty-mark">⌕</div>
              <h3>No dishes found</h3>
              <p>Try another search or reset the filters.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                  setSection('All');
                }}
              >
                Reset Menu
              </button>
            </div>
          ) : (
            visibleSections.map((group) => (
              <section className="category-section" key={group.name}>
                <div className="category-heading">
                  <div className="category-icon">{group.short}</div>
                  <div>
                    <h3>{group.name}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span>{group.items.length}</span>
                </div>

                <div className="dish-grid">
                  {group.items.map((item) => {
                    const singleKey = `${item.id}-single`;
                    const halfKey = `${item.id}-Half`;
                    const fullKey = `${item.id}-Full`;

                    return (
                      <article
                        className="dish-card"
                        key={`${group.name}-${item.id}`}
                      >
                        <div
                          className={
                            item.veg
                              ? 'dish-art veg-art'
                              : 'dish-art nonveg-art'
                          }
                        >
                          <span className="dish-initial">
                            {item.name.charAt(0)}
                          </span>
                          <small>{item.veg ? 'VEG' : 'NON-VEG'}</small>
                        </div>

                        <div className="dish-info">
                          <div className="dish-title">
                            <h4>{item.name}</h4>
                            <i
                              className={
                                item.veg ? 'veg-dot' : 'nonveg-dot'
                              }
                              aria-label={
                                item.veg
                                  ? 'Vegetarian'
                                  : 'Non-vegetarian'
                              }
                            />
                          </div>

                          <div className="price-row">
                            <div>
                              <small>
                                {item.sizes ? 'Half / Full' : 'Price'}
                              </small>
                              <strong>{priceLabel(item)}</strong>
                            </div>
                            {item.sizes && (
                              <span className="option-tag">2 choices</span>
                            )}
                          </div>

                          {item.sizes ? (
                            <div className="size-actions">
                              <button
                                className="size-button"
                                onClick={() => addItem(item, item.sizes![0])}
                              >
                                Half <b>₹{item.sizes[0].price}</b>
                                {selection[halfKey] && (
                                  <em>{selection[halfKey].qty}</em>
                                )}
                              </button>
                              <button
                                className="size-button"
                                onClick={() => addItem(item, item.sizes![1])}
                              >
                                Full <b>₹{item.sizes[1].price}</b>
                                {selection[fullKey] && (
                                  <em>{selection[fullKey].qty}</em>
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              className={
                                selection[singleKey]
                                  ? 'add-button added'
                                  : 'add-button'
                              }
                              onClick={() => addItem(item)}
                            >
                              <span>+</span>
                              {selection[singleKey]
                                ? `${selection[singleKey].qty} added`
                                : 'Add to selection'}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </section>

        <section className="family-note">
          <div className="family-icon">BS</div>
          <div>
            <span className="eyebrow">A TABLE FOR EVERYONE</span>
            <h2>Come hungry, leave happy.</h2>
            <p>
              From a quick starter to a family biryani, choose what suits your
              table.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top ↑
          </button>
        </section>
      </main>

      <footer className="footer">
        <div>
          <img src="/brand-logo.svg" alt="" />
          <strong>Biryani Spot</strong>
        </div>
        <p>
          Digital menu • Prices shown from the restaurant&apos;s supplied printed
          menu
        </p>
      </footer>

      {selectionOpen && (
        <div
          className="cart-overlay"
          onClick={() => setSelectionOpen(false)}
        >
          <aside
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR TABLE LIST</span>
                <h2>My Selection</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setSelectionOpen(false)}
                aria-label="Close selection"
              >
                ×
              </button>
            </div>

            {!selected.length ? (
              <div className="cart-empty">
                <div className="empty-mark">+</div>
                <h3>Your selection is empty</h3>
                <p>
                  Add dishes from the menu to keep a quick list for your table.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setSelectionOpen(false)}
                >
                  Continue browsing
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {selected.map((entry) => {
                    const key = `${entry.item.id}-${entry.option?.label ?? 'single'}`;

                    return (
                      <div className="cart-item" key={key}>
                        <div className="cart-item-art">
                          {entry.item.name.charAt(0)}
                        </div>
                        <div className="cart-item-main">
                          <strong>{entry.item.name}</strong>
                          <small>
                            {entry.option?.label ?? 'Regular'} • ₹
                            {entry.option?.price ?? entry.item.price}
                          </small>
                        </div>
                        <div className="quantity-control">
                          <button
                            onClick={() => changeQty(key, -1)}
                            aria-label={`Remove one ${entry.item.name}`}
                          >
                            −
                          </button>
                          <b>{entry.qty}</b>
                          <button
                            onClick={() => changeQty(key, 1)}
                            aria-label={`Add one ${entry.item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Items</span>
                    <strong>{selectedCount}</strong>
                  </div>
                  <div>
                    <span>Menu total</span>
                    <strong>₹{selectedTotal}</strong>
                  </div>
                  <p>
                    This is a menu-selection helper, not an online payment or
                    ordering system. Please confirm the final order and price
                    with restaurant staff.
                  </p>
                  <button
                    className="primary-button full-button"
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
