import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clock3,
  Facebook,
  Heart,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  Search,
  Share2,
  ShoppingBag,
  X,
  Phone,
  Instagram,
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
const BRAND_LOGO = './brand-logo.svg';
const FAVORITES_KEY = 'biryani-spot-favorites';
const SELECTION_KEY = 'biryani-spot-selection';

const FOOD_PHOTOS = {
  biryani: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1100&q=82',
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
  if (value.includes('tandoori')) return '🍗';
  if (value.includes('soup')) return '🥣';
  if (value.includes('bread') || value.includes('naan') || value.includes('roti')) return '🫓';
  if (value.includes('rice') || value.includes('fried')) return '🍚';
  if (value.includes('noodle')) return '🍜';
  if (value.includes('curry')) return '🥘';
  if (value.includes('dessert')) return '🍮';
  if (value.includes('beverage') || value.includes('drink')) return '🥤';
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
    name.includes('majesty') || name.includes('dragon')
  ) {
    return item.veg ? FOOD_PHOTOS.vegetarian : FOOD_PHOTOS.tandoori;
  }
  if (category.includes('curry') || name.includes('masala') || name.includes('gravy')) {
    return item.veg ? FOOD_PHOTOS.vegetarian : FOOD_PHOTOS.curry;
  }
  if (item.veg) return FOOD_PHOTOS.vegetarian;
  if (name.includes('chicken') || name.includes('mutton') || name.includes('prawn') || name.includes('egg')) return FOOD_PHOTOS.tandoori;
  return FOOD_PHOTOS.curry;
};

const describeDish = (item: MenuItem) => {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();
  if (name.includes('biryani')) return 'Aromatic basmati rice layered with rich spices and restaurant-style flavour.';
  if (name.includes('soup')) return 'A comforting bowl prepared fresh with a balanced blend of seasoning.';
  if (category.includes('tandoori') || name.includes('tikka') || name.includes('kabab')) return 'Marinated with warming spices and cooked for a smoky, savoury finish.';
  if (category.includes('starter') || name.includes('65') || name.includes('manchuria')) return 'A crowd-pleasing starter with bold seasoning and plenty of flavour.';
  if (category.includes('curry') || name.includes('masala')) return 'A satisfying curry made to pair beautifully with rice or Indian breads.';
  if (name.includes('rice') || name.includes('noodle')) return 'Freshly prepared with seasoning and wok-tossed flavour in every bite.';
  if (name.includes('naan') || name.includes('roti') || name.includes('kulcha')) return 'A freshly prepared Indian bread, perfect alongside your favourite curry.';
  return item.veg
    ? 'A vegetarian favourite, prepared to order with a tasty blend of spices.'
    : 'A restaurant favourite, prepared to order with a delicious blend of spices.';
};

const galleryItems = [
  { title: 'Signature biryani', subtitle: 'Aromatic rice favourites', image: FOOD_PHOTOS.biryani, category: "Biryani's" },
  { title: 'From the tandoor', subtitle: 'Smoky and spice-kissed', image: FOOD_PHOTOS.tandoori, category: 'Tandoori Starter' },
  { title: 'Vegetarian favourites', subtitle: 'Colourful, comforting plates', image: FOOD_PHOTOS.vegetarian, category: 'Veg Starters' },
  { title: 'Rich curries', subtitle: 'A perfect meal companion', image: FOOD_PHOTOS.curry, category: 'Non Veg Curries' },
];

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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedback, setFeedback] = useState('');
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
      showNotice('Biryani Spot is ready on your home screen.');
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
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch { /* usable for this session */ }
  }, [favorites]);
  useEffect(() => {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(selection)); } catch { /* usable for this session */ }
  }, [selection]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', selectionOpen || feedbackOpen || mobileMenuOpen);
    return () => document.body.classList.remove('modal-open');
  }, [selectionOpen, feedbackOpen, mobileMenuOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectionOpen(false);
      setFeedbackOpen(false);
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

  const toggleFavorite = (id: string) =>
    setFavorites((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]);

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
  const selectedTotal = selected.reduce((sum, entry) => sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty, 0);

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
      // Sharing may be cancelled.
    }
  };

  const shareSelection = async () => {
    if (!selected.length) {
      showNotice('Add at least one dish before sharing your selection.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ' — ' + entry.option.label : '';
      const price = entry.option?.price ?? entry.item.price ?? 0;
      return (index + 1) + '. ' + entry.item.name + size + ' × ' + entry.qty + ' — ₹' + formatPrice(price * entry.qty);
    });
    const selectionText = [
      'Biryani Spot — My Menu Selection',
      '',
      ...lines,
      '',
      'Estimated total: ₹' + formatPrice(selectedTotal),
      '',
      'This is a menu selection only, not a confirmed order.',
      window.location.href,
    ].join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Biryani Spot — My Selection', text: selectionText });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(selectionText);
        showNotice('Selection copied. You can paste it into a message.');
      } else showNotice('Sharing is not available in this browser.');
    } catch {
      // Sharing may be cancelled.
    }
  };

  const openWhatsApp = (message: string) => {
    const number = RESTAURANT.whatsapp.replace(/\D/g, '');
    if (number.length < 8 || number.length > 15) {
      showNotice('WhatsApp will be enabled after the restaurant owner adds a verified number.');
      return false;
    }
    window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    return true;
  };

  const sendWhatsApp = () => {
    if (!selected.length) {
      showNotice('Add at least one dish before sending an enquiry.');
      return;
    }
    const lines = selected.map((entry, index) => {
      const size = entry.option ? ' — ' + entry.option.label : '';
      return (index + 1) + '. ' + entry.item.name + size + ' × ' + entry.qty;
    });
    const message = [
      'Hello Biryani Spot,',
      '',
      'I would like to enquire about:',
      ...lines,
      '',
      'Estimated total: ₹' + formatPrice(selectedTotal),
      '',
      'Please confirm availability and final prices. This is an enquiry, not a confirmed order.',
      'Thank you.',
    ].join('\n');
    openWhatsApp(message);
  };

  const sendFeedback = () => {
    if (!feedback.trim()) {
      showNotice('Please enter your feedback first.');
      return;
    }
    const nameLine = feedbackName.trim() ? 'Name: ' + feedbackName.trim() + '\n\n' : '';
    const message = 'Hello Biryani Spot,\n\n' + nameLine + 'I would like to share feedback:\n\n' + feedback.trim() + '\n\nThank you.';
    if (openWhatsApp(message)) {
      setFeedbackName('');
      setFeedback('');
      setFeedbackOpen(false);
    }
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
      showNotice(result.outcome === 'accepted' ? 'Biryani Spot install accepted.' : 'Install prompt dismissed.');
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
          <strong>You are offline.</strong> The menu is available, but food photos and WhatsApp may need internet.
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
          <button className="nav-link" onClick={() => jumpTo('about')}>About</button>
          <button className="nav-link" onClick={() => jumpTo('gallery')}>Gallery</button>
          <button className="nav-link" onClick={() => jumpTo('contact')}>Contact</button>
        </nav>

        <div className="top-actions">
          <button className="top-action share-action" onClick={shareMenu} aria-label="Share menu"><Share2 size={17} /><span>Share</span></button>
          <button className="selection-button" onClick={() => setSelectionOpen(true)} aria-label={'Open My Selection, ' + selectedCount + ' items'}>
            <ShoppingBag size={17} /><span>My Selection</span>
            {selectedCount > 0 && <b>{selectedCount}</b>}
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
            <button className="mobile-nav-link" onClick={() => jumpTo('home')}>Home <ArrowRight size={17} /></button>
            <button className="mobile-nav-link" onClick={() => jumpTo('menu')}>Menu <ArrowRight size={17} /></button>
            <button className="mobile-nav-link" onClick={() => jumpTo('about')}>About <ArrowRight size={17} /></button>
            <button className="mobile-nav-link" onClick={() => jumpTo('gallery')}>Gallery <ArrowRight size={17} /></button>
            <button className="mobile-nav-link" onClick={() => jumpTo('contact')}>Contact <ArrowRight size={17} /></button>
            <div className="mobile-nav-divider" />
            <button className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); setFilter('favorites'); setCategory('All'); jumpTo('menu'); }}><Heart size={17} /> Favourites <ArrowRight size={17} /></button>
            <button className="mobile-nav-link emphasized" onClick={() => { setMobileMenuOpen(false); setSelectionOpen(true); }}><ShoppingBag size={17} /> My Selection ({selectedCount}) <ArrowRight size={17} /></button>
            <p className="mobile-nav-note">Tradition · Taste · Together</p>
          </nav>
        </div>
      )}

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span className="hero-eyebrow-dot" /> TRADITION · TASTE · TOGETHER</span>
            <h1 id="hero-title">Authentic <em>Biryani Flavours.</em></h1>
            <p>From classic dum biryanis to richly spiced curries, discover a menu made for sharing with family and friends.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => jumpTo('menu')}>Explore Menu <ArrowDown size={16} /></button>
              <button className="secondary-button" onClick={() => jumpTo('gallery')}>Discover Favourites <ArrowRight size={16} /></button>
            </div>
            <div className="hero-benefits">
              <div><span className="benefit-icon">✦</span><span><strong>Made with care</strong><small>Prepared to order</small></span></div>
              <div><span className="benefit-icon">♨</span><span><strong>Indian favourites</strong><small>Classic flavours</small></span></div>
              <div><span className="benefit-icon">♡</span><span><strong>Made for sharing</strong><small>Family dining</small></span></div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src={FOOD_PHOTOS.biryani}
              alt="A serving of biryani with basmati rice and spices"
              fetchPriority="high"
              onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }}
            />
            <span className="hero-image-kicker">THE COMFORT OF A CLASSIC</span>
            <div className="hero-image-caption"><span>Good food</span><strong>brings people together.</strong></div>
            <div className="hero-photo-stamp"><span>FRESH</span><span>FLAVOUR</span><span>ALWAYS</span></div>
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
            <Search size={19} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search biryani, chicken, paneer..." aria-label="Search menu" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={17} /></button>}
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
                {value === 'all' ? 'All' : value === 'veg' ? <><span className="filter-dot veg-filter-dot" /> Veg</> : value === 'nonveg' ? <><span className="filter-dot nonveg-filter-dot" /> Non-Veg</> : <><Heart size={14} /> Saved</>}
              </button>
            ))}
          </div>
          {(query || filter !== 'all' || category !== 'All') && <button className="reset-filter" onClick={resetMenu}>Reset</button>}
        </section>

        <section className="menu" id="menu">
          <div className="section-title">
            <div><span className="eyebrow">GOOD FOOD, GOOD MOOD</span><h2>{category === 'All' ? 'Something for everyone' : category}</h2><p className="section-subtitle">Find your new favourite, one delicious dish at a time.</p></div>
            <span className="dish-count">{visibleCategories.reduce((sum, group) => sum + group.items.length, 0)} dishes</span>
          </div>

          {!visibleCategories.length ? (
            <div className="empty">
              <div><Search size={22} /></div>
              <h3>{filter === 'favorites' ? 'No favourites saved yet' : 'No dishes found'}</h3>
              <p>{filter === 'favorites' ? 'Tap the heart on a dish to keep it here for next time.' : 'Try a different search, category or filter.'}</p>
              <button className="secondary-button" onClick={resetMenu}>Browse all dishes</button>
            </div>
          ) : visibleCategories.map((group) => (
            <section className="menu-section" key={group.name}>
              <div className="category-heading">
                <div className="category-mark">{categoryEmoji(group.name)}</div>
                <div><h3>{group.name}</h3><p>{group.description}</p></div>
                <span>{group.items.length} items</span>
              </div>
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
                          alt={item.name + ' — representative food photo'}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }}
                        />
                        <span className="dish-image-fallback" aria-hidden="true">{categoryEmoji(item.category)}</span>
                        <span className={item.veg ? 'dish-type-badge veg-badge' : 'dish-type-badge nonveg-badge'} aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}>
                          <i aria-hidden="true" /> {item.veg ? 'VEG' : 'NON-VEG'}
                        </span>
                        <button className={favorite ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(item.id)} aria-pressed={favorite} aria-label={favorite ? 'Remove ' + item.name + ' from favourites' : 'Add ' + item.name + ' to favourites'}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button>
                      </div>
                      <div className="dish-body">
                        <div className="dish-title">
                          <span className={item.veg ? 'veg-dot' : 'nonveg-dot'} aria-hidden="true" />
                          <h4>{item.name}</h4>
                        </div>
                        <p className="dish-description">{describeDish(item)}</p>
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
                              {selection[singleKey] ? <><Check size={14} /> {selection[singleKey].qty} added</> : <><Plus size={15} /> Add</>}
                            </button>
                          </div>
                        )}
                        <small className="price-caption">{item.sizes ? 'Choose half or full' : 'Menu price'}</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <section className="gallery-section" id="gallery">
          <div className="gallery-heading"><div><span className="eyebrow">A LITTLE INSPIRATION</span><h2>Made for every craving</h2><p>From comforting classics to rich, spicy favourites.</p></div><button className="text-link" onClick={() => jumpTo('menu')}>Explore full menu <ArrowRight size={16} /></button></div>
          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <button className="gallery-card" key={item.title} onClick={() => chooseCategory(item.category)}>
                <img src={item.image} alt={item.title + ' food inspiration'} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }} />
                <span className="gallery-fallback" aria-hidden="true">{categoryEmoji(item.category)}</span>
                <span className="gallery-card-copy"><strong>{item.title}</strong><small>{item.subtitle}</small><span>Explore category <ArrowRight size={14} /></span></span>
              </button>
            ))}
          </div>
        </section>

        <section className="restaurant-info" id="about">
          <div className="info-brand"><img src={BRAND_MARK} alt="" /><div><span className="eyebrow">TRADITION · TASTE · TOGETHER</span><h2>Welcome to Biryani Spot</h2><p>A place for comforting meals and family favourites.</p></div></div>
          <div className="info-grid">
            <div className="info-card"><span className="info-icon"><MapPin size={20} /></span><strong>Visit Us</strong><p>{RESTAURANT.address || 'Restaurant address will be added after owner confirmation.'}</p>{RESTAURANT.mapsUrl && <a className="info-link" href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer">Get directions <ArrowRight size={14} /></a>}</div>
            <div className="info-card"><span className="info-icon"><Phone size={20} /></span><strong>Call the restaurant</strong><p>{RESTAURANT.phone || 'Verified phone number required.'}</p>{RESTAURANT.phone && <a className="info-link" href={'tel:' + RESTAURANT.phone}>Call now <ArrowRight size={14} /></a>}</div>
            <div className="info-card"><span className="info-icon"><MessageCircle size={20} /></span><strong>WhatsApp</strong><p>{RESTAURANT.whatsapp || 'Verified WhatsApp number required.'}</p>{RESTAURANT.whatsapp && <button className="info-link-button" onClick={() => openWhatsApp('Hello Biryani Spot, I have a question about the menu.')}>Chat with us <ArrowRight size={14} /></button>}</div>
            <div className="info-card"><span className="info-icon"><Clock3 size={20} /></span><strong>Opening hours</strong><p>{RESTAURANT.openingHours || 'Opening hours will be added after owner confirmation.'}</p></div>
          </div>
          <div className="contact-actions" id="contact">
            {RESTAURANT.instagramUrl && <a className="secondary-button" href={RESTAURANT.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>}
            {RESTAURANT.facebookUrl && <a className="secondary-button" href={RESTAURANT.facebookUrl} target="_blank" rel="noreferrer"><Facebook size={16} /> Facebook</a>}
            <button className="secondary-button" onClick={() => setFeedbackOpen(true)}>Send feedback</button>
            <button className="secondary-button" onClick={shareMenu}><Share2 size={16} /> Share menu</button>
          </div>
        </section>

        <section className="family-note">
          <div><span className="eyebrow">SAVE YOUR PLACE AT THE TABLE</span><h2>Come hungry, leave happy.</h2><p>Build a selection, review estimated prices, and send an enquiry when you are ready.</p></div>
          <div className="note-actions"><button className="secondary-button" onClick={() => window.print()}><Printer size={16} /> Print menu</button><button className="secondary-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <ArrowDown size={15} className="arrow-up" /></button></div>
        </section>
      </main>

      <footer className="footer">
        <img className="footer-logo" src={BRAND_LOGO} alt="Biryani Spot Family Restaurant logo" loading="lazy" />
        <div><strong>Biryani Spot</strong><span>Family Restaurant</span></div>
        <p>Tradition · Taste · Together</p>
        <small>Digital menu · {MENU_ITEM_COUNT} dishes · Please confirm prices and availability with the restaurant.</small>
        {installPrompt && <button className="footer-install" onClick={installMenu}>Add to Home Screen</button>}
      </footer>

      {selectedCount > 0 && !selectionOpen && !printSelection && (
        <div className="mobile-selection-bar">
          <button onClick={() => setSelectionOpen(true)} aria-label={'View selection, ' + selectedCount + ' items, estimated total ' + selectedTotal + ' rupees'}>
            <span className="mobile-selection-bag"><ShoppingBag size={19} /><i>{selectedCount}</i></span>
            <span className="mobile-selection-copy"><strong>View selection</strong><small>{selectedCount} {selectedCount === 1 ? 'item' : 'items'} · estimated total</small></span>
            <strong className="mobile-selection-total">₹{formatPrice(selectedTotal)}</strong><ArrowRight size={17} />
          </button>
        </div>
      )}

      {selectionOpen && (
        <div className="overlay" onClick={() => setSelectionOpen(false)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="My Selection" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div><span className="eyebrow">YOUR TABLE LIST</span><h2>My Selection</h2><p>Review your choices before sending an enquiry.</p></div>
              <button className="icon-button" onClick={() => setSelectionOpen(false)} aria-label="Close selection"><X size={20} /></button>
            </div>
            {!selected.length ? (
              <div className="drawer-empty"><span><ShoppingBag size={27} /></span><h3>Your selection is empty</h3><p>Add dishes from the menu to create a quick list for your table.</p><button className="primary-button" onClick={() => setSelectionOpen(false)}>Continue browsing <ArrowRight size={16} /></button></div>
            ) : (
              <>
                <div className="drawer-items">
                  {selected.map((entry) => {
                    const key = selectionKey(entry.item, entry.option);
                    return (
                      <div className="drawer-item" key={key}>
                        <div className="drawer-item-image">
                          <img src={dishImageFor(entry.item)} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-failed'); }} />
                          <span aria-hidden="true">{categoryEmoji(entry.item.category)}</span>
                        </div>
                        <div className="drawer-main"><strong>{entry.item.name}</strong><small>{entry.option?.label ?? 'Regular'} · ₹{formatPrice(entry.option?.price ?? entry.item.price ?? 0)}</small><b>₹{formatPrice((entry.option?.price ?? entry.item.price ?? 0) * entry.qty)}</b></div>
                        <div className="qty">
                          <button onClick={() => changeQty(key, -1)} aria-label={'Remove one ' + entry.item.name}> <Minus size={14} /> </button>
                          <b>{entry.qty}</b>
                          <button onClick={() => changeQty(key, 1)} aria-label={'Add one ' + entry.item.name}><Plus size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="drawer-summary">
                  <div className="summary-total"><span>Estimated total</span><strong>₹{formatPrice(selectedTotal)}</strong></div>
                  <p>This is a menu enquiry only. The restaurant must confirm final prices, availability, and your order.</p>
                  <div className="drawer-actions">
                    <button className="secondary-button" onClick={shareSelection}><Share2 size={16} /> Share list</button>
                    <button className="secondary-button" onClick={printSelectionNow}><Printer size={16} /> Print</button>
                    <button className="secondary-button clear-selection" onClick={() => setSelection({})}>Clear selection</button>
                    <button className="whatsapp-button" onClick={sendWhatsApp}><MessageCircle size={18} /> Enquire on WhatsApp</button>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {feedbackOpen && (
        <div className="overlay" onClick={() => setFeedbackOpen(false)}>
          <div className="feedback-modal" role="dialog" aria-modal="true" aria-label="Send Feedback" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head"><div><span className="eyebrow">BIRYANI SPOT</span><h2>Send feedback</h2><p>Your thoughts help us improve.</p></div><button className="icon-button" onClick={() => setFeedbackOpen(false)} aria-label="Close feedback form"><X size={20} /></button></div>
            <label className="feedback-field"><span>Name <small>(optional)</small></span><input value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} placeholder="Your name" autoComplete="name" /></label>
            <label className="feedback-field"><span>Feedback <b>(required)</b></span><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us about your experience..." required /></label>
            <div className="drawer-actions feedback-actions"><button className="secondary-button" onClick={() => setFeedbackOpen(false)}>Cancel</button><button className="primary-button" onClick={sendFeedback}><MessageCircle size={16} /> Send on WhatsApp</button></div>
          </div>
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
