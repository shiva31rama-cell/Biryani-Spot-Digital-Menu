import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Minus, Plus, Search, ShoppingBag, X, MessageCircle } from 'lucide-react';
import { MENU, MENU_ITEM_COUNT, type MenuItem, type SizeOption } from './data/menu';
import { RESTAURANT } from './config/restaurant';

type SelectionEntry = { item: MenuItem; option?: SizeOption; qty: number };
type Selection = Record<string, SelectionEntry>;

const BRAND_MARK = './favicon.svg';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1563379091339-03246963d96a?auto=format&fit=crop&w=1400&q=88';
const ITEM_IMAGES = {
  biryani: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=500&q=76',
  starter: 'https://images.unsplash.com/photo-1641873933980-fcff60026f50?auto=format&fit=crop&w=500&q=76',
  curry: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=76',
  veg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=76',
};
const selectionKey = (item: MenuItem, option?: SizeOption) => item.id + '-' + (option?.label ?? 'single');
const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);

function imageFor(item: MenuItem) {
  const category = item.category.toLowerCase();
  const name = item.name.toLowerCase();
  if (name.includes('biryani')) return ITEM_IMAGES.biryani;
  if (category.includes('soup')) return '';
  if (category.includes('curry') || name.includes('masala') || name.includes('gravy')) return item.veg ? ITEM_IMAGES.veg : ITEM_IMAGES.curry;
  if (category.includes('starter') || name.includes('tikka') || name.includes('kabab') || name.includes('kebab')) return item.veg ? ITEM_IMAGES.veg : ITEM_IMAGES.starter;
  if (item.veg) return ITEM_IMAGES.veg;
  return ITEM_IMAGES.curry;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [category, setCategory] = useState('All');
  const [selection, setSelection] = useState<Selection>(() => {
    try { return JSON.parse(localStorage.getItem('biryani-spot-selection') ?? '{}') as Selection; }
    catch { return {}; }
  });
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem('biryani-spot-selection', JSON.stringify(selection)); } catch { /* Keep this session usable when storage is unavailable. */ }
  }, [selection]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', selectionOpen);
    return () => document.body.classList.remove('modal-open');
  }, [selectionOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectionOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const selected = Object.values(selection);
  const selectedCount = selected.reduce((sum, entry) => sum + entry.qty, 0);
  const selectedTotal = selected.reduce((sum, entry) => sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty, 0);
  const whatsappNumber = RESTAURANT.whatsapp.replace(/\D/g, '');
  const canUseWhatsApp = whatsappNumber.length >= 8 && whatsappNumber.length <= 15;

  const visibleCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const matchesText = !term || (item.name + ' ' + item.category).toLowerCase().includes(term);
        const matchesDiet = diet === 'all' || (diet === 'veg' ? item.veg : !item.veg);
        return matchesText && matchesDiet;
      }),
    })).filter((group) => group.items.length > 0 && (category === 'All' || group.name === category));
  }, [query, diet, category]);

  const visibleCount = visibleCategories.reduce((sum, group) => sum + group.items.length, 0);

  const addItem = (item: MenuItem, option?: SizeOption) => {
    const key = selectionKey(item, option);
    setSelection((current) => ({
      ...current,
      [key]: { item, option, qty: (current[key]?.qty ?? 0) + 1 },
    }));
    showNotice(item.name + ' added');
  };

  const changeQty = (key: string, delta: number) => {
    setSelection((current) => {
      const entry = current[key];
      if (!entry) return current;
      const next = { ...current };
      const qty = entry.qty + delta;
      if (qty <= 0) delete next[key];
      else next[key] = { ...entry, qty };
      return next;
    });
  };

  const sendEnquiry = () => {
    if (!selected.length) {
      showNotice('Add a dish to your selection first.');
      return;
    }
    if (!canUseWhatsApp) {
      showNotice('The restaurant WhatsApp number has not been configured yet.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ' (' + entry.option.label + ')' : '';
      return (index + 1) + '. ' + entry.item.name + size + ' × ' + entry.qty + ' — ₹' +
        formatPrice((entry.option?.price ?? entry.item.price ?? 0) * entry.qty);
    });
    const message = [
      'Hello Biryani Spot, I would like to enquire about these items:',
      '',
      ...lines,
      '',
      'Estimated menu total: ₹' + formatPrice(selectedTotal),
      '',
      'Please confirm availability, final prices and order details. This is an enquiry, not a confirmed order.',
    ].join('\n');
    window.open('https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  };

  const resetFilters = () => {
    setQuery('');
    setDiet('all');
    setCategory('All');
  };

  const jumpToMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className={selectedCount > 0 && !selectionOpen ? 'app-shell has-selection' : 'app-shell'}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Biryani Spot home">
          <img src={BRAND_MARK} alt="" />
          <span><strong>Biryani Spot</strong><small>Family Restaurant</small></span>
        </a>
        <div className="header-right">
          <span className="menu-count">{MENU_ITEM_COUNT} dishes</span>
          <button className="header-bag" onClick={() => setSelectionOpen(true)} aria-label={'Open selection, ' + selectedCount + ' items'}>
            <ShoppingBag size={18} /><span>Your selection</span>
            {selectedCount > 0 && <b>{selectedCount}</b>}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow"><i /> THE BIRYANI SPOT MENU</span>
            <h1>A good meal<br /><em>starts here.</em></h1>
            <p>Browse the menu, choose your favourites, and send your selection to the restaurant.</p>
            <button className="hero-cta" onClick={jumpToMenu}>Explore the menu <ChevronRight size={17} /></button>
            <div className="hero-note"><span className="hero-note-line" /> Biryani · Tandoori · Indian favourites</div>
          </div>
          <div className="hero-image">
            <img src={HERO_IMAGE} alt="Traditional biryani served with fragrant rice and spices" fetchPriority="high" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('photo-unavailable'); }} />
            <div className="hero-image-shade" />
            <span className="photo-label">MADE FOR SHARING</span>
          </div>
        </section>

        <section className="menu-area" id="menu">
          <div className="menu-intro">
            <div><span className="eyebrow">FRESH CHOICES, FAMILIAR FAVOURITES</span><h2>Explore our menu</h2></div>
            <span className="result-count">{visibleCount} {visibleCount === 1 ? 'dish' : 'dishes'}</span>
          </div>

          <div className="menu-tools">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes by name" aria-label="Search dishes" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            </label>
            <div className="diet-filters" aria-label="Dietary filter">
              <button className={diet === 'all' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('all')} aria-pressed={diet === 'all'}>All</button>
              <button className={diet === 'veg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('veg')} aria-pressed={diet === 'veg'}><i className="veg-indicator" /> Vegetarian</button>
              <button className={diet === 'nonveg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('nonveg')} aria-pressed={diet === 'nonveg'}><i className="nonveg-indicator" /> Non-veg</button>
            </div>
          </div>

          <nav className="category-nav" aria-label="Menu categories">
            <button className={category === 'All' ? 'category-chip active' : 'category-chip'} onClick={() => setCategory('All')}>All dishes</button>
            {MENU.map((group) => <button key={group.name} className={category === group.name ? 'category-chip active' : 'category-chip'} onClick={() => setCategory(group.name)}>{group.name}</button>)}
          </nav>

          {!visibleCategories.length ? (
            <div className="empty-state"><Search size={25} /><h3>No dishes found</h3><p>Try another search or clear the filters.</p><button onClick={resetFilters}>Clear filters</button></div>
          ) : (
            <div className="menu-groups">
              {visibleCategories.map((group) => (
                <section className="menu-group" key={group.name}>
                  <div className="group-heading">
                    <div><h3>{group.name}</h3><p>{group.description}</p></div>
                    <span>{group.items.length} items</span>
                  </div>
                  <div className="dish-list">
                    {group.items.map((item) => {
                      const singleKey = selectionKey(item);
                      const itemImage = imageFor(item);
                      return (
                        <article className="dish-row" key={item.id}>
                          {itemImage ? <img className="dish-thumb" src={itemImage} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="dish-thumb soup-thumb" aria-hidden="true"><span>BS</span></div>}
                          <div className="dish-details">
                            <div className="dish-name-line"><i className={item.veg ? 'diet-mark veg-mark' : 'diet-mark nonveg-mark'} aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'} /><h4>{item.name}</h4></div>
                            <span className="dish-category">{item.veg ? 'VEG' : 'NON-VEG'} <span>·</span> {group.name}</span>
                            {item.sizes ? (
                              <div className="dish-size-actions">
                                {item.sizes.map((option) => {
                                  const key = selectionKey(item, option);
                                  const qty = selection[key]?.qty ?? 0;
                                  return <button key={option.label} className={qty ? 'size-add selected' : 'size-add'} onClick={() => addItem(item, option)} aria-label={'Add ' + item.name + ', ' + option.label + ', ₹' + option.price}><span>{option.label}</span><strong>₹{formatPrice(option.price)}</strong>{qty > 0 && <small>{qty} added</small>}</button>;
                                })}
                              </div>
                            ) : (
                              <div className="dish-price-line"><strong className="dish-price">₹{formatPrice(item.price ?? 0)}</strong><button className={selection[singleKey] ? 'add-control added' : 'add-control'} onClick={() => addItem(item)} aria-label={'Add ' + item.name}>{selection[singleKey] ? <><Check size={14} /> Added {selection[singleKey].qty}</> : <><Plus size={15} /> Add</>}</button></div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
          <p className="menu-disclaimer">Prices are shown as listed on the menu. Please confirm availability and final prices with the restaurant.</p>
        </section>
      </main>

      <footer className="site-footer"><img src={BRAND_MARK} alt="" /><span><strong>Biryani Spot</strong><small>Family Restaurant</small></span><p>Good food. Good company.</p></footer>

      {selectedCount > 0 && !selectionOpen && (
        <div className="selection-bar">
          <button onClick={() => setSelectionOpen(true)}><span className="selection-bar-icon"><ShoppingBag size={18} /><i>{selectedCount}</i></span><span className="selection-bar-label"><strong>View selection</strong><small>{selectedCount} {selectedCount === 1 ? 'item' : 'items'}</small></span><strong className="selection-bar-total">₹{formatPrice(selectedTotal)}</strong><ChevronRight size={18} /></button>
        </div>
      )}

      {selectionOpen && (
        <div className="drawer-overlay" onClick={() => setSelectionOpen(false)}>
          <aside className="selection-drawer" role="dialog" aria-modal="true" aria-label="Your selection" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading"><div><span className="eyebrow">BIRYANI SPOT</span><h2>Your selection</h2><p>Check your dishes before sending an enquiry.</p></div><button className="close-drawer" onClick={() => setSelectionOpen(false)} aria-label="Close selection"><X size={21} /></button></div>
            {!selected.length ? (
              <div className="drawer-empty"><ShoppingBag size={30} /><h3>Your selection is empty</h3><p>Add dishes from the menu and they will appear here.</p><button className="hero-cta" onClick={() => setSelectionOpen(false)}>Browse menu <ChevronRight size={16} /></button></div>
            ) : (
              <>
                <div className="selected-items">
                  {selected.map((entry) => {
                    const key = selectionKey(entry.item, entry.option);
                    const price = entry.option?.price ?? entry.item.price ?? 0;
                    return <div className="selected-item" key={key}><div className="selected-item-copy"><strong>{entry.item.name}</strong><small>{entry.option?.label ?? 'Regular'} · ₹{formatPrice(price)}</small><b>₹{formatPrice(price * entry.qty)}</b></div><div className="quantity-control"><button onClick={() => changeQty(key, -1)} aria-label={'Remove one ' + entry.item.name}><Minus size={14} /></button><span>{entry.qty}</span><button onClick={() => changeQty(key, 1)} aria-label={'Add one ' + entry.item.name}><Plus size={14} /></button></div></div>;
                  })}
                </div>
                <div className="drawer-checkout"><div className="total-line"><span>Estimated total</span><strong>₹{formatPrice(selectedTotal)}</strong></div><p>This is an enquiry, not a confirmed order or payment.</p><button className="send-enquiry" onClick={sendEnquiry} disabled={!canUseWhatsApp}><MessageCircle size={18} /> {canUseWhatsApp ? 'Enquire on WhatsApp' : 'WhatsApp not configured'}</button>{!canUseWhatsApp && <small className="config-note">The restaurant needs to add a verified WhatsApp number before enquiries can be sent.</small>}<button className="clear-selection" onClick={() => setSelection({})}>Clear selection</button></div>
              </>
            )}
          </aside>
        </div>
      )}

      {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
    </div>
  );
}
