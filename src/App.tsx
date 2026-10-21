import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Heart,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  Search,
  Share2,
  ShoppingBag,
  X,
} from 'lucide-react';
import { MENU, MENU_ITEM_COUNT, type MenuItem, type SizeOption } from './data/menu';
import { RESTAURANT } from './config/restaurant';

type SelectionEntry = { item: MenuItem; option?: SizeOption; qty: number };
type Selection = Record<string, SelectionEntry>;
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const BRAND_MARK = './favicon.svg';
const FAVORITES_KEY = 'biryani-spot-favorites';
const SELECTION_KEY = 'biryani-spot-selection';

const FOOD_PHOTOS = {
  biryani: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=82',
  biryaniHero: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?auto=format&fit=crop&w=1200&q=85',
  curry: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=82',
  tandoori: 'https://images.unsplash.com/photo-1641873933980-fcff60026f50?auto=format&fit=crop&w=900&q=82',
  vegetarian: 'https://images.unsplash.com/photo-1757715376287-90f24dac4593?auto=format&fit=crop&w=900&q=82',
};

const selectionKey = (item: MenuItem, option?: SizeOption) =>
  item.id + '-' + (option?.label ?? 'single');

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);

const categoryEmoji = (name: string) => {
  const value = name.toLowerCase();
  if (value.includes('biryani')) return '🍛';
  if (value.includes('tandoori') || value.includes('starter')) return '🍗';
  if (value.includes('soup')) return '🥣';
  if (value.includes('bread') || value.includes('naan') || value.includes('roti')) return '🫓';
  if (value.includes('rice') || value.includes('fried')) return '🍚';
  if (value.includes('noodle')) return '🍜';
  if (value.includes('curry')) return '🥘';
  if (value.includes('veg')) return '🥗';
  return '🍽️';
};

const dishImageFor = (item: MenuItem) => {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes('biryani')) return FOOD_PHOTOS.biryani;
  if (
    name.includes('tandoori') || name.includes('tikka') || name.includes('kabab') ||
    name.includes('kebab') || name.includes('lollipop') || name.includes('wings') ||
    name.includes('65') || name.includes('manchuria') || name.includes('chilli') ||
    name.includes('majesty') || name.includes('dragon') || category.includes('starter')
  ) {
    return item.veg ? FOOD_PHOTOS.vegetarian : FOOD_PHOTOS.tandoori;
  }
  if (category.includes('curry') || name.includes('masala') || name.includes('gravy')) {
    return item.veg ? FOOD_PHOTOS.vegetarian : FOOD_PHOTOS.curry;
  }
  if (item.veg) return FOOD_PHOTOS.vegetarian;
  if (name.includes('chicken') || name.includes('mutton') || name.includes('prawn') || name.includes('egg')) {
    return FOOD_PHOTOS.tandoori;
  }
  return FOOD_PHOTOS.curry;
};

export default function App() {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [printSelection, setPrintSelection] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstallPrompt(null);
      showNotice('Biryani Spot was added to your home screen.');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    const updateNetworkStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch { /* favorites remain available for this session */ }
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(selection)); } catch { /* selection remains available for this session */ }
  }, [selection]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', selectionOpen || mobileMenuOpen);
    return () => document.body.classList.remove('modal-open');
  }, [selectionOpen, mobileMenuOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectionOpen(false);
      setMobileMenuOpen(false);
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

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]);
  };

  const addItem = (item: MenuItem, option?: SizeOption) => {
    const key = selectionKey(item, option);
    setSelection((current) => ({
      ...current,
      [key]: { item, option, qty: (current[key]?.qty ?? 0) + 1 },
    }));
    showNotice(item.name + ' added to your selection.');
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
  const selectedTotal = selected.reduce((sum, entry) =>
    sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty, 0);
  const whatsappNumber = RESTAURANT.whatsapp.replace(/\D/g, '');
  const canUseWhatsApp = whatsappNumber.length >= 8 && whatsappNumber.length <= 15;

  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const searchable = [item.name, item.category, group.name].join(' ').toLowerCase();
        const matchesSearch = !q || searchable.includes(q);
        const matchesFilter = filter === 'all' ||
          (filter === 'veg' ? item.veg : filter === 'nonveg' ? !item.veg : favorites.includes(item.id));
        return matchesSearch && matchesFilter;
      }),
    })).filter((group) => group.items.length && (category === 'All' || group.name === category));
  }, [query, filter, category, favorites]);

  const visibleCount = visibleCategories.reduce((sum, group) => sum + group.items.length, 0);

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
      // The customer may cancel the native share panel.
    }
  };

  const shareSelection = async () => {
    if (!selected.length) {
      showNotice('Add a dish before sharing your selection.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ' — ' + entry.option.label : '';
      const price = entry.option?.price ?? entry.item.price ?? 0;
      return (index + 1) + '. ' + entry.item.name + size + ' × ' + entry.qty + ' — ₹' + formatPrice(price * entry.qty);
    });
    const text = [
      'Biryani Spot — Menu Selection',
      '',
      ...lines,
      '',
      'Estimated total: ₹' + formatPrice(selectedTotal),
      '',
      'This is a selection for enquiry, not a confirmed order.',
      window.location.href,
    ].join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Biryani Spot — My Selection', text });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showNotice('Selection copied. You can paste it into a message.');
      } else showNotice('Sharing is not available in this browser.');
    } catch {
      // Sharing may be cancelled.
    }
  };

  const openWhatsApp = (message: string) => {
    if (!canUseWhatsApp) {
      showNotice('WhatsApp ordering is unavailable until the restaurant adds its verified number.');
      return;
    }
    window.open(
      'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const sendWhatsApp = () => {
    if (!selected.length) {
      showNotice('Add a dish before sending an enquiry.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ' — ' + entry.option.label : '';
      return (index + 1) + '. ' + entry.item.name + size + ' × ' + entry.qty;
    });
    const message = [
      'Hello Biryani Spot,',
      '',
      'I would like to enquire about these menu items:',
      ...lines,
      '',
      'Estimated total: ₹' + formatPrice(selectedTotal),
      '',
      'Please confirm availability and final prices. This is an enquiry, not a confirmed order.',
      'Thank you.',
    ].join('\n');
    openWhatsApp(message);
  };

  const printSelectionNow = () => {
    if (!selected.length) {
      showNotice('Your selection is empty.');
      return;
    }
    setSelectionOpen(false);
    setPrintSelection(true);
  };

  const installMenu = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      showNotice(result.outcome === 'accepted' ? 'Biryani Spot was added to your home screen.' : 'Install prompt dismissed.');
    } catch {
      showNotice('Installation is not available in this browser right now.');
    } finally {
      setInstallPrompt(null);
    }
  };

  const jumpTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseCategory = (value: string) => {
    setCategory(value);
    setMobileMenuOpen(false);
    setFilter((current) => current === 'favorites' ? 'all' : current);
    window.setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  const resetMenu = () => {
    setQuery('');
    setFilter('all');
    setCategory('All');
  };

  return (
    <div className={selectedCount > 0 && !selectionOpen && !printSelection ? 'app-shell with-mobile-selection' : 'app-shell'}>
      {!isOnline && (
        <div className="offline-banner" role="status">
          <strong>You are offline.</strong> The menu is available, but online food photos and WhatsApp may need internet.
        </div>
      )}

      <header className="topbar" id="home">
        <button className="brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Biryani Spot home">
          <img src={BRAND_MARK} alt="" />
          <span><strong>Biryani Spot</strong><small>Family Restaurant</small></span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button className="nav-link active" onClick={() => jumpTo('home')}>Home</button>
          <button className="nav-link" onClick={() => jumpTo('menu')}>Menu</button>
          <button className="nav-link" onClick={() => jumpTo('about')}>Restaurant</button>
        </nav>

        <div className="top-actions">
          <button className="top-action share-action" onClick={shareMenu} aria-label="Share menu"><Share2 size={17} /><span>Share</span></button>
          <button className="selection-button" onClick={() => setSelectionOpen(true)} aria-label={'Open My Selection, ' + selectedCount + ' items'}>
            <ShoppingBag size={17} /><span>My Selection</span>{selectedCount > 0 && <b>{selectedCount}</b>}
          </button>
          <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
            <MenuIcon size={22} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-nav-heading">
              <div className="mobile-brand-lockup"><img src={BRAND_MARK} alt="" /><span><strong>Biryani Spot</strong><small>Family Restaurant</small></span></div>
              <button className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
            </div>
            <button className="mobile-nav-link" onClick={() => jumpTo('home')}>Home <ArrowRight size={16} /></button>
            <button className="mobile-nav-link" onClick={() => jumpTo('menu')}>Full menu <ArrowRight size={16} /></button>
            <button className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); setFilter('favorites'); setCategory('All'); jumpTo('menu'); }}><Heart size={16} /> Saved favourites <ArrowRight size={16} /></button>
            <button className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); setSelectionOpen(true); }}><ShoppingBag size={16} /> My Selection ({selectedCount}) <ArrowRight size={16} /></button>
            <p className="mobile-nav-note">Tradition · Taste · Together</p>
          </nav>
        </div>
      )}

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span className="hero-eyebrow-dot" /> BIRYANI · TANDOORI · INDIAN FAVOURITES</span>
            <h1 id="hero-title">Good food.<br /><em>Good company.</em></h1>
            <p>Explore the Biryani Spot menu, find your favourites, and build a selection to share with the restaurant.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => jumpTo('menu')}>Explore menu <ArrowRight size={16} /></button>
              <button className="secondary-button" onClick={shareMenu}><Share2 size={16} /> Share menu</button>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src={FOOD_PHOTOS.biryaniHero}
              alt="Representative photograph of a traditional biryani dish"
              fetchPriority="high"
              onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }}
            />
            <span className="hero-image-kicker">BIRYANI SPOT · FAMILY RESTAURANT</span>
            <div className="hero-image-caption"><span>Find your next</span><strong>favourite dish.</strong></div>
          </div>
        </section>

        <section className="category-strip" id="categories" aria-label="Browse menu categories">
          <button className={category === 'All' ? 'category-tile active' : 'category-tile'} onClick={() => chooseCategory('All')}>
            <span className="category-tile-icon all-icon">✦</span><span>All dishes</span>
          </button>
          {MENU.map((group) => (
            <button key={group.name} className={category === group.name ? 'category-tile active' : 'category-tile'} onClick={() => chooseCategory(group.name)}>
              <span className="category-tile-icon">{categoryEmoji(group.name)}</span><span>{group.name}</span>
            </button>
          ))}
        </section>

        <section className="toolbar" aria-label="Search and filter menu">
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes..." aria-label="Search menu" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
          </label>
          <div className="filters" aria-label="Filter dishes">
            {(['all', 'veg', 'nonveg', 'favorites'] as const).map((value) => (
              <button
                key={value}
                className={filter === value ? 'filter active' : 'filter'}
                onClick={() => {
                  setFilter(value);
                  if (value === 'favorites') setCategory('All');
                }}
                aria-pressed={filter === value}
                aria-label={value === 'all' ? 'Show all dishes' : value === 'veg' ? 'Show vegetarian dishes' : value === 'nonveg' ? 'Show non-vegetarian dishes' : 'Show favourite dishes'}
              >
                {value === 'all' ? 'All' : value === 'veg' ? <><span className="filter-dot veg-filter-dot" /> Veg</> : value === 'nonveg' ? <><span className="filter-dot nonveg-filter-dot" /> Non-veg</> : <><Heart size={13} /> Saved</>}
              </button>
            ))}
          </div>
          {(query || filter !== 'all' || category !== 'All') && <button className="reset-filter" onClick={resetMenu}>Clear filters</button>}
        </section>

        <section className="menu" id="menu">
          <div className="section-title">
            <div><span className="eyebrow">THE MENU</span><h2>{category === 'All' ? 'What sounds good today?' : category}</h2></div>
            <span className="dish-count">{visibleCount} dishes</span>
          </div>

          {!visibleCategories.length ? (
            <div className="empty">
              <div><Search size={22} /></div>
              <h3>{filter === 'favorites' ? 'No saved dishes yet' : 'No dishes found'}</h3>
              <p>{filter === 'favorites' ? 'Tap the heart on a dish to save it here.' : 'Try a different search or clear the filters.'}</p>
              <button className="secondary-button" onClick={resetMenu}>Show all dishes</button>
            </div>
          ) : visibleCategories.map((group) => (
            <section className="menu-section" key={group.name}>
              {category === 'All' && (
                <div className="category-heading">
                  <div className="category-mark">{categoryEmoji(group.name)}</div>
                  <div><h3>{group.name}</h3><p>{group.description}</p></div>
                  <span>{group.items.length}</span>
                </div>
              )}
              <div className="dish-grid">
                {group.items.map((item) => {
                  const singleKey = selectionKey(item);
                  const favorite = favorites.includes(item.id);
                  return (
                    <article className="dish-card" key={item.id}>
                      <div className={item.veg ? 'dish-art veg' : 'dish-art nonveg'}>
                        <img
                          className="dish-photo"
                          src={dishImageFor(item)}
                          alt={'Representative image for ' + item.name}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }}
                        />
                        <span className="dish-image-fallback" aria-hidden="true">{categoryEmoji(item.category)}</span>
                        <span className={item.veg ? 'dish-type-badge veg-badge' : 'dish-type-badge nonveg-badge'}>
                          <i aria-hidden="true" /> {item.veg ? 'VEG' : 'NON-VEG'}
                        </span>
                        <button className={favorite ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(item.id)} aria-pressed={favorite} aria-label={favorite ? 'Remove ' + item.name + ' from favourites' : 'Save ' + item.name + ' to favourites'}>
                          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="dish-body">
                        <div className="dish-title"><span className={item.veg ? 'veg-dot' : 'nonveg-dot'} aria-hidden="true" /><h4>{item.name}</h4></div>
                        {item.sizes ? (
                          <div className="size-grid">
                            {item.sizes.map((option) => {
                              const key = selectionKey(item, option);
                              const count = selection[key]?.qty ?? 0;
                              return (
                                <button className={count ? 'size-button selected' : 'size-button'} key={option.label} onClick={() => addItem(item, option)} aria-label={'Add ' + option.label + ' ' + item.name + ' for ₹' + option.price}>
                                  <span>{option.label}</span><b>₹{formatPrice(option.price)}</b>{count > 0 && <em>{count}</em>}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="single-price">
                            <strong>₹{formatPrice(item.price ?? 0)}</strong>
                            <button className={selection[singleKey] ? 'add-button added' : 'add-button'} onClick={() => addItem(item)} aria-label={'Add ' + item.name + ' to selection'}>
                              {selection[singleKey] ? <><Check size={14} /> {selection[singleKey].qty}</> : <><Plus size={15} /> Add</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        {(RESTAURANT.address || RESTAURANT.phone || RESTAURANT.mapsUrl || RESTAURANT.whatsapp || RESTAURANT.openingHours || RESTAURANT.instagramUrl || RESTAURANT.facebookUrl) && (
          <section className="restaurant-info" id="restaurant">
            <div className="info-heading"><span className="eyebrow">PLAN YOUR VISIT</span><h2>Restaurant information</h2></div>
            <div className="info-grid">
              {RESTAURANT.address && <div className="info-card"><strong>Address</strong><p>{RESTAURANT.address}</p>{RESTAURANT.mapsUrl && <a className="info-link" href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">Get directions <ArrowRight size={14} /></a>}</div>}
              {RESTAURANT.phone && <div className="info-card"><strong>Phone</strong><p>{RESTAURANT.phone}</p><a className="info-link" href={'tel:' + RESTAURANT.phone}>Call restaurant <ArrowRight size={14} /></a></div>}
              {RESTAURANT.whatsapp && <div className="info-card"><strong>WhatsApp</strong><p>Contact the restaurant about menu items.</p><button className="info-link-button" onClick={() => openWhatsApp('Hello Biryani Spot, I have a question about the menu.')}>Message restaurant <ArrowRight size={14} /></button></div>}
              {RESTAURANT.openingHours && <div className="info-card"><strong>Opening hours</strong><p>{RESTAURANT.openingHours}</p></div>}
              {RESTAURANT.instagramUrl && <div className="info-card"><strong>Instagram</strong><a className="info-link" href={RESTAURANT.instagramUrl} target="_blank" rel="noreferrer">View profile <ArrowRight size={14} /></a></div>}
              {RESTAURANT.facebookUrl && <div className="info-card"><strong>Facebook</strong><a className="info-link" href={RESTAURANT.facebookUrl} target="_blank" rel="noreferrer">View profile <ArrowRight size={14} /></a></div>}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-brand"><img src={BRAND_MARK} alt="" /><span><strong>Biryani Spot</strong><small>Family Restaurant</small></span></div>
        <p>Tradition · Taste · Together</p>
        <div className="footer-actions">
          <button className="footer-action" onClick={shareMenu}><Share2 size={15} /> Share menu</button>
          <button className="footer-action" onClick={() => window.print()}><Printer size={15} /> Print menu</button>
          {installPrompt && <button className="footer-action" onClick={installMenu}>Add to home screen</button>}
        </div>
        <small className="footer-note">{MENU_ITEM_COUNT} menu items · Please confirm final prices and availability with the restaurant.</small>
      </footer>

      {selectedCount > 0 && !selectionOpen && !printSelection && (
        <div className="mobile-selection-bar">
          <button onClick={() => setSelectionOpen(true)} aria-label={'View selection, ' + selectedCount + ' items, estimated total ' + selectedTotal + ' rupees'}>
            <span className="mobile-selection-bag"><ShoppingBag size={18} /><i>{selectedCount}</i></span>
            <span className="mobile-selection-copy"><strong>My selection</strong><small>{selectedCount} {selectedCount === 1 ? 'item' : 'items'} · estimated total</small></span>
            <strong className="mobile-selection-total">₹{formatPrice(selectedTotal)}</strong>
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {selectionOpen && (
        <div className="overlay" onClick={() => setSelectionOpen(false)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="My Selection" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div><span className="eyebrow">YOUR TABLE LIST</span><h2>My Selection</h2><p>Review quantities and estimated prices.</p></div>
              <button className="icon-button" onClick={() => setSelectionOpen(false)} aria-label="Close selection"><X size={20} /></button>
            </div>
            {!selected.length ? (
              <div className="drawer-empty"><span><ShoppingBag size={27} /></span><h3>Your selection is empty</h3><p>Add dishes from the menu to build a list for your table.</p><button className="primary-button" onClick={() => setSelectionOpen(false)}>Browse menu <ArrowRight size={16} /></button></div>
            ) : (
              <>
                <div className="drawer-items">
                  {selected.map((entry) => {
                    const key = selectionKey(entry.item, entry.option);
                    return (
                      <div className="drawer-item" key={key}>
                        <div className="drawer-item-image"><img src={dishImageFor(entry.item)} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }} /><span aria-hidden="true">{categoryEmoji(entry.item.category)}</span></div>
                        <div className="drawer-main"><strong>{entry.item.name}</strong><small>{entry.option?.label ?? 'Regular'} · ₹{formatPrice(entry.option?.price ?? entry.item.price ?? 0)}</small><b>₹{formatPrice((entry.option?.price ?? entry.item.price ?? 0) * entry.qty)}</b></div>
                        <div className="qty">
                          <button onClick={() => changeQty(key, -1)} aria-label={'Remove one ' + entry.item.name}><Minus size={13} /></button>
                          <b>{entry.qty}</b>
                          <button onClick={() => changeQty(key, 1)} aria-label={'Add one ' + entry.item.name}><Plus size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="drawer-summary">
                  <div className="summary-total"><span>Estimated total</span><strong>₹{formatPrice(selectedTotal)}</strong></div>
                  <p>Selection only — not a confirmed order or payment. The restaurant must confirm availability and final prices.</p>
                  <div className="drawer-actions">
                    <button className="secondary-button" onClick={shareSelection}><Share2 size={15} /> Share list</button>
                    <button className="secondary-button" onClick={printSelectionNow}><Printer size={15} /> Print list</button>
                    <button className="secondary-button clear-selection" onClick={() => setSelection({})}>Clear selection</button>
                    <button className="whatsapp-button" onClick={sendWhatsApp} disabled={!canUseWhatsApp}><MessageCircle size={17} /> {canUseWhatsApp ? 'Enquire on WhatsApp' : 'WhatsApp not configured'}</button>
                  </div>
                  {!canUseWhatsApp && <small className="configuration-note">A verified restaurant WhatsApp number is needed to enable enquiries.</small>}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {printSelection && (
        <section className="print-selection" aria-hidden="true">
          <div className="print-selection-brand"><img src={BRAND_MARK} alt="" /><div><strong>Biryani Spot</strong><span>Family Restaurant</span></div></div>
          <h1>My Selection</h1>
          <p>Menu selection · Please confirm final availability and prices with restaurant staff.</p>
          <div className="print-selection-list">
            {selected.map((entry) => {
              const key = selectionKey(entry.item, entry.option);
              return <div key={key}><span>{entry.item.name}{entry.option ? ' — ' + entry.option.label : ''} × {entry.qty}</span><strong>₹{formatPrice((entry.option?.price ?? entry.item.price ?? 0) * entry.qty)}</strong></div>;
            })}
          </div>
          <div className="print-selection-total"><span>Estimated total</span><strong>₹{formatPrice(selectedTotal)}</strong></div>
        </section>
      )}

      {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
    </div>
  );
}
