import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { RestaurantHeader } from './components/RestaurantHeader';
import { CategoryNavigation } from './components/CategoryNavigation';
import { MenuSection } from './components/MenuSection';
import { Footer } from './components/Footer';
import { CartBar } from './components/CartBar';
import { CartDrawer } from './components/CartDrawer';
import { WelcomePage } from './components/WelcomePage';
import { CartProvider } from './context/CartContext';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { RESTAURANT_INFO } from './config/restaurant';
import { MENU_DATA } from './data/menu';
import type { MenuItemData } from './data/menu';

const MenuItemDetails = lazy(() => import('./components/MenuItemDetails').then((module) => ({ default: module.MenuItemDetails })));
export type MenuFilter = 'all' | 'veg' | 'nonveg';
export type AppPage = 'welcome' | 'menu';

function App() {
  const [page, setPage] = useState<AppPage>('welcome');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [menuFilter, setMenuFilter] = useState<MenuFilter>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', RESTAURANT_INFO.theme.primary);
    root.style.setProperty('--color-primary-hover', RESTAURANT_INFO.theme.hover);
    root.style.setProperty('--color-primary-light', RESTAURANT_INFO.theme.light);
    root.style.setProperty('--color-accent', RESTAURANT_INFO.theme.accent);
    root.style.setProperty('--menu-bg', RESTAURANT_INFO.theme.pageBackground);
    root.style.setProperty('--menu-surface', RESTAURANT_INFO.theme.surface);
  }, []);

  const filteredCategories = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    return MENU_DATA.map((category) => {
      const items = category.items.filter((item) => {
        const searchable = `${category.name} ${item.name} ${item.description ?? ''} ${item.badge ?? ''}`.toLowerCase();
        if (query && !searchable.includes(query)) return false;
        if (menuFilter === 'veg') return item.isVeg;
        if (menuFilter === 'nonveg') return !item.isVeg;
        return true;
      });
      return items.length ? { ...category, items } : null;
    }).filter((category): category is NonNullable<typeof category> => category !== null);
  }, [deferredSearchQuery, menuFilter]);

  const totalVisibleItems = useMemo(() => filteredCategories.reduce((total, category) => total + category.items.length, 0), [filteredCategories]);
  const hasActiveFilter = searchQuery.trim().length > 0 || menuFilter !== 'all';
  const clearFilters = useCallback(() => { setSearchQuery(''); setMenuFilter('all'); }, []);
  const handleItemClick = useCallback((item: MenuItemData) => setSelectedItem(item), []);
  const handleSpecialItemClick = useCallback((item: MenuItemData) => setSelectedItem(item), []);
  const handleCloseDetails = useCallback(() => setSelectedItem(null), []);
  const openMenu = useCallback(() => { setPage('menu'); window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  const openWelcome = useCallback(() => { setPage('welcome'); setSearchQuery(''); setMenuFilter('all'); window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  const refreshPage = useCallback(() => { window.location.reload(); }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, [selectedItem]);

  return (
    <AppErrorBoundary>
      <CartProvider>
        <div className="min-h-screen bg-[var(--menu-bg)] text-[var(--menu-text)]">
          {page === 'menu' && <RestaurantHeader />}
          {page === 'welcome' ? (
            <WelcomePage restaurant={RESTAURANT_INFO} categories={MENU_DATA} onViewMenu={openMenu} onSpecialItemClick={handleSpecialItemClick} />
          ) : (
            <main id="menu" className="bg-[var(--menu-bg)]">
              <div className="sticky top-[66px] z-30 border-b border-[#eadfd7] bg-white/95 px-4 py-1.5 backdrop-blur-md md:top-[59px]">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
                  <button type="button" onClick={openWelcome} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-[#73594d] transition hover:bg-[#fff7f2] hover:text-[var(--color-primary)]"><ArrowLeft className="h-3 w-3" /> Back to specials</button>
                  <button type="button" onClick={refreshPage} aria-label="Refresh menu" title="Refresh menu" className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfd7] bg-white px-3 py-1 text-[10px] font-bold text-[#73594d] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"><RefreshCw className="h-3 w-3" /> Refresh</button>
                </div>
              </div>
              <section className="menu-hero">
                <div className="mx-auto max-w-4xl px-4 py-4 text-center sm:px-5 sm:py-10">
                  <p className="mb-1 text-[8px] font-bold uppercase tracking-[.24em] text-[#8F241B] sm:mb-2 sm:text-[10px] sm:tracking-[.28em]">{RESTAURANT_INFO.name}</p>
                  <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight text-[#3b2922] sm:text-[46px]">Our Menu</h1>
                  <p className="mx-auto mt-1 max-w-2xl text-[11px] leading-4 text-[#8c6d5f] sm:mt-2 sm:text-[15px]">{RESTAURANT_INFO.description}</p>
                </div>
              </section>
              <CategoryNavigation categories={filteredCategories} searchQuery={searchQuery} onSearchChange={setSearchQuery} menuFilter={menuFilter} onFilterChange={setMenuFilter} />
              {filteredCategories.length > 0 ? <div className="animate-menu-enter">{filteredCategories.map((category) => <MenuSection key={category.id} category={category} onItemClick={handleItemClick} />)}</div> : <section className="flex min-h-[40vh] items-center justify-center px-5 py-16"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#b78d7a]">Menu search</p><h2 className="font-display mt-2 text-2xl font-bold">No dishes found</h2><p className="mt-2 text-sm text-[var(--menu-muted)]">Try another dish name or reset the filters.</p><button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white">Show all dishes</button></div></section>}
              {hasActiveFilter && filteredCategories.length > 0 && <div className="border-t border-[#eadfd7] px-4 py-4"><div className="mx-auto flex max-w-4xl items-center justify-between rounded-xl border border-[#eadfd7] bg-white px-4 py-3"><p className="text-sm text-[var(--menu-muted)]">Showing <strong className="text-[var(--menu-text)]">{totalVisibleItems}</strong> {totalVisibleItems === 1 ? 'dish' : 'dishes'}</p><button type="button" onClick={clearFilters} className="text-sm font-bold text-[var(--color-primary)]">Clear</button></div></div>}
            </main>
          )}
          <Footer logoOverride={page === 'welcome' ? RESTAURANT_INFO.specialLogo : RESTAURANT_INFO.logo} />
          <CartBar onOpen={() => setCartOpen(true)} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          {selectedItem && (
            <Suspense fallback={<div className="fixed inset-0 z-[100] grid place-items-center bg-[#3a170d]/50 backdrop-blur-sm" role="status"><div className="rounded-2xl bg-white px-6 py-5 text-sm font-bold shadow-2xl">Loading dish details…</div></div>}>
              <MenuItemDetails item={selectedItem} onClose={handleCloseDetails} />
            </Suspense>
          )}
        </div>
      </CartProvider>
    </AppErrorBoundary>
  );
}

export default App;
