import { useEffect, useMemo, useState } from 'react';
import { MENU, MENU_ITEM_COUNT, type MenuItem, type SizeOption } from './data/menu';
import { RESTAURANT } from './config/restaurant';

type SelectionEntry = { item: MenuItem; option?: SizeOption; qty: number };
type Selection = Record<string, SelectionEntry>;

const BRAND_IMAGE = './brand-logo.svg';
const INTRO_KEY = 'biryani-spot-intro-seen';
const FAVORITES_KEY = 'biryani-spot-favorites';
const SELECTION_KEY = 'biryani-spot-selection';

const selectionKey = (item: MenuItem, option?: SizeOption) =>
  `${item.id}-${option?.label ?? 'single'}`;

export default function App() {
  const [introVisible, setIntroVisible] = useState(() => {
    try { return sessionStorage.getItem(INTRO_KEY) !== '1'; } catch { return true; }
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg' | 'favorites'>('all');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'); } catch { return []; }
  });
  const [selection, setSelection] = useState<Selection>(() => {
    try { return JSON.parse(localStorage.getItem(SELECTION_KEY) ?? '{}') as Selection; } catch { return {}; }
  });
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [notice, setNotice] = useState('');
  const [printSelection, setPrintSelection] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!introVisible) return;
    if (reducedMotion) {
      finishIntro();
      return;
    }
    const timer = window.setTimeout(finishIntro, 3000);
    return () => window.clearTimeout(timer);
  }, [introVisible, reducedMotion]);

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(SELECTION_KEY, JSON.stringify(selection)); }, [selection]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', selectionOpen || feedbackOpen);
    return () => document.body.classList.remove('modal-open');
  }, [selectionOpen, feedbackOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectionOpen(false);
      setFeedbackOpen(false);
    };
    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, []);

  useEffect(() => {
    if (!printSelection) return;
    const timer = window.setTimeout(() => window.print(), 80);
    return () => window.clearTimeout(timer);
  }, [printSelection]);

  useEffect(() => {
    const afterPrint = () => setPrintSelection(false);
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  const finishIntro = () => {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* optional */ }
    setIntroVisible(false);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const toggleFavorite = (id: string) =>
    setFavorites((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const addItem = (item: MenuItem, option?: SizeOption) => {
    const key = selectionKey(item, option);
    setSelection((current) => ({
      ...current,
      [key]: { item, option, qty: (current[key]?.qty ?? 0) + 1 },
    }));
    showNotice(`${item.name} added to your selection.`);
  };

  const changeQty = (key: string, delta: number) => {
    setSelection((current) => {
      const entry = current[key];
      if (!entry) return current;
      const qty = entry.qty + delta;
      const next = { ...current };
      if (qty <= 0) delete next[key];
      else next[key] = { ...entry, qty };
      return next;
    });
  };

  const selected = Object.values(selection);
  const selectedCount = selected.reduce((sum, entry) => sum + entry.qty, 0);
  const selectedTotal = selected.reduce((sum, entry) => sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty, 0);

  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const matchesSearch = !q || item.name.toLowerCase().includes(q) || group.name.toLowerCase().includes(q);
        const matchesFilter = filter === 'all' || (filter === 'veg' ? item.veg : filter === 'nonveg' ? !item.veg : favorites.includes(item.id));
        return matchesSearch && matchesFilter;
      }),
    })).filter((group) => group.items.length && (category === 'All' || group.name === category));
  }, [query, filter, category, favorites]);

  const shareMenu = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Biryani Spot — Digital Menu',
          text: 'Explore the Biryani Spot Family Restaurant menu.',
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showNotice('Menu link copied.');
      } else {
        showNotice('Copy the menu link from your browser.');
      }
    } catch {
      // Sharing can be cancelled by the user.
    }
  };

  const shareSelection = async () => {
    if (!selected.length) {
      showNotice('Add at least one dish before sharing your selection.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ` — ${entry.option.label}` : '';
      const price = entry.option?.price ?? entry.item.price ?? 0;
      return `${index + 1}. ${entry.item.name}${size} × ${entry.qty} — ₹${price * entry.qty}`;
    });
    const text = [
      'Biryani Spot — My Menu Selection',
      '',
      ...lines,
      '',
      `Estimated total: ₹${selectedTotal}`,
      '',
      'This is a menu selection only, not a confirmed order.',
      window.location.href,
    ].join('\\n');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Biryani Spot — My Selection', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showNotice('Selection copied. You can paste it into a message.');
      } else {
        showNotice('Sharing is not available in this browser.');
      }
    } catch {
      // User may cancel the native share sheet.
    }
  };

  const openWhatsApp = (message: string) => {
    if (!RESTAURANT.whatsapp) {
      showNotice('WhatsApp will be enabled after the restaurant number is confirmed.');
      return;
    }
    window.open(
      `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const sendWhatsApp = () => {
    if (!selected.length) {
      showNotice('Add at least one dish before sending an enquiry.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ` - ${entry.option.label}` : '';
      return `${index + 1}. ${entry.item.name}${size} × ${entry.qty}`;
    });
    const message = [
      'Hello Biryani Spot,',
      '',
      'I would like to enquire about:',
      ...lines,
      '',
      `Estimated total: ₹${selectedTotal}`,
      '',
      'Please confirm availability and details.',
      'Thank you.',
    ].join('\n');
    openWhatsApp(message);
  };

  const sendFeedback = () => {
    if (!feedback.trim()) {
      showNotice('Please enter your feedback first.');
      return;
    }
    const message = `Hello Biryani Spot,\n\nI would like to share feedback:\n\n${feedback.trim()}\n\nThank you.`;
    openWhatsApp(message);
    setFeedback('');
    setFeedbackOpen(false);
  };

  const printSelectionNow = () => {
    if (!selected.length) {
      showNotice('Your selection is empty.');
      return;
    }
    setSelectionOpen(false);
    setPrintSelection(true);
  };

  const replayIntro = () => {
    try { sessionStorage.removeItem(INTRO_KEY); } catch { /* optional */ }
    setIntroVisible(true);
  };

  const jumpToMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (introVisible) {
    return (
      <div className="brand-intro" role="dialog" aria-label="Biryani Spot introduction">
        <div className="intro-glow" />
        <div className="intro-content">
          <img src={BRAND_IMAGE} alt="Biryani Spot Family Restaurant" className="intro-brand-image" />
          <span className="intro-kicker">FAMILY RESTAURANT</span>
          <p>TRADITION • TASTE • TOGETHER</p>
          <button className="skip-intro" onClick={finishIntro}>Skip Intro</button>
        </div>
        <div className="intro-progress" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Biryani Spot home">
          <img src={BRAND_IMAGE} alt="" />
          <span><strong>Biryani Spot</strong><small>Family Restaurant</small></span>
        </button>
        <div className="top-actions">
          <button className="top-action" onClick={shareMenu}>Share</button>
          <button className="top-action print-action" onClick={() => window.print()}>Print</button>
          <button className="selection-button" onClick={() => setSelectionOpen(true)} aria-label="Open My Selection">
            <span>My Selection</span>{selectedCount > 0 && <b>{selectedCount}</b>}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">BIRYANI • TANDOORI • MULTI CUISINE</span>
            <h1>Authentic flavours.<br /><em>Shared with family.</em></h1>
            <p>Explore the complete Biryani Spot menu, discover favourites and keep a simple selection for your table.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={jumpToMenu}>Explore Menu <span>↓</span></button>
              <button className="secondary-button" onClick={shareMenu}>Share Menu</button>
            </div>
          </div>
          <div className="hero-brand">
            <img src={BRAND_IMAGE} alt="Biryani Spot Family Restaurant" />
            <div><strong>TRADITION • TASTE • TOGETHER</strong><span>Family Restaurant</span></div>
          </div>
        </section>

        <section className="quick-nav" id="categories">
          <div><span className="eyebrow">EXPLORE THE MENU</span><h2>Choose your section</h2><p>Jump directly to a category or search the complete menu.</p></div>
          <div className="category-pills">
            <button className={category === 'All' ? 'category-pill active' : 'category-pill'} onClick={() => setCategory('All')}>All dishes</button>
            {MENU.map((group) => <button key={group.name} className={category === group.name ? 'category-pill active' : 'category-pill'} onClick={() => { setCategory(group.name); jumpToMenu(); }}><span>{group.short}</span>{group.name}</button>)}
          </div>
        </section>

        <section className="toolbar">
          <label className="search">
            <span>⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search biryani, chicken, paneer..." aria-label="Search menu" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </label>
          <div className="filters">
            {(['all', 'veg', 'nonveg', 'favorites'] as const).map((value) => <button key={value} className={filter === value ? 'filter active' : 'filter'} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'veg' ? '● Veg' : value === 'nonveg' ? '● Non-Veg' : `♥ Favourites (${favorites.length})`}</button>)}
          </div>
        </section>

        <section className="menu" id="menu">
          <div className="section-title"><div><span className="eyebrow">OUR MENU</span><h2>{category === 'All' ? 'Something for everyone' : category}</h2></div><span>{visibleCategories.reduce((sum, group) => sum + group.items.length, 0)} dishes</span></div>

          {!visibleCategories.length ? (
            <div className="empty"><div>⌕</div><h3>No dishes found</h3><p>Try another dish, category or filter.</p><button className="secondary-button" onClick={() => { setQuery(''); setFilter('all'); setCategory('All'); }}>Reset Menu</button></div>
          ) : visibleCategories.map((group) => (
            <section className="menu-section" key={group.name}>
              <div className="category-heading"><div className="category-mark">{group.short}</div><div><h3>{group.name}</h3><p>{group.description}</p></div><span>{group.items.length}</span></div>
              <div className="dish-grid">
                {group.items.map((item) => {
                  const singleKey = selectionKey(item);
                  const favorite = favorites.includes(item.id);
                  return (
                    <article className="dish-card" key={item.id}>
                      <div className={item.veg ? 'dish-art veg' : 'dish-art nonveg'}>
                        <span>{item.name.charAt(0)}</span><small>{item.veg ? 'VEG' : 'NON-VEG'}</small>
                      </div>
                      <div className="dish-body">
                        <div className="dish-title">
                          <i className={item.veg ? 'veg-dot' : 'nonveg-dot'} aria-hidden="true" />
                          <h4>{item.name}</h4>
                          <button className={favorite ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(item.id)} aria-label={favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}>{favorite ? '♥' : '♡'}</button>
                        </div>
                        {item.sizes ? (
                          <div className="size-grid">
                            {item.sizes.map((option) => {
                              const key = selectionKey(item, option);
                              const count = selection[key]?.qty ?? 0;
                              return <button className={count ? 'size-button selected' : 'size-button'} key={option.label} onClick={() => addItem(item, option)}>{option.label}<b>₹{option.price}</b>{count > 0 && <em>{count}</em>}</button>;
                            })}
                          </div>
                        ) : (
                          <div className="single-price"><strong>₹{item.price}</strong><button className={selection[singleKey] ? 'add-button added' : 'add-button'} onClick={() => addItem(item)}>{selection[singleKey] ? `${selection[singleKey].qty} added` : '+ Add'}</button></div>
                        )}
                        <small className="price-caption">{item.sizes ? 'Half / Full' : 'Menu price'}</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <section className="restaurant-info" id="contact">
          <div className="info-brand"><img src={BRAND_IMAGE} alt="" /><div><span className="eyebrow">BIRYANI SPOT</span><h2>Family Restaurant</h2><p>TRADITION • TASTE • TOGETHER</p></div></div>
          <div className="info-grid">
            <div className="info-card"><span>📍</span><strong>Visit Us</strong><p>{RESTAURANT.address || 'Restaurant address will be added after owner confirmation.'}</p>{RESTAURANT.mapsUrl && <a className="info-link" href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">Get Directions →</a>}</div>
            <div className="info-card"><span>📞</span><strong>Call</strong><p>{RESTAURANT.phone ? 'Speak with the restaurant.' : 'Verified phone number required.'}</p>{RESTAURANT.phone && <a className="info-link" href={`tel:${RESTAURANT.phone}`}>Call Now →</a>}</div>
            <div className="info-card"><span>💬</span><strong>WhatsApp</strong><p>{RESTAURANT.whatsapp ? 'Send an enquiry or feedback.' : 'Verified WhatsApp number required.'}</p>{RESTAURANT.whatsapp && <button className="info-link-button" onClick={() => openWhatsApp('Hello Biryani Spot, I have a question about the menu.')}>Chat on WhatsApp →</button>}</div>
            <div className="info-card"><span>🕒</span><strong>Opening Hours</strong><p>{RESTAURANT.openingHours || 'Opening hours will be added after owner confirmation.'}</p></div>
          </div>
          <div className="contact-actions">
            {RESTAURANT.instagramUrl && <a className="secondary-button" href={RESTAURANT.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
            {RESTAURANT.facebookUrl && <a className="secondary-button" href={RESTAURANT.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>}
            <button className="secondary-button" onClick={() => setFeedbackOpen(true)}>Send Feedback</button>
          </div>
        </section>

        <section className="family-note"><div><span className="eyebrow">A TABLE FOR EVERYONE</span><h2>Come hungry, leave happy.</h2><p>Choose your favourites, check the menu price and keep your table selection handy.</p></div><div className="note-actions"><button className="secondary-button" onClick={shareMenu}>Share Menu</button><button className="secondary-button" onClick={() => window.print()}>Print Menu</button><button className="secondary-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></div></section>
      </main>

      <footer className="footer"><img src={BRAND_IMAGE} alt="" /><div><strong>Biryani Spot</strong><span>Family Restaurant</span></div><p>Digital menu • {MENU_ITEM_COUNT} dishes • Prices from the supplied printed menu</p><button className="footer-replay" onClick={replayIntro}>Replay brand intro</button></footer>

      {selectionOpen && <div className="overlay" onClick={() => setSelectionOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head"><div><span className="eyebrow">YOUR TABLE LIST</span><h2>My Selection</h2></div><button className="close" onClick={() => setSelectionOpen(false)} aria-label="Close selection">×</button></div>
        {!selected.length ? <div className="drawer-empty"><h3>Your selection is empty</h3><p>Add dishes from the menu to keep a quick list for your table.</p><button className="primary-button" onClick={() => setSelectionOpen(false)}>Continue browsing</button></div> :
          <><div className="drawer-items">{selected.map((entry) => { const key = selectionKey(entry.item, entry.option); return <div className="drawer-item" key={key}><div className="drawer-main"><strong>{entry.item.name}</strong><small>{entry.option?.label ?? 'Regular'} • ₹{entry.option?.price ?? entry.item.price}</small></div><div className="qty"><button onClick={() => changeQty(key, -1)} aria-label="Decrease quantity">−</button><b>{entry.qty}</b><button onClick={() => changeQty(key, 1)} aria-label="Increase quantity">+</button></div></div>; })}</div>
          <div className="drawer-summary"><div><span>{selectedCount} items</span><strong>₹{selectedTotal}</strong></div><p>This is a selection/enquiry helper, not a confirmed online order or payment.</p><div className="drawer-actions"><button className="secondary-button" onClick={printSelectionNow}>Print Selection</button><button className="secondary-button" onClick={shareSelection}>Share Selection</button><button className="secondary-button" onClick={() => setSelection({})}>Clear</button><button className="primary-button" onClick={sendWhatsApp}>WhatsApp Enquiry</button></div></div></>}
      </aside></div>}

      {feedbackOpen && <div className="overlay" onClick={() => setFeedbackOpen(false)}><div className="feedback-modal" onClick={(e) => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">BIRYANI SPOT</span><h2>Send Feedback</h2></div><button className="close" onClick={() => setFeedbackOpen(false)}>×</button></div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us about your experience..." aria-label="Feedback" /><div className="drawer-actions"><button className="secondary-button" onClick={() => setFeedbackOpen(false)}>Cancel</button><button className="primary-button" onClick={sendFeedback}>Send on WhatsApp</button></div></div></div>}

      {printSelection && (
        <section className="print-selection" aria-hidden="true">
          <div className="print-selection-brand"><img src={BRAND_IMAGE} alt="" /><div><strong>Biryani Spot</strong><span>Family Restaurant</span></div></div>
          <h1>My Selection</h1>
          <p>Menu selection • Please confirm final availability and prices with restaurant staff.</p>
          <div className="print-selection-list">
            {selected.map((entry) => {
              const key = selectionKey(entry.item, entry.option);
              return <div key={key}><span>{entry.item.name}{entry.option ? ` — ${entry.option.label}` : ''} × {entry.qty}</span><strong>₹{(entry.option?.price ?? entry.item.price ?? 0) * entry.qty}</strong></div>;
            })}
          </div>
          <div className="print-selection-total"><span>Estimated total</span><strong>₹{selectedTotal}</strong></div>
        </section>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}
