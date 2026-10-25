import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  ChevronRight,
  Clock,
  Flame,
  Headset,
  Leaf,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  Utensils,
  X,
} from 'lucide-react';
import { MENU, MENU_ITEM_COUNT, type MenuItem, type SizeOption } from './data/menu';
import { RESTAURANT } from './config/restaurant';
import { translateText, type Language } from './i18n';
import { SPECIAL_DISHES, SPECIAL_DISH_IMAGES } from './data/specials';

// Shared application types and display helpers.
type Entry = { item: MenuItem; option?: SizeOption; qty: number };
type Selection = Record<string, Entry>;
type Page = 'welcome' | 'menu';

// Local welcome-page ambience image; upload it to public/welcome-food-showcase.png.
const heroImage = './welcome-food-showcase.png';
const keyFor = (item: MenuItem, option?: SizeOption) =>
  item.id + '-' + (option?.label ?? 'single');
const slug = (name: string) =>
  'category-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const money = (price: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
const customerCarePhone = '8985579991';

// Reusable bilingual control used on both the welcome and menu pages.
function LanguageToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={translateText('Language', language)}
    >
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        aria-pressed={language === 'en'}
        onClick={() => onChange('en')}
      >
        English
      </button>
      <button
        type="button"
        className={language === 'te' ? 'active' : ''}
        aria-pressed={language === 'te'}
        onClick={() => onChange('te')}
      >
        తెలుగు
      </button>
    </div>
  );
}

// Category-level photographs. Each filename is stored directly in public/.
const CATEGORY_PHOTOS: Record<string, string> = {
  'Non-Veg Soups': 'non-veg-soups.png',
  'Veg Soups': 'veg-soups.png',
  'Veg Starters': 'veg-starters.png',
  'Non-Veg Starters': 'non-veg-starters.png',
  'Tandoori Starter': 'tandoori-starter.png',
  'Veg Tandoori Starter': 'veg-tandoori-starter.png',
  "Biryani's": 'biryanis.png',
  'Veg Friedrice': 'veg-friedrice.png',
  'Noodles': 'noodles.png',
  'Non Veg Friedrice': 'non-veg-friedrice.png',
  'Roti & Naan': 'roti-naan.png',
  'Veg Curries': 'veg-curries.png',
  'Non Veg Curries': 'non-veg-curries.png',
};

// Main screen: state, storage effects, derived menu data, and customer actions.
export default function App() {
  const [page, setPage] = useState<Page>(() => {
    try {
      return sessionStorage.getItem('biryani-spot-page') === 'menu' ? 'menu' : 'welcome';
    } catch {
      return 'welcome';
    }
  });
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('biryani-spot-language') === 'te' ? 'te' : 'en';
    } catch {
      return 'en';
    }
  });
  const tx = (value: string) => translateText(value, language);
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [active, setActive] = useState(MENU[0]?.name ?? '');
  const [selection, setSelection] = useState<Selection>(() => {
    try {
      return JSON.parse(localStorage.getItem('biryani-spot-selection') ?? '{}') as Selection;
    } catch {
      return {};
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState('');

  // Keep the language choice and customer selection across refreshes.
  useEffect(() => {
    try {
      localStorage.setItem('biryani-spot-language', language);
    } catch {
      // The current session can still use the selected language.
    }
    document.documentElement.lang = language === 'te' ? 'te' : 'en';
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('biryani-spot-selection', JSON.stringify(selection));
    } catch {
      // Selection still works until the page is closed.
    }
  }, [selection]);

  useEffect(() => {
    try {
      sessionStorage.setItem('biryani-spot-page', page);
    } catch {
      // Remembering the current page is optional.
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', drawer);
    return () => document.body.classList.remove('modal-open');
  }, [drawer]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const toast = (message: string) => {
    setNotice(tx(message));
    window.setTimeout(() => setNotice(''), 2500);
  };

  const entries = Object.values(selection);
  const count = entries.reduce((sum, entry) => sum + entry.qty, 0);
  const total = entries.reduce(
    (sum, entry) => sum + (entry.option?.price ?? entry.item.price ?? 0) * entry.qty,
    0,
  );
  const whatsapp = RESTAURANT.whatsapp.replace(/\D/g, '');
  const canWhatsApp = whatsapp.length >= 8 && whatsapp.length <= 15;

  // Build the visible category list from the current search and dietary filter.
  const categories = useMemo(() => {
    const term = query.trim().toLowerCase();

    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const searchableText = [
          group.name,
          group.description,
          item.name,
          translateText(group.name, 'te'),
          translateText(group.description, 'te'),
          translateText(item.name, 'te'),
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = !term || searchableText.includes(term);
        const matchesDiet =
          diet === 'all' || (diet === 'veg' ? item.veg : !item.veg);

        return matchesSearch && matchesDiet;
      }),
    })).filter((group) => group.items.length > 0);
  }, [query, diet]);

  useEffect(() => {
    if (categories.length && !categories.some((item) => item.name === active)) {
      setActive(categories[0].name);
    }

    const onScroll = () => {
      const navBottom =
        document.querySelector('.menu-tools')?.getBoundingClientRect().bottom ?? 130;
      let current = '';

      for (const group of categories) {
        const section = document.getElementById(slug(group.name));
        if (section && section.getBoundingClientRect().top <= navBottom + 16) {
          current = group.name;
        }
      }

      if (current) {
        setActive((old) => (old === current ? old : current));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [categories, active]);

  // Keep the horizontal category strip synchronized with the section currently in view.
  // Scroll only the strip horizontally so the page itself never jumps vertically.
  useEffect(() => {
    const nav = document.querySelector('.category-nav') as HTMLElement | null;
    const chip = nav?.querySelector('.category-chip.active') as HTMLElement | null;
    if (!nav || !chip) return;
    const navRect = nav.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const chipCenter = chipRect.left - navRect.left + nav.scrollLeft + chipRect.width / 2;
    const targetLeft = Math.max(0, chipCenter - nav.clientWidth / 2);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    nav.scrollTo({ left: targetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [active, categories]);

  // Specials are configured separately and resolved to the canonical menu records.
  // Add more names in src/data/specials.ts without changing this component.
  const specials = SPECIAL_DISHES;

  // Centralize item updates so quantities and estimated totals stay consistent.
  const add = (item: MenuItem, option?: SizeOption) => {
    const key = keyFor(item, option);
    setSelection((old) => ({
      ...old,
      [key]: {
        item,
        option,
        qty: Math.min(99, (old[key]?.qty ?? 0) + 1),
      },
    }));

    toast(
      item.name +
        (option ? ' (' + option.label.toLowerCase() + ')' : '') +
        ' added',
    );
  };

  const change = (key: string, amount: number) => {
    setSelection((old) => {
      const entry = old[key];
      if (!entry) return old;

      const next = { ...old };
      const quantity = entry.qty + amount;

      if (quantity <= 0) {
        delete next[key];
      } else {
        next[key] = { ...entry, qty: Math.min(99, quantity) };
      }

      return next;
    });
  };

  const clearFilters = () => {
    setQuery('');
    setDiet('all');
    setActive(MENU[0]?.name ?? '');
  };

  const jump = (name: string) => {
    setActive(name);
    const target = document.getElementById(slug(name));
    const offset =
      document.querySelector('.menu-tools')?.getBoundingClientRect().bottom ?? 120;

    if (target) {
      window.scrollTo({
        top: Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - offset - 8,
        ),
        behavior: 'smooth',
      });
    }
  };

  const home = () => {
    clearFilters();
    setDrawer(false);
    setPage('welcome');
  };

  const menu = () => setPage('menu');

  const specialDishClick = (item: MenuItem) => {
    const parent = MENU.find((group) =>
      group.items.some((dish) => dish.id === item.id),
    );

    setPage('menu');
    if (parent) {
      window.setTimeout(() => jump(parent.name), 80);
    }
  };

  const sendEnquiry = () => {
    if (!entries.length) {
      toast('Add a dish to your selection first.');
      return;
    }
    if (!canWhatsApp) {
      toast('Restaurant WhatsApp is not configured yet.');
      return;
    }

    const lines = entries.map((entry, index) => {
      const price = entry.option?.price ?? entry.item.price ?? 0;
      const optionLabel = entry.option ? ' (' + tx(entry.option.label) + ')' : '';
      return (
        (index + 1) +
        '. ' +
        tx(entry.item.name) +
        optionLabel +
        ' × ' +
        entry.qty +
        ' — ₹' +
        money(price * entry.qty)
      );
    });

    const message = [
      tx('Hello Biryani Spot, I would like to enquire about these items:'),
      '',
      ...lines,
      '',
      tx('Estimated menu total: ₹') + money(total),
      '',
      tx(
        'Please confirm availability, final prices and order details. This is an enquiry, not a confirmed order.',
      ),
    ].join('\n');

    window.open(
      'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message),
      '_blank',
      'noopener,noreferrer',
    );
  };

  // Page rendering is kept in one component so menu records remain the single data source.
  return <div className={count && !drawer ? 'app-shell has-selection' : 'app-shell'}>
    {page === 'welcome' ? <main className="welcome-page" id="top">
      <div className="welcome-actions">
        <LanguageToggle language={language} onChange={setLanguage}/>
        <button className="welcome-action welcome-action--refresh" onClick={() => window.location.reload()} aria-label={tx('Refresh')}><RefreshCw size={13}/> {tx('Refresh')}</button>
        <button className="welcome-action welcome-action--menu" onClick={menu}>{tx('View Menu')} <ArrowRight size={14}/></button>
      </div>
      <section className="welcome-brand-block">
        <div className="welcome-brand-lockup">
          <img className="welcome-logo-image" src="./biryani-spot-logo.png" alt={tx('Biryani Spot Family Restaurant logo')} width="449" height="449" fetchPriority="high" decoding="async"/>
        </div>
        <p className="welcome-overline">{tx('WELCOME TO BIRYANI SPOT')}</p>
        <h2>{tx('Good Food, Happy Moments')}</h2>
        <p className="welcome-intro">{tx('Biryani, tandoori favourites and familiar flavours made for sharing.')}</p>
        <button className="primary-button welcome-main-cta" onClick={menu}>{tx('Explore the full menu')} <ArrowRight size={17}/></button>
      </section>
      <section className="welcome-food-feature">
        <div className="welcome-food-image">
          <img src={heroImage} alt={tx('Biryani Spot restaurant ambience')} loading="eager" onError={(event) => { event.currentTarget.style.display = 'none'; }}/>
          <div className="welcome-food-overlay"/><span className="image-caption">{tx('FLAVOUR IN EVERY SERVING')}</span>
        </div>
        <div className="welcome-food-copy">
          <span className="section-kicker"><Flame size={14}/> {tx('SIGNATURE FAVOURITES')}</span>
          <h2>{tx('Find your next favourite.')}</h2>
          <p>{tx('Explore the menu, choose the dishes you love, and prepare your selection before enquiring with the restaurant.')}</p>
          <button className="text-button" onClick={menu}>{tx('Browse all dishes')} <ChevronRight size={16}/></button>
        </div>
      </section>
      <section className="signature-section">
        <div className="section-heading">
          <span className="section-kicker"><ChefHat size={14}/> {tx('CURRENT SPECIALS')}</span>
          <h2>{tx("Today's Specials")}</h2>
          <p>{tx('Explore the latest specials from our kitchen.')}</p>
        </div>
        <div className="signature-grid">
          {specials.map((item, index) => (
            <button
              key={item.id}
              className={'signature-card signature-card--' + (index + 1)}
              onClick={() => specialDishClick(item)}
            >
              <span className="signature-card-art" aria-hidden="true">
                <ChefHat size={28} />
                <i>{tx(item.category)}</i>
                <img
                  className="special-dish-photo"
                  src={"./specials/" + SPECIAL_DISH_IMAGES[item.name as keyof typeof SPECIAL_DISH_IMAGES]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </span>
              <span className="signature-card-copy">
                <small>{tx('SPECIAL ITEM')}</small>
                <strong>{tx(item.name)}</strong>
                <span>
                  {item.sizes
                    ? tx('From ₹') + money(item.sizes[0].price)
                    : '₹' + money(item.price ?? 0)}
                </span>
              </span>
              <span className="signature-arrow"><ArrowRight size={15}/></span>
            </button>
          ))}
        </div>
      </section>
      <section className="welcome-promise"><span className="promise-icon"><Utensils size={19}/></span><div><strong>{tx('Good food. Good company.')}</strong><p>{tx('Take a look at the menu and discover something delicious.')}</p></div><button className="promise-cta" onClick={menu}>{tx('View menu')} <ArrowRight size={15}/></button></section>
      <footer className="welcome-footer"><img className="footer-logo" src="./biryani-spot-logo.png" alt={tx('Biryani Spot Family Restaurant')} width="449" height="449" loading="lazy" decoding="async"/><div className="restaurant-details"><p><Clock size={15}/><span><strong>{tx('Opening hours')}</strong>{RESTAURANT.openingHours}</span></p><a href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={15}/><span><strong>{tx('Visit us')}</strong>{RESTAURANT.address}</span></a></div><div className="footer-contact footer-contact--actions" aria-label={tx('Restaurant contact options')}><a className="footer-contact-link footer-contact-link--delivery" href={"tel:" + RESTAURANT.phone.replace(/[^+\d]/g, "")}><Truck size={15}/><span><strong>{tx('Home Delivery')}</strong><small>{RESTAURANT.phone.replace("+91 ", "")}</small></span></a><a className="footer-contact-link footer-contact-link--care" href={"tel:+91" + customerCarePhone} aria-label={tx('Call customer care')}><Headset size={15}/><span><strong>{tx('Customer Care')}</strong><small>{tx('Contact support')}</small></span></a><a className="footer-contact-link footer-contact-link--whatsapp" href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15}/><span><strong>{tx('WhatsApp')}</strong><small>{tx('Chat with restaurant')}</small></span></a></div><p>{tx('Menu prices and availability may change. Please confirm with the restaurant.')}</p></footer>
    </main> : <>
      <header className="site-header" id="top">
        <button className="header-brand" onClick={home} aria-label={tx('Biryani Spot home')}><img className="header-logo" src="./biryani-spot-logo.png" alt="" width="449" height="449" decoding="async"/><span className="header-brand-copy"><span className="brand-wordmark">{tx('Biryani')} <em>{tx('Spot')}</em></span><small>{tx('FAMILY RESTAURANT')}</small></span></button>
        <nav className="desktop-links" aria-label={tx('Main navigation')}><button onClick={home}>{tx('Home')}</button><a href="#menu">{tx('Menu')}</a><a href="#menu-footer">{tx('About')}</a></nav>
        <div className="header-actions"><span className="menu-count">{MENU_ITEM_COUNT} {tx('dishes')}</span><button className="header-bag" onClick={() => setDrawer(true)} aria-label={tx('Open selection, ') + count + tx(' items')}><ShoppingBag size={17}/><span>{tx('My selection')}</span>{count > 0 && <b>{count}</b>}</button></div>
      </header>
      <main id="menu" className="menu-page">
        <div className="menu-back-row"><button className="back-home" onClick={home}><ArrowLeft size={13}/> {tx('Restaurant Home')}</button><span>{tx('GOOD FOOD, HAPPY MOMENTS')}</span></div>
        <section className="menu-brand-panel"><img className="menu-page-logo" src="./biryani-spot-logo.png" alt={tx('Biryani Spot Family Restaurant')} width="449" height="449" loading="lazy" decoding="async"/><h1>{tx('Our')} <em>{tx('Menu')}</em></h1><p>{tx('Authentic favourites, generous portions and something for every appetite.')}</p><div className="menu-brand-ornament"><i/><Utensils size={15}/><i/></div></section>
        <section className="menu-tools" aria-label={tx('Search and menu categories')}>
          <div className="navigation-top-row">
            <label className="search-field"><Search size={17} aria-hidden="true"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tx('Search dishes or categories')} aria-label={tx('Search dishes or categories')}/>{query && <button onClick={() => setQuery('')} aria-label={tx('Clear search')}><X size={15}/></button>}</label>
            <div className="diet-filters" role="group" aria-label={tx('Dietary filter')}>
              <button className={diet === 'all' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('all')} aria-pressed={diet === 'all'}>{tx('All')}</button>
              <button className={diet === 'veg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('veg')} aria-pressed={diet === 'veg'}><Leaf size={12}/> {tx('Veg')}</button>
              <button className={diet === 'nonveg' ? 'diet-chip active' : 'diet-chip'} onClick={() => setDiet('nonveg')} aria-pressed={diet === 'nonveg'}><Flame size={12}/> {tx('Non-veg')}</button>
            </div>
            <LanguageToggle language={language} onChange={setLanguage}/>
          </div>
          <div className="category-nav" aria-label={tx('Jump to a category')}>{categories.map((group) => <button key={group.name} aria-current={active === group.name ? 'location' : undefined} className={active === group.name ? 'category-chip active' : 'category-chip'} onClick={() => jump(group.name)}><span>{tx(group.short)}</span>{tx(group.name)}</button>)}</div>
          <div className="navigation-count"><span>{categories.reduce((sum, c) => sum + c.items.length, 0)} {tx('dishes shown')}</span>{(query || diet !== 'all') && <button onClick={clearFilters}>{tx('Clear filters')} <X size={12}/></button>}</div>
        </section>
        {categories.length ? <div className="category-panels">{categories.map((group, index) => {
          return <section id={slug(group.name)} className={'category-panel category-panel--' + (index % 5 + 1)} key={group.name}>
            <div className="category-panel-inner">
              <div className="category-heading"><div className="category-heading-main"><img className="category-heading-photo" src={"./" + CATEGORY_PHOTOS[group.name]} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }}/><div className="category-heading-copy"><span className="category-eyebrow">{tx('BIRYANI SPOT')} <i/> {tx('MENU COLLECTION')}</span><h2>{tx(group.name)}</h2><p>{tx(group.description)}</p></div></div><span className="category-item-count">{group.items.length} {tx('ITEMS')}</span></div>
              <div className="category-content">
                <div className="dish-grid">{group.items.map((item) => {
                  const single = keyFor(item); const quantity = selection[single]?.qty ?? 0;
                  return <article className="menu-dish" key={item.id}>
                    <div className="dish-main"><span className={item.veg ? 'diet-mark veg-mark' : 'diet-mark nonveg-mark'} aria-label={tx(item.veg ? 'Vegetarian' : 'Non-vegetarian')}><i/></span><span className="dish-name">{tx(item.name)}</span></div>
                    {item.sizes ? <div className="dish-size-actions">{item.sizes.map((option) => { const key = keyFor(item, option); const qty = selection[key]?.qty ?? 0; return <button key={option.label} className={qty ? 'size-add selected' : 'size-add'} onClick={() => add(item, option)} aria-label={tx('Add ') + tx(item.name) + ' ' + tx(option.label) + ', ₹' + option.price}><span>{option.label === 'Half' ? 'H' : 'F'}</span><strong>₹{money(option.price)}</strong>{qty > 0 && <small>{qty}</small>}</button>; })}</div> : <div className="dish-action"><strong className="dish-price">₹{money(item.price ?? 0)}</strong><button className={quantity ? 'dish-add added' : 'dish-add'} onClick={() => add(item)} aria-label={tx('Add ') + tx(item.name)}>{quantity ? <><Check size={13}/><span>{quantity}</span></> : <Plus size={15}/>}</button></div>}
                  </article>;
                })}</div>
              </div>
            </div>
          </section>;
        })}</div> : <section className="empty-state"><Search size={25}/><h2>{tx('No dishes found')}</h2><p>{tx('Try another search or remove one of the filters.')}</p><button onClick={clearFilters}>{tx('Show all dishes')}</button></section>}
        <p className="menu-disclaimer">{tx('Prices are shown as listed on the menu. Please confirm availability and final prices with the restaurant.')}</p>
      </main>
      <footer id="menu-footer" className="site-footer"><img className="footer-logo" src="./biryani-spot-logo.png" alt={tx('Biryani Spot Family Restaurant')} width="449" height="449" loading="lazy" decoding="async"/><p>{tx('Good food. Good company.')}</p><div className="restaurant-details"><p><Clock size={15}/><span><strong>{tx('Opening hours')}</strong>{RESTAURANT.openingHours}</span></p><a href={RESTAURANT.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={15}/><span><strong>{tx('Visit us')}</strong>{RESTAURANT.address}</span></a></div><div className="footer-contact footer-contact--actions" aria-label={tx('Restaurant contact options')}><a className="footer-contact-link footer-contact-link--delivery" href={"tel:" + RESTAURANT.phone.replace(/[^+\d]/g, "")}><Truck size={15}/><span><strong>{tx('Home Delivery')}</strong><small>{RESTAURANT.phone.replace("+91 ", "")}</small></span></a><a className="footer-contact-link footer-contact-link--care" href={"tel:+91" + customerCarePhone} aria-label={tx('Call customer care')}><Headset size={15}/><span><strong>{tx('Customer Care')}</strong><small>{tx('Contact support')}</small></span></a><a className="footer-contact-link footer-contact-link--whatsapp" href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15}/><span><strong>{tx('WhatsApp')}</strong><small>{tx('Chat with restaurant')}</small></span></a></div></footer>
    </>}

    {count > 0 && !drawer && <div className="selection-bar"><button type="button" className="selection-fab" onClick={() => setDrawer(true)} aria-label={tx('Open selection: ') + count + (count === 1 ? ' ' + tx('item') : tx(' items')) + tx(', estimated total ₹') + money(total)} title={tx('View selection · ₹') + money(total)}><ShoppingBag size={22} strokeWidth={1.9}/><span className="selection-count-badge" aria-hidden="true">{count}</span></button></div>}
    {drawer && <div className="drawer-overlay" onClick={() => setDrawer(false)}><aside className="selection-drawer" role="dialog" aria-modal="true" aria-label={tx('Your selection')} onClick={(e) => e.stopPropagation()}>
      <div className="drawer-heading"><div><span className="section-kicker">{tx('BIRYANI SPOT')}</span><h2>{tx('Your selection')}</h2><p>{tx('Check your dishes before sending an enquiry.')}</p></div><button className="close-drawer" onClick={() => setDrawer(false)} aria-label={tx('Close selection')}><X size={20}/></button></div>
      {!entries.length ? <div className="drawer-empty"><ShoppingBag size={30}/><h3>{tx('Your selection is empty')}</h3><p>{tx('Add dishes from the menu and they will appear here.')}</p><button className="primary-button" onClick={() => setDrawer(false)}>{tx('Browse menu')} <ChevronRight size={15}/></button></div> : <>
        <div className="selected-items">{entries.map((entry) => { const key = keyFor(entry.item, entry.option); const price = entry.option?.price ?? entry.item.price ?? 0; return <div className="selected-item" key={key}><div className="selected-item-copy"><strong>{tx(entry.item.name)}</strong><small>{entry.option ? tx(entry.option.label) : tx('Regular')} · ₹{money(price)}</small><b>₹{money(price * entry.qty)}</b></div><div className="quantity-control"><button onClick={() => change(key, -1)} aria-label={tx('Remove one ') + tx(entry.item.name)}><Minus size={13}/></button><span>{entry.qty}</span><button onClick={() => change(key, 1)} aria-label={tx('Add one ') + tx(entry.item.name)}><Plus size={13}/></button></div></div>; })}</div>
        <div className="drawer-checkout"><div className="total-line"><span>{tx('Estimated total')}</span><strong>₹{money(total)}</strong></div><button className="clear-selection" onClick={() => setSelection({})}>{tx('Clear selection')}</button></div>
      </>}
    </aside></div>}
    {notice && <div className="toast" role="status"><Check size={15}/>{notice}</div>}
  </div>;
}
