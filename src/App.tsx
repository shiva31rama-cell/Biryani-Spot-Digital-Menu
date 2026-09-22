import { useMemo, useState } from 'react';

type Size = 'single' | 'half' | 'full';
type Item = {
  id: string;
  name: string;
  price?: number;
  half?: number;
  full?: number;
  veg: boolean;
};
type Category = {
  name: string;
  icon: string;
  description: string;
  items: Item[];
};
type CartLine = {
  key: string;
  itemId: string;
  name: string;
  size: Size;
  price: number;
  qty: number;
  veg: boolean;
};

const id = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const v = (name: string, price: number): Item => ({ id: id(name), name, price, veg: true });
const n = (name: string, price: number): Item => ({ id: id(name), name, price, veg: false });
const hf = (name: string, half: number, full: number, veg = false): Item => ({ id: id(name), name, half, full, veg });
const C = (name: string, icon: string, description: string, items: Item[]): Category => ({ name, icon, description, items });

// Restaurant menu transcribed from the menu photographs supplied for this project.
// 13 categories / 111 dishes.
const MENU: Category[] = [
  C('Non-Veg Soups', '🍲', 'Warm and comforting favourites', [
    n('Chicken Hot & Sour Soup', 100), n('Chicken Manchow Soup', 100), n('Chicken Sweet Corn Soup', 100),
    n('Chicken Clear Soup', 100), n('Chicken Coriander Clear Soup', 100),
  ]),
  C('Veg Soups', '🥣', 'Light and flavourful vegetarian soups', [
    v('Veg Soup', 100), v('Veg Hot Sour Soup', 100), v('Veg Manchow Soup', 100),
    v('Veg Sweet Corn Soup', 100), v('Veg Coriander Clear Soup', 100), v('Lemon Corn Soup', 100),
  ]),
  C('Veg Starters', '🥗', 'Crispy and spicy vegetarian starters', [
    v('Veg Manchuria', 100), v('Veg 65', 100), v('Paneer Manchuria', 180), v('Paneer Chilli', 180),
    v('Paneer 65', 180), v('Mushroom Chilli', 200), v('Mushroom Manchuria', 200), v('Mushroom 65', 200),
    v('Baby Corn Chilli', 200), v('Baby Corn 65', 200), v('Baby Corn Manchuria', 200),
  ]),
  C('Non-Veg Starters', '🍗', 'Popular chicken and egg starters', [
    n('Egg Manchuria', 150), n('Egg 65', 150), n('Chilli Chicken', 200), n('Chicken Manchuria', 200),
    n('Chicken 65', 200), n('Ginger Chicken', 200), n('Dragon Chicken', 250), n('Chicken Majesty', 250),
    n('Chicken 555', 250), n('Kaju Chicken', 250), n('Chicken Lollipop (6)', 180), n('Chicken Wings (15)', 200),
    n('Lemon Chicken', 250), n('Chicken Gulzar', 300), n('Stick Chicken', 250), n('Schezwan Chicken', 200),
    n('Garlic Chicken', 200), n('Chicken Keema Balls', 300), n('Guntur Mirapakay Kodi', 300),
  ]),
  C('Tandoori Starter', '🔥', 'Tandoor favourites with half and full options', [
    hf('Tandoori Chicken', 220, 400), hf('Tandoori Kabab', 140, 280), hf('Chicken Tikka', 150, 300),
    hf('Pudina Kabab', 250, 500), hf('Pudina Tikka', 150, 300), hf('Garlic Kabab', 250, 500),
    hf('Garlic Tikka', 150, 300), hf('Lahori Kabab', 250, 500), hf('Lahori Tikka', 150, 300),
  ]),
  C('Veg Tandoori Starter', '🧀', 'Paneer, mushroom and baby corn from the tandoor', [
    v('Paneer Tikka', 200), v('Mushroom Tikka', 200), v('Baby Corn Tikka', 200),
  ]),
  C("Biryani's", '🍛', 'The signature rice dishes of Biryani Spot', [
    hf('Chicken Dum Biryani', 150, 250), hf('Chicken Fry Biryani', 150, 250), hf('Chicken Rost Biryani', 150, 250),
    hf('Mutton Dum Biryani', 300, 400), hf('Mutton Rost Biryani', 300, 400), n('Rambo Biryani', 300),
    n('Chicken Boneless Biryani', 300), n('Kabab Biryani', 300), hf('Prawns Biryani', 300, 400),
    hf('Mixed Biryani', 300, 400), n('Mughalai Biryani', 350), n('Punjabi Chicken Biryani', 300),
    n('Biryani Spot Special Biryani', 350), n('Family Pack Biryani', 600),
  ]),
  C('Veg Friedrice', '🍚', 'Freshly prepared vegetarian fried rice', [
    v('Veg Friedrice', 80), v('SP. Veg Friedrice', 200), v('Schezwan Friedrice', 120),
    v('Paneer Friedrice', 160), v('Kaju Friedrice', 160), v('Sweet Corn Friedrice', 160), v('Mushroom Friedrice', 160),
  ]),
  C('Noodles', '🍜', 'Classic wok-tossed noodles', [
    v('Veg Noodles', 80), n('Chicken Noodles', 100),
  ]),
  C('Non Veg Friedrice', '🍳', 'Chicken, egg, mixed and mutton fried rice', [
    hf('Chicken Friedrice', 100, 150), hf('Double Egg Friedrice', 100, 150), n('SP. Chicken Friedrice', 250),
    hf('Chicken Schezwan Friedrice', 120, 160), hf('Mixed Friedrice', 300, 400), n('Triple Friedrice', 250),
    hf('Mutton Friedrice', 300, 400),
  ]),
  C('Roti & Nons', '🫓', 'Tandoori breads and naan', [
    v('Tandoori Roti', 20), v('Tandoori Butter Roti', 25), v('Butter Naan', 40), v('Plain Naan', 30),
    v('Garlic Naan', 50), v('Cheese Naan', 60), v('Masala Kulcha', 70),
  ]),
  C('Veg Curries', '🥘', 'Rich vegetarian curries to pair with breads', [
    v('Paneer Curry', 150), v('Paneer Butter Masala', 150), v('Kaju Paneer', 200), v('Kaju Tamota', 150),
    v('Kaju Masala', 200), v('Palak Paneer', 150), v('Mushroom Curry', 200), v('Baby Corn Curry', 180),
  ]),
  C('Non Veg Curries', '🍗', 'Hearty curries for a complete meal', [
    n('Chicken Boneless Curry', 150), n('Butter Chicken', 150), n('Chicken Kohlapuri', 150), n('Kadai Chicken', 150),
    n('Hyderabadi Curry', 150), n('Mogalai Chicken', 200), n('Chicken Patiala Curry', 200), n('Chicken Tikka Masala', 200),
    n('Mutton Curry', 250), n('Prwans Curry', 250), n('Chicken Keema Masala', 250), n('Palak Chicken', 200), n('Methi Chicken', 200),
  ]),
];

const allItems = MENU.flatMap((category) => category.items);
const itemMap = new Map(allItems.map((item) => [item.id, item]));
const money = (value: number) => `₹${value}`;
const sizeLabel = (size: Size) => size === 'half' ? 'Half' : size === 'full' ? 'Full' : '';

export default function App() {
  const [welcome, setWelcome] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const results = useMemo(() => MENU.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      const q = query.trim().toLowerCase();
      const qMatch = !q || section.name.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
      const dietMatch = filter === 'all' || (filter === 'veg' ? item.veg : !item.veg);
      return qMatch && dietMatch;
    }),
  })).filter((section) => section.items.length && (category === 'All' || section.name === category)), [query, filter, category]);

  const lines = Object.values(cart);
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  const priceFor = (item: Item, size: Size): number => {
    if (size === 'half') return item.half ?? item.price ?? 0;
    if (size === 'full') return item.full ?? item.price ?? 0;
    return item.price ?? item.half ?? 0;
  };

  const addToCart = (item: Item, size: Size = 'single') => {
    const key = `${item.id}-${size}`;
    setCart((current) => {
      const existing = current[key];
      return {
        ...current,
        [key]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { key, itemId: item.id, name: item.name, size, price: priceFor(item, size), qty: 1, veg: item.veg },
      };
    });
  };

  const changeQty = (key: string, delta: number) => {
    setCart((current) => {
      const existing = current[key];
      if (!existing) return current;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: { ...existing, qty: nextQty } };
    });
  };

  const clearCart = () => setCart({});
  const browse = () => {
    setWelcome(false);
    setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 40);
  };
  const chooseCategory = (name: string) => {
    setCategory(name);
    setQuery('');
    setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 40);
  };

  if (welcome) {
    return (
      <div className="welcome-screen">
        <div className="welcome-glow glow-one" />
        <div className="welcome-glow glow-two" />
        <div className="welcome-card">
          <div className="brand-mark">🍛</div>
          <span className="eyebrow">BIRYANI SPOT · DIGITAL MENU</span>
          <h1>Good food.<br /><em>Good moments.</em></h1>
          <p>Explore the restaurant menu with clear categories, prices and simple ordering controls.</p>
          <button className="primary-button large-button" onClick={browse}>Explore Menu <span>→</span></button>
          <div className="welcome-stats">
            <span><strong>{allItems.length}</strong> dishes</span>
            <span><strong>13</strong> categories</span>
            <span><strong>Veg</strong> & Non-Veg</span>
          </div>
          <small>Prices shown from the supplied restaurant menu.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => { setCategory('All'); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="mini-logo">🍛</span>
          <span><strong>Biryani Spot</strong><small>Digital Menu</small></span>
        </button>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Open order list">
          🛒 <span>Order List</span>{itemCount > 0 && <b>{itemCount}</b>}
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-kicker">🍽️ BIRYANI · TANDOORI · MULTI CUISINE</span>
            <h2>Made for sharing,<br /><em>made to remember.</em></h2>
            <p>Find biryanis, starters, tandoori favourites, fried rice, noodles, breads and curries in one clean menu.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>Browse Categories</button>
              <button className="secondary-button" onClick={() => chooseCategory("Biryani's")}>🍛 Biryani</button>
            </div>
          </div>
          <div className="hero-food-art" aria-hidden="true"><span>🍛</span><small>FAMILY FAVOURITE</small></div>
        </section>

        <section className="category-area" id="categories">
          <div className="section-intro"><span className="eyebrow">EXPLORE</span><h2>Choose your craving</h2><p>Jump to a section or search the complete menu.</p></div>
          <div className="category-pills">
            <button className={`category-pill ${category === 'All' ? 'active' : ''}`} onClick={() => chooseCategory('All')}>✨ All</button>
            {MENU.map((section) => <button key={section.name} className={`category-pill ${category === section.name ? 'active' : ''}`} onClick={() => chooseCategory(section.name)}><span>{section.icon}</span>{section.name}</button>)}
          </div>
        </section>

        <section className="menu-toolbar">
          <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes, starters, biryani..." />{query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}</div>
          <div className="diet-buttons">
            <button className={`diet-button ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`diet-button veg ${filter === 'veg' ? 'active' : ''}`} onClick={() => setFilter('veg')}>● Veg</button>
            <button className={`diet-button nonveg ${filter === 'nonveg' ? 'active' : ''}`} onClick={() => setFilter('nonveg')}>● Non-Veg</button>
          </div>
        </section>

        <section className="menu-area" id="menu">
          <div className="menu-heading"><div><span className="eyebrow">OUR MENU</span><h2>{category === 'All' ? 'Something for everyone' : category}</h2></div><span>{results.reduce((sum, section) => sum + section.items.length, 0)} dishes</span></div>
          {!results.length ? (
            <div className="empty-state"><div>🍽️</div><h3>No dishes found</h3><p>Try another search or reset the filters.</p><button className="secondary-button" onClick={() => { setQuery(''); setFilter('all'); setCategory('All'); }}>Reset Menu</button></div>
          ) : results.map((section) => (
            <section className="category-section" key={section.name}>
              <div className="category-heading"><div className="category-icon">{section.icon}</div><div><h3>{section.name}</h3><p>{section.description}</p></div><span>{section.items.length}</span></div>
              <div className="dish-grid">
                {section.items.map((item) => (
                  <article className="dish-card" key={`${section.name}-${item.id}`}>
                    <div className={`dish-art ${item.veg ? 'veg-art' : 'nonveg-art'}`}><span>{item.veg ? '🥗' : '🍗'}</span><small>{item.veg ? 'VEG' : 'NON-VEG'}</small></div>
                    <div className="dish-info">
                      <div className="dish-title"><h4>{item.name}</h4><i className={item.veg ? 'veg-dot' : 'nonveg-dot'} /></div>
                      {item.half != null && item.full != null ? (
                        <>
                          <div className="size-price"><span>Half <strong>{money(item.half)}</strong></span><span>Full <strong>{money(item.full)}</strong></span></div>
                          <div className="size-actions"><button onClick={() => addToCart(item, 'half')}>+ Half</button><button onClick={() => addToCart(item, 'full')}>+ Full</button></div>
                        </>
                      ) : (
                        <div className="single-price"><strong>{money(item.price ?? 0)}</strong><button className="add-button" onClick={() => addToCart(item)}>+ Add to order</button></div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="family-note"><div className="family-icon">♥</div><div><span className="eyebrow">A TABLE FOR EVERYONE</span><h2>Come hungry, leave happy.</h2><p>From a quick starter to a family biryani, choose what suits your table.</p></div><button className="secondary-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></section>
      </main>

      <footer className="footer"><div><span className="mini-logo">🍛</span><strong>Biryani Spot</strong></div><p>Digital menu · {allItems.length} dishes · Prices from restaurant menu</p></footer>

      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}>
        <aside className="cart-panel" onClick={(event) => event.stopPropagation()}>
          <div className="cart-header"><div><span className="eyebrow">YOUR SELECTION</span><h2>Order List</h2></div><button className="close-button" onClick={() => setCartOpen(false)} aria-label="Close order list">×</button></div>
          {!lines.length ? (
            <div className="cart-empty"><div>🛒</div><h3>Your list is empty</h3><p>Add dishes from the menu to see them here.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Continue browsing</button></div>
          ) : (
            <>
              <div className="cart-items">
                {lines.map((line) => <div className="cart-item" key={line.key}>
                  <div className="cart-item-art">{line.veg ? '🥗' : '🍗'}</div>
                  <div className="cart-item-main"><strong>{line.name}</strong>{line.size !== 'single' && <small>{sizeLabel(line.size)}</small>}<span>{money(line.price)} each</span></div>
                  <div className="quantity-control"><button onClick={() => changeQty(line.key, -1)}>−</button><b>{line.qty}</b><button onClick={() => changeQty(line.key, 1)}>+</button></div>
                </div>)}
              </div>
              <div className="cart-summary"><div><span>Items</span><strong>{itemCount}</strong></div><div><span>Total</span><strong>{money(total)}</strong></div><p>This is an order list for menu browsing. Final ordering/payment can be connected later.</p><button className="clear-button" onClick={clearCart}>Clear list</button></div>
            </>
          )}
        </aside>
      </div>}
    </div>
  );
}

void itemMap;
