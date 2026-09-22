import { useMemo, useState } from 'react';

type Item = { id: string; name: string; price?: number; half?: number; full?: number; veg: boolean };
type Category = { name: string; icon: string; description: string; items: Item[] };
type Cart = Record<string, number>;

const id = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const v = (name: string, price: number): Item => ({ id: id(name), name, price, veg: true });
const n = (name: string, price: number): Item => ({ id: id(name), name, price, veg: false });
const hf = (name: string, half: number, full: number, veg = false): Item => ({ id: id(name), name, half, full, veg });
const C = (name: string, icon: string, description: string, items: Item[]): Category => ({ name, icon, description, items });

const MENU: Category[] = [
  C('Non-Veg Soups','🍲','Warm and comforting favourites',[n('Chicken Hot & Sour Soup',100),n('Chicken Manchow Soup',100),n('Chicken Sweet Corn Soup',100),n('Chicken Clear Soup',100),n('Chicken Coriander Clear Soup',100)]),
  C('Veg Soups','🥣','Light and flavourful vegetarian soups',[v('Veg Soup',100),v('Veg Hot Sour Soup',100),v('Veg Manchow Soup',100),v('Veg Sweet Corn Soup',100),v('Veg Coriander Clear Soup',100),v('Lemon Corn Soup',100)]),
  C('Veg Starters','🥗','Crispy and spicy vegetarian starters',[v('Veg Manchuria',100),v('Veg 65',100),v('Paneer Manchuria',180),v('Paneer Chilli',180),v('Paneer 65',180),v('Mushroom Chilli',200),v('Mushroom Manchuria',200),v('Mushroom 65',200),v('Baby Corn Chilli',200),v('Baby Corn 65',200),v('Baby Corn Manchuria',200)]),
  C('Non-Veg Starters','🍗','Popular chicken and egg starters',[n('Egg Manchuria',150),n('Egg 65',150),n('Chilli Chicken',200),n('Chicken Manchuria',200),n('Chicken 65',200),n('Ginger Chicken',200),n('Dragon Chicken',250),n('Chicken Majesty',250),n('Chicken 555',250),n('Kaju Chicken',250),n('Chicken Lollipop (6)',180),n('Chicken Wings (15)',200),n('Lemon Chicken',250),n('Chicken Gulzar',300),n('Stick Chicken',250),n('Schezwan Chicken',200),n('Garlic Chicken',200),n('Chicken Keema Balls',300),n('Guntur Mirapakay Kodi',300)]),
  C('Tandoori Starter','🔥','Tandoor favourites with half and full options',[hf('Tandoori Chicken',220,400),hf('Tandoori Kabab',140,280),hf('Chicken Tikka',150,300),hf('Pudina Kabab',250,500),hf('Pudina Tikka',150,300),hf('Garlic Kabab',250,500),hf('Garlic Tikka',150,300),hf('Lahori Kabab',250,500),hf('Lahori Tikka',150,300)]),
  C('Veg Tandoori Starter','🧀','Paneer, mushroom and baby corn from the tandoor',[v('Paneer Tikka',200),v('Mushroom Tikka',200),v('Baby Corn Tikka',200)]),
  C("Biryani's",'🍛','The signature rice dishes of Biryani Spot',[hf('Chicken Dum Biryani',150,250),hf('Chicken Fry Biryani',150,250),hf('Chicken Rost Biryani',150,250),hf('Mutton Dum Biryani',300,400),hf('Mutton Rost Biryani',300,400),n('Rambo Biryani',300),n('Chicken Boneless Biryani',300),n('Kabab Biryani',300),hf('Prawns Biryani',300,400),hf('Mixed Biryani',300,400),n('Mughalai Biryani',350),n('Punjabi Chicken Biryani',300),n('Biryani Spot Special Biryani',350),n('Family Pack Biryani',600)]),
  C('Veg Friedrice','🍚','Freshly prepared vegetarian fried rice',[v('Veg Friedrice',80),v('SP. Veg Friedrice',200),v('Schezwan Friedrice',120),v('Paneer Friedrice',160),v('Kaju Friedrice',160),v('Sweet Corn Friedrice',160),v('Mushroom Friedrice',160)]),
  C('Noodles','🍜','Classic wok-tossed noodles',[v('Veg Noodles',80),n('Chicken Noodles',100)]),
  C('Non Veg Friedrice','🍳','Chicken, egg, mixed and mutton fried rice',[hf('Chicken Friedrice',100,150),hf('Double Egg Friedrice',100,150),n('SP. Chicken Friedrice',250),hf('Chicken Schezwan Friedrice',120,160),hf('Mixed Friedrice',300,400),n('Triple Friedrice',250),hf('Mutton Friedrice',300,400)]),
  C('Roti & Nons','🫓','Tandoori breads and naan',[v('Tandoori Roti',20),v('Tandoori Butter Roti',25),v('Butter Naan',40),v('Plain Naan',30),v('Garlic Naan',50),v('Cheese Naan',60),v('Masala Kulcha',70)]),
  C('Veg Curries','🥘','Rich vegetarian curries to pair with breads',[v('Paneer Curry',150),v('Paneer Butter Masala',150),v('Kaju Paneer',200),v('Kaju Tamota',150),v('Kaju Masala',200),v('Palak Paneer',150),v('Mushroom Curry',200),v('Baby Corn Curry',180)]),
  C('Non Veg Curries','🍗','Hearty curries for a complete meal',[n('Chicken Boneless Curry',150),n('Butter Chicken',150),n('Chicken Kohlapuri',150),n('Kadai Chicken',150),n('Hyderabadi Curry',150),n('Mogalai Chicken',200),n('Chicken Patiala Curry',200),n('Chicken Tikka Masala',200),n('Mutton Curry',250),n('Prwans Curry',250),n('Chicken Keema Masala',250),n('Palak Chicken',200),n('Methi Chicken',200)])
];

const price = (item: Item) => item.half != null ? `₹${item.half} / ₹${item.full}` : `₹${item.price}`;
const basePrice = (item: Item) => item.price ?? item.half ?? 0;

export default function App() {
  const [welcome,setWelcome] = useState(true);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState<'all'|'veg'|'nonveg'>('all');
  const [category,setCategory] = useState('All');
  const [cart,setCart] = useState<Cart>({});
  const [cartOpen,setCartOpen] = useState(false);
  const allItems = useMemo(() => MENU.flatMap(c => c.items), []);
  const cartItems = allItems.filter(i => cart[i.id]);
  const count = Object.values(cart).reduce((a,b) => a+b, 0);
  const total = cartItems.reduce((a,i) => a + basePrice(i) * cart[i.id], 0);
  const results = useMemo(() => MENU.map(c => ({...c,items:c.items.filter(i => {
    const q = query.trim().toLowerCase();
    const qMatch = !q || c.name.toLowerCase().includes(q) || i.name.toLowerCase().includes(q);
    const fMatch = filter === 'all' || (filter === 'veg' ? i.veg : !i.veg);
    return qMatch && fMatch;
  })})).filter(c => c.items.length && (category === 'All' || c.name === category)), [query,filter,category]);

  const setQty = (item: Item, delta: number) => setCart(current => {
    const next = {...current};
    const qty = (next[item.id] || 0) + delta;
    if (qty <= 0) delete next[item.id]; else next[item.id] = qty;
    return next;
  });
  const browse = () => { setWelcome(false); setTimeout(() => document.getElementById('menu')?.scrollIntoView({behavior:'smooth'}),30); };
  const choose = (name: string) => { setCategory(name); setQuery(''); setTimeout(() => document.getElementById('menu')?.scrollIntoView({behavior:'smooth'}),30); };

  if (welcome) return <div className="welcome-screen"><div className="welcome-orb one"/><div className="welcome-orb two"/><div className="welcome-card">
    <div className="brand-badge">🍛</div><span className="eyebrow">BIRYANI SPOT • DIGITAL MENU</span>
    <h1>Good food.<br/><em>Good moments.</em></h1>
    <p>Explore biryanis, tandoori favourites, starters, fried rice, noodles, breads and curries in one simple menu.</p>
    <button className="primary-button welcome-button" onClick={browse}>Explore Menu <span>→</span></button>
    <div className="welcome-stats"><span><b>{allItems.length}+</b> dishes</span><span><b>Veg</b> & Non-Veg</span><span><b>Half</b> & Full options</span></div>
    <small>Prices displayed from the restaurant menu.</small>
  </div></div>;

  return <div className="app-shell">
    <header className="topbar"><button className="brand-button" onClick={() => {setCategory('All');setQuery('');window.scrollTo({top:0,behavior:'smooth'});}}><span className="mini-logo">🍛</span><span><strong>Biryani Spot</strong><small>Digital Menu</small></span></button><button className="cart-button" onClick={() => setCartOpen(true)}>🛒 <span>Order List</span>{count>0&&<b>{count}</b>}</button></header>
    <main>
      <section className="hero-section"><div className="hero-content"><span className="hero-kicker">🍽️ BIRYANI • TANDOORI • MULTI CUISINE</span><h2>Made for sharing,<br/><em>made to remember.</em></h2><p>Take a look around and find your next favourite dish.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('categories')?.scrollIntoView({behavior:'smooth'})}>Browse Categories</button><button className="secondary-button" onClick={() => choose("Biryani's")}>🍛 Biryani</button></div></div><div className="hero-food-art"><div className="plate-shadow"/><div className="food-bowl">🍛</div><span className="spark one">✦</span><span className="spark two">✦</span></div></section>
      <section className="quick-strip" id="categories"><div className="section-intro"><span className="eyebrow">EXPLORE</span><h2>Choose your craving</h2><p>Jump straight to a section or search the complete menu.</p></div><div className="category-pills"><button className={category==='All'?'category-pill active':'category-pill'} onClick={() => choose('All')}>✨ All</button>{MENU.map(c => <button key={c.name} className={category===c.name?'category-pill active':'category-pill'} onClick={() => choose(c.name)}><span>{c.icon}</span>{c.name}</button>)}</div></section>
      <section className="menu-toolbar"><div className="search-box"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dishes, starters, biryani..."/>{query&&<button onClick={()=>setQuery('')}>×</button>}</div><div className="diet-buttons"><button className={filter==='all'?'diet-button active':'diet-button'} onClick={()=>setFilter('all')}>All</button><button className={filter==='veg'?'diet-button active veg':'diet-button veg'} onClick={()=>setFilter('veg')}>● Veg</button><button className={filter==='nonveg'?'diet-button active nonveg':'diet-button nonveg'} onClick={()=>setFilter('nonveg')}>● Non-Veg</button></div></section>
      <section className="menu-area" id="menu"><div className="menu-heading"><div><span className="eyebrow">OUR MENU</span><h2>{category==='All'?'Something for everyone':category}</h2></div><span>{results.reduce((a,c)=>a+c.items.length,0)} dishes</span></div>
        {!results.length ? <div className="empty-state"><div>🍽️</div><h3>No dishes found</h3><p>Try another search or reset the filters.</p><button className="secondary-button" onClick={()=>{setQuery('');setFilter('all');setCategory('All')}}>Reset Menu</button></div> : results.map(c => <section className="category-section" key={c.name}><div className="category-heading"><div className="category-icon">{c.icon}</div><div><h3>{c.name}</h3><p>{c.description}</p></div><span>{c.items.length}</span></div><div className="dish-grid">{c.items.map(item => <article className="dish-card" key={`${c.name}-${item.id}`}><div className={item.veg?'dish-art veg-art':'dish-art nonveg-art'}><span>{item.veg?'🥗':'🍗'}</span><small>{item.veg?'VEG':'NON-VEG'}</small></div><div className="dish-info"><div className="dish-title"><h4>{item.name}</h4><i className={item.veg?'veg-dot':'nonveg-dot'}/></div><div className="price-row"><div><small>{item.half!=null?'Half / Full':'Price'}</small><strong>{price(item)}</strong></div>{item.half!=null&&<span className="option-tag">2 options</span>}</div><button className="add-button" onClick={()=>setQty(item,1)}><span>+</span> Add to order</button></div></article>)}</div></section>)}
      </section>
      <section className="family-note"><div className="family-icon">❤️</div><div><span className="eyebrow">A TABLE FOR EVERYONE</span><h2>Come hungry, leave happy.</h2><p>From a quick starter to a family biryani, choose what suits your table.</p></div><button className="secondary-button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Back to top ↑</button></section>
    </main>
    <footer className="footer"><div><span className="mini-logo">🍛</span><strong>Biryani Spot</strong></div><p>Digital menu • Prices shown from the restaurant menu</p></footer>
    {cartOpen&&<div className="cart-overlay" onClick={()=>setCartOpen(false)}><aside className="cart-panel" onClick={e=>e.stopPropagation()}><div className="cart-header"><div><span className="eyebrow">YOUR SELECTION</span><h2>Order List</h2></div><button className="close-button" onClick={()=>setCartOpen(false)}>×</button></div>{!cartItems.length?<div className="cart-empty"><div>🛒</div><h3>Your list is empty</h3><p>Add dishes from the menu to see them here.</p><button className="primary-button" onClick={()=>setCartOpen(false)}>Continue browsing</button></div>:<><div className="cart-items">{cartItems.map(item=><div className="cart-item" key={item.id}><div className="cart-item-art">{item.veg?'🥗':'🍗'}</div><div className="cart-item-main"><strong>{item.name}</strong><small>{item.half!=null?'Half / Full price shown':''}</small><span>₹{basePrice(item)} each</span></div><div className="quantity-control"><button onClick={()=>setQty(item,-1)}>−</button><b>{cart[item.id]}</b><button onClick={()=>setQty(item,1)}>+</button></div></div>)}</div><div className="cart-summary"><div><span>Items</span><strong>{count}</strong></div><div><span>Starting total</span><strong>₹{total}</strong></div><p>For Half / Full dishes, the starting total uses the half-price. Confirm the serving option with the restaurant.</p><button className="primary-button full-button" onClick={()=>setCart({})}>Clear Order List</button></div></>}</aside></div>}
  </div>;
}
