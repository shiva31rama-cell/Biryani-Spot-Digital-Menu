import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChefHat, ChevronRight, Flame, Leaf, MapPin, MessageCircle, Minus, Phone, Plus, RefreshCw, Search, ShoppingBag, Soup, Utensils, X } from 'lucide-react';
import { MENU, MENU_ITEM_COUNT, type MenuItem, type SizeOption } from './data/menu';
import { RESTAURANT } from './config/restaurant';

type Entry = { item: MenuItem; option?: SizeOption; qty: number };
type Selection = Record<string, Entry>;
type Page = 'welcome' | 'menu';
const heroImage = 'https://images.unsplash.com/photo-1563379091339-03246963d96a?auto=format&fit=crop&w=1400&q=88';
const keyFor = (item: MenuItem, option?: SizeOption) => item.id + '-' + (option?.label ?? 'single');
const slug = (name: string) => 'category-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const money = (price: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
const allItems = MENU.flatMap((category) => category.items);

const CATEGORY_PHOTOS: Record<string, string> = {
  'Non-Veg Soups': 'non-veg-soups.jpg',
  'Veg Soups': 'veg-soups.jpg',
  'Veg Starters': 'veg-starters.jpg',
  'Non-Veg Starters': 'non-veg-starters.jpg',
  'Tandoori Starter': 'tandoori-starter.jpg',
  'Veg Tandoori Starter': 'veg-tandoori-starter.jpg',
  "Biryani's": 'biryanis.jpg',
  'Veg Friedrice': 'veg-friedrice.jpg',
  'Noodles': 'noodles.jpg',
  'Non Veg Friedrice': 'non-veg-friedrice.jpg',
  'Roti & Naan': 'roti-naan.jpg',
  'Veg Curries': 'veg-curries.jpg',
  'Non Veg Curries': 'non-veg-curries.jpg',
};

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('soup')) return Soup;
  if (n.includes('biryani') || n.includes('rice')) return ChefHat;
  if (n.includes('starter') || n.includes('tandoori')) return Flame;
  if (n.includes('drink')) return Leaf;
  return Utensils;
}

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    try { return sessionStorage.getItem('biryani-spot-page') === 'menu' ? 'menu' : 'welcome'; } catch { return 'welcome'; }
  });
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [active, setActive] = useState(MENU[0]?.name ?? '');
  const [selection, setSelection] = useState<Selection>(() => {
    try { return JSON.parse(localStorage.getItem('biryani-spot-selection') ?? '{}') as Selection; } catch { return {}; }
  });
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem('biryani-spot-selection', JSON.stringify(selection)); } catch { /* Selection still works for this session. */ }
  }, [selection]);
  useEffect(() => {
    try { sessionStorage.setItem('biryani-spot-page', page); } catch { /* Optional. */ }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);
  useEffect(() => {
    document.body.classList.toggle('modal-open', drawer);
    return () => document.body.classList.remove('modal-open');
  }, [drawer]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const toast = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2500); };
  const entries = Object.values(selection);
  const count = entries.reduce((sum, entry) => sum + entry.qty, 0);
  const total = entries.reduce((sum, entry) => sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty, 0);
  const whatsapp = RESTAURANT.whatsapp.replace(/\D/g, '');
  const canWhatsApp = whatsapp.length >= 8 && whatsapp.length <= 15;

  const categories = useMemo(() => {
    const term = query.trim().toLowerCase();
    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        (!term || (group.name + ' ' + group.description + ' ' + item.name).toLowerCase().includes(term)) &&
        (diet === 'all' || (diet === 'veg' ? item.veg : !item.veg))
      ),
    })).filter((group) => group.items.length);
  }, [query, diet]);

  useEffect(() => {
    if (categories.length && !categories.some((item) => item.name === active)) setActive(categories[0].name);
    const onScroll = () => {
      const navBottom = document.querySelector('.menu-tools')?.getBoundingClientRect().bottom ?? 130;
      let current = '';
      for (const group of categories) {
        const section = document.getElementById(slug(group.name));
        if (section && section.getBoundingClientRect().top <= navBottom + 16) current = group.name;
      }
      if (current) setActive((old) => old === current ? old : current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [categories, active]);

  const featured = useMemo(() => {
    const names = ['Chicken Dum Biryani', 'Chicken Fry Biryani', 'Mutton Dum Biryani'];
    const result = names.map((name) => allItems.find((item) => item.name === name)).filter((item): item is MenuItem => Boolean(item));
    for (const item of allItems) { if (result.length >= 3) break; if (!result.some((x) => x.id === item.id)) result.push(item); }
    return result.slice(0, 3);
  }, []);

  const add = (item: MenuItem, option?: SizeOption) => {
    const key = keyFor(item, option);
    setSelection((old) => ({ ...old, [key]: { item, option, qty: Math.min(99, (old[key]?.qty ?? 0) + 1) } }));
    toast(item.name + (option ? ' (' + option.label.toLowerCase() + ')' : '') + ' added');
  };
  const change = (key: string, amount: number) => setSelection((old) => {
    const entry = old[key]; if (!entry) return old;
    const next = { ...old }; const qty = entry.qty + amount;
    if (qty <= 0) delete next[key]; else next[key] = { ...entry, qty: Math.min(99, qty) };
    return next;
  });
  const clearFilters = () => { setQuery(''); setDiet('all'); setActive(MENU[0]?.name ?? ''); };
  const jump = (name: string) => {
    setActive(name);
    const target = document.getElementById(slug(name));
    const offset = document.querySelector('.menu-tools')?.getBoundingClientRect().bottom ?? 120;
    if (target) window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset - 8), behavior: 'smooth' });
  };
  const home = () => { clearFilters(); setDrawer(false); setPage('welcome'); };
  const menu = () => setPage('menu');
  const featuredClick = (item: MenuItem) => {
    const parent = MENU.find((group) => group.items.some((dish) => dish.id === item.id));
    setPage('menu');
    if (parent) window.setTimeout(() => jump(parent.name), 80);
  };
  const sendEnquiry = () => {
    if (!entries.length) return toast('Add a dish to your selection first.');
    if (!canWhatsApp) return toast('Restaurant WhatsApp is not configured yet.');
    const lines = entries.map((entry, i) => (i + 1) + '. ' + entry.item.name + (entry.option ? ' (' + entry.option.label + ')' : '') + ' × ' + entry.qty + ' — ₹' + money((entry.option?.price ?? entry.item.price ?? 0) * entry.qty));
    const message = ['Hello Biryani Spot, I would like to enquire about these items:', '', ...lines, '', 'Estimated menu total: ₹' + money(total), '', 'Please confirm availability, final prices and order details. This is an enquiry, not a confirmed order.'].join('\n');
    window.open('https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  };

  return <div className={count && !drawer ? 'app-shell has-selection' : 'app-shell'}>
    {page === 'welcome' ? <main className="welcome-page" id="top">
      <div className="welcome-actions">
        <button className="welcome-action welcome-action--refresh" onClick={() => window.location.reload()} aria-label="Refresh"><RefreshCw size={13}/> Refresh</button>
        <button className="welcome-action welcome-action--menu" onClick={menu}>View Menu <ArrowRight size={14}/></button>
      </div>
      <section className="welcome-brand-block">
        <div className="welcome-brand-lockup">
          <img className="welcome-logo-image" src="./biryani-spot-logo.png" alt="Biryani Spot Family Restaurant logo" width="449" height="449" fetchPriority="high" decoding="async"/>
        </div>
        <p className="welcome-overline">WELCOME TO BIRYANI SPOT</p>
        <h2>Good Food, Happy Moments</h2>
        <p className="welcome-intro">Biryani, tandoori favourites and familiar flavours made for sharing.</p>
        <button className="primary-button welcome-main-cta" onClick={menu}>Explore the full menu <ArrowRight size={17}/></button>
      </section>
      <section className="welcome-food-feature">
        <div className="welcome-food-image">
          <img src={heroImage} alt="Traditional biryani rice" loading="eager" onError={(event) => { event.currentTarget.style.display = 'none'; }}/>
          <div className="welcome-food-overlay"/><span className="image-caption">FLAVOUR IN EVERY SERVING</span>
        </div>
        <div className="welcome-food-copy">
          <span className="section-kicker"><Flame size={14}/> SIGNATURE FAVOURITES</span>
          <h2>Find your next favourite.</h2>
          <p>Explore the menu, choose the dishes you love, and prepare your selection before enquiring with the restaurant.</p>
          <button className="text-button" onClick={menu}>Browse all dishes <ChevronRight size={16}/></button>
        </div>
      </section>
      <section className="signature-section">
        <div className="section-heading"><span className="section-kicker"><ChefHat size={14}/> FROM OUR MENU</span><h2>Popular picks</h2><p>A few favourites to get you started.</p></div>
        <div className="signature-grid">{featured.map((item, index) => <button key={item.id} className={'signature-card signature-card--' + (index + 1)} onClick={() => featuredClick(item)}>
          <span className="signature-card-art" aria-hidden="true"><ChefHat size={28}/><i>{item.category}</i></span>
          <span className="signature-card-copy"><small>MENU FAVOURITE</small><strong>{item.name}</strong><span>{item.sizes ? 'From ₹' + money(item.sizes[0].price) : '₹' + money(item.price ?? 0)}</span></span>
          <span className="signature-arrow"><ArrowRight size={15}/></span>
        </button>)}</div>
      </section>
      <section className="welcome-promise"><span className="promise-icon"><Utensils size={19}/></span><div><strong>Good food. Good company.</strong><p>Take a look at the menu and discover something delicious.</p></div><button className="promise-cta" onClick={menu}>View menu <ArrowRight size={15}/></button></section>
      <footer className="welcome-footer"><img className="footer-logo" src="./biryani-spot-logo.png" alt="Biryani Spot Family Restaurant" width="449" height="449" loading="lazy" decoding="async"/><div className="footer-contact" aria-label="Restaurant contact details"><a href={"tel:" + RESTAURANT.phone.replace(/[^+\d]/g, "")}><Phone size={14}/> Call {RESTAURANT.phone.replace("+91 ", "")}</a><a href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a><a href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={14}/> View location</a></div><p>Menu prices and availability may change. Please confirm with the restaurant.</p></footer>
    </main> : <>
      <header className="site-header" id="top">
        <button className="header-brand" onClick={home} aria-label="Biryani Spot home"><img className="header-logo" src="./biryani-spot-logo.png" alt="" width="449" height="449" decoding="async"/><span className="header-brand-copy"><span className="brand-wordmark">Biryani <em>Spot</em></span><small>FAMILY RESTAURANT</small></span></button>
        <nav className="desktop-links" aria-label="Main navigation"><button onClick={home}>Home</button><a href="#menu">Menu</a><a href="#menu-footer">About</a></nav>
        <div className="header-actions"><span className="menu-count">{MENU_ITEM_COUNT} dishes</span><button className="header-bag" onClick={() => setDrawer(true)} aria-label={'Open selection, ' + count + ' items'}><ShoppingBag size={17}/><span>My selection</span>{count > 0 && <b>{count}</b>}</button></div>
      </header>
      <main id="menu" className="menu-page">
        <div className="menu-back-row"><button className="back-home" onClick={home}><ArrowLeft size={13}/> Restaurant Home</button><span>GOOD FOOD, HAPPY MOMENTS</span></div>
        <section className="menu-brand-panel"><img className="menu-page-logo" src="./biryani-spot-logo.png" alt="Biryani Spot Family Restaurant" width="449" height="449" loading="lazy" decoding="async"/><h1>Our <em>Menu</em></h1><p>Authentic favourites, generous portions and something for every appetite.</p><div className="menu-brand-ornament"><i/><Utensils size={15}/><i/></div></section>
        <section className="menu-tools" aria-label="Search and menu categories">
          <div className="navigation-top-row">
            <label className="search-field"><Search size={17} aria-hidden="true"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes or categories" aria-label="Search dishes or categories"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label>
            <div className="diet-filters" role="group" aria-label="Dietary filter">
              <button className={diet === 'all' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('all')} aria-pressed={diet === 'all'}>All</button>
              <button className={diet === 'veg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('veg')} aria-pressed={diet === 'veg'}><Leaf size={12}/> Veg</button>
              <button className={diet === 'nonveg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('nonveg')} aria-pressed={diet === 'nonveg'}><Flame size={12}/> Non-veg</button>
            </div>
          </div>
          <div className="category-nav" aria-label="Jump to a category">{categories.map((group) => <button key={group.name} className={active === group.name ? 'category-chip active' : 'category-chip'} onClick={() => jump(group.name)}><span>{group.short}</span>{group.name}</button>)}</div>
          <div className="navigation-count"><span>{categories.reduce((sum, c) => sum + c.items.length, 0)} dishes shown</span>{(query || diet !== 'all') && <button onClick={clearFilters}>Clear filters <X size={12}/></button>}</div>
        </section>
        {categories.length ? <div className="category-panels">{categories.map((group, index) => {
          const Icon = categoryIcon(group.name);
          return <section id={slug(group.name)} className={'category-panel category-panel--' + (index % 5 + 1)} key={group.name}>
            <div className="category-panel-inner">
              <div className="category-heading"><div><span className="category-eyebrow">BIRYANI SPOT <i/> MENU COLLECTION</span><h2>{group.name}</h2><p>{group.description}</p></div><span className="category-item-count">{group.items.length} ITEMS</span></div>
              <div className="category-content">
                <div className="category-visual" aria-hidden="true"><img className="category-visual-photo" src={"./category-images/" + CATEGORY_PHOTOS[group.name]} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }}/><span className="category-visual-shade"/><span className="category-visual-ring"><Icon size={37} strokeWidth={1.2}/></span><span className="category-visual-brand">BIRYANI SPOT</span><span className="category-visual-line"/><span className="category-visual-subtitle">{group.name}</span></div>
                <div className="dish-grid">{group.items.map((item) => {
                  const single = keyFor(item); const quantity = selection[single]?.qty ?? 0;
                  return <article className="menu-dish" key={item.id}>
                    <div className="dish-main"><span className={item.veg ? 'diet-mark veg-mark' : 'diet-mark nonveg-mark'} aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}><i/></span><span className="dish-name">{item.name}</span></div>
                    {item.sizes ? <div className="dish-size-actions">{item.sizes.map((option) => { const key = keyFor(item, option); const qty = selection[key]?.qty ?? 0; return <button key={option.label} className={qty ? 'size-add selected' : 'size-add'} onClick={() => add(item, option)} aria-label={'Add ' + item.name + ' ' + option.label + ', ₹' + option.price}><span>{option.label === 'Half' ? 'H' : 'F'}</span><strong>₹{money(option.price)}</strong>{qty > 0 && <small>{qty}</small>}</button>; })}</div> : <div className="dish-action"><strong className="dish-price">₹{money(item.price ?? 0)}</strong><button className={quantity ? 'dish-add added' : 'dish-add'} onClick={() => add(item)} aria-label={'Add ' + item.name}>{quantity ? <><Check size={13}/><span>{quantity}</span></> : <Plus size={15}/>}</button></div>}
                  </article>;
                })}</div>
              </div>
            </div>
          </section>;
        })}</div> : <section className="empty-state"><Search size={25}/><h2>No dishes found</h2><p>Try another search or remove one of the filters.</p><button onClick={clearFilters}>Show all dishes</button></section>}
        <p className="menu-disclaimer">Prices are shown as listed on the menu. Please confirm availability and final prices with the restaurant.</p>
      </main>
      <footer id="menu-footer" className="site-footer"><img className="footer-logo" src="./biryani-spot-logo.png" alt="Biryani Spot Family Restaurant" width="449" height="449" loading="lazy" decoding="async"/><p>Good food. Good company.</p><div className="footer-contact" aria-label="Restaurant contact details"><a href={"tel:" + RESTAURANT.phone.replace(/[^+\d]/g, "")}><Phone size={14}/> Call {RESTAURANT.phone.replace("+91 ", "")}</a><a href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a><a href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={14}/> View location</a></div></footer>
    </>}

    {count > 0 && !drawer && <div className="selection-bar"><button onClick={() => setDrawer(true)}><span className="selection-bar-icon"><ShoppingBag size={17}/><i>{count}</i></span><span className="selection-bar-label"><strong>View selection</strong><small>{count} {count === 1 ? 'item' : 'items'} · enquiry only</small></span><strong className="selection-bar-total">₹{money(total)}</strong><ChevronRight size={17}/></button></div>}
    {drawer && <div className="drawer-overlay" onClick={() => setDrawer(false)}><aside className="selection-drawer" role="dialog" aria-modal="true" aria-label="Your selection" onClick={(e) => e.stopPropagation()}>
      <div className="drawer-heading"><div><span className="section-kicker">BIRYANI SPOT</span><h2>Your selection</h2><p>Check your dishes before sending an enquiry.</p></div><button className="close-drawer" onClick={() => setDrawer(false)} aria-label="Close selection"><X size={20}/></button></div>
      {!entries.length ? <div className="drawer-empty"><ShoppingBag size={30}/><h3>Your selection is empty</h3><p>Add dishes from the menu and they will appear here.</p><button className="primary-button" onClick={() => setDrawer(false)}>Browse menu <ChevronRight size={15}/></button></div> : <>
        <div className="selected-items">{entries.map((entry) => { const key = keyFor(entry.item, entry.option); const price = entry.option?.price ?? entry.item.price ?? 0; return <div className="selected-item" key={key}><div className="selected-item-copy"><strong>{entry.item.name}</strong><small>{entry.option?.label ?? 'Regular'} · ₹{money(price)}</small><b>₹{money(price * entry.qty)}</b></div><div className="quantity-control"><button onClick={() => change(key, -1)} aria-label={'Remove one ' + entry.item.name}><Minus size={13}/></button><span>{entry.qty}</span><button onClick={() => change(key, 1)} aria-label={'Add one ' + entry.item.name}><Plus size={13}/></button></div></div>; })}</div>
        <div className="drawer-checkout"><div className="total-line"><span>Estimated total</span><strong>₹{money(total)}</strong></div><p>This is an enquiry, not a confirmed order or payment.</p><button className="send-enquiry" onClick={sendEnquiry} disabled={!canWhatsApp}><MessageCircle size={17}/>{canWhatsApp ? 'Enquire on WhatsApp' : 'WhatsApp not configured'}</button>{!canWhatsApp && <small className="config-note">The restaurant needs to add a verified WhatsApp number before enquiries can be sent.</small>}<button className="clear-selection" onClick={() => setSelection({})}>Clear selection</button></div>
      </>}
    </aside></div>}
    {notice && <div className="toast" role="status"><Check size={15}/>{notice}</div>}
  </div>;
}
