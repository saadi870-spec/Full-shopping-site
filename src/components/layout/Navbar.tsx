import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useCategoriesQuery } from '@/hooks/useProducts';
import { titleCase } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';
import { AnnouncementBar } from './AnnouncementBar';

const PRIMARY_LINKS = [
  { label: 'Shop', to: '/products' },
  { label: 'Women', to: '/products?category=womens-dresses' },
  { label: 'Men', to: '/products?category=mens-shirts' },
  { label: 'Home', to: '/products?category=home-decoration' },
  { label: 'Tech', to: '/products?category=laptops' },
];

const FEATURED_CATEGORIES = [
  'womens-dresses',
  'mens-shirts',
  'womens-bags',
  'beauty',
  'fragrances',
  'furniture',
  'sunglasses',
  'womens-jewellery',
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categories } = useCategoriesQuery();

  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) {
        setShopOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setAccountOpen(false);
        setShopOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    setSearchOpen(false);
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  const iconButton =
    'relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2';

  const dropdownCategories = (categories ?? [])
    .filter((slug) => FEATURED_CATEGORIES.includes(slug))
    .slice(0, 8);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div className="border-b border-line bg-bg/92 backdrop-blur-md">
        <div className="container-page relative flex h-[68px] items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(iconButton, 'lg:hidden')}
            aria-label="Open menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* Left: primary navigation */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {PRIMARY_LINKS.map((link) =>
              link.label === 'Shop' ? (
                <div key={link.label} ref={shopRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShopOpen((open) => !open)}
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-ink/85 transition-colors hover:text-ink"
                  >
                    Shop
                    <ChevronDown
                      className={cn('h-3 w-3 transition-transform', shopOpen && 'rotate-180')}
                    />
                  </button>

                  {shopOpen && (
                    <div className="absolute left-0 top-[calc(100%+18px)] w-[420px] animate-fade-in border border-line bg-surface p-6 shadow-xl">
                      <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted">
                        Browse the collection
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {dropdownCategories.map((slug) => (
                          <Link
                            key={slug}
                            to={`/products?category=${slug}`}
                            className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                          >
                            {titleCase(slug)}
                          </Link>
                        ))}
                        {dropdownCategories.length === 0 &&
                          FEATURED_CATEGORIES.slice(0, 6).map((slug) => (
                            <Link
                              key={slug}
                              to={`/products?category=${slug}`}
                              className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                            >
                              {titleCase(slug)}
                            </Link>
                          ))}
                      </div>
                      <Link
                        to="/products"
                        className="mt-5 inline-block border-b border-ink pb-0.5 text-[10px] uppercase tracking-[0.18em] text-ink"
                      >
                        View all products
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'text-[11px] uppercase tracking-[0.16em] transition-colors',
                      isActive ? 'text-ink' : 'text-ink/85 hover:text-ink',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
            <Link
              to="/products?sale=true"
              className="border border-sale/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-sale transition-colors hover:border-sale hover:bg-sale hover:text-white"
            >
              Sale
            </Link>
          </nav>

          {/* Center: wordmark */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
          </div>

          {/* Right: utilities */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className={iconButton}
              aria-label="Search products"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={cn(iconButton, 'hidden sm:grid')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>

            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className={iconButton}
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+14px)] w-64 animate-fade-in border border-line bg-surface p-5 shadow-xl">
                  {currentUser ? (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Signed in</p>
                      <p className="mt-1 truncate text-sm font-medium text-ink">{currentUser.name}</p>
                      <p className="truncate text-xs text-muted">{currentUser.email}</p>
                      <div className="mt-4 space-y-1 border-t border-line pt-3">
                        <Link
                          to="/account"
                          className="flex items-center gap-2.5 py-2 text-[13px] text-ink-soft transition-colors hover:text-ink"
                        >
                          <User className="h-3.5 w-3.5" /> Dashboard
                        </Link>
                        <Link
                          to="/account/orders"
                          className="flex items-center gap-2.5 py-2 text-[13px] text-ink-soft transition-colors hover:text-ink"
                        >
                          <Package className="h-3.5 w-3.5" /> Orders
                        </Link>
                        {currentUser.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 py-2 text-[13px] text-ink-soft transition-colors hover:text-ink"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5" /> Admin studio
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 py-2 text-left text-[13px] text-ink-soft transition-colors hover:text-ink"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Your account</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                        Sign in to track orders, save pieces and check out faster.
                      </p>
                      <div className="mt-4 space-y-2">
                        <Link
                          to="/login"
                          className="block bg-accent py-2.5 text-center text-[10px] uppercase tracking-[0.16em] text-accent-ink transition-opacity hover:opacity-85"
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/register"
                          className="block border border-line py-2.5 text-center text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-surface-2"
                        >
                          Create account
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/wishlist" className={iconButton} aria-label={`Wishlist, ${wishlistCount} items`}>
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold text-bg">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className={iconButton} aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold text-bg">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="animate-fade-in border-t border-line bg-bg">
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for dresses, fragrances, laptops…"
                aria-label="Search products"
                className="h-10 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
              />
              <button
                type="submit"
                className="border-b border-ink pb-0.5 text-[10px] uppercase tracking-[0.18em] text-ink"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="text-muted transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-fade-in flex-col bg-bg">
            <div className="flex items-center justify-between border-b border-line px-5 py-5">
              <Logo onClick={() => setMobileOpen(false)} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <nav className="space-y-1" aria-label="Mobile navigation">
                {PRIMARY_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block border-b border-line/70 py-3.5 font-display text-xl text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/products?sale=true"
                  className="block border-b border-line/70 py-3.5 font-display text-xl text-sale"
                >
                  Sale
                </Link>
              </nav>

              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-2">
                {(categories ?? []).slice(0, 10).map((slug) => (
                  <Link key={slug} to={`/products?category=${slug}`} className="text-[13px] text-muted">
                    {titleCase(slug)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-line px-5 py-5">
              {currentUser ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    {currentUser.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/account"
                      className="border border-line py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-ink"
                    >
                      Dashboard
                    </Link>
                    {currentUser.role === 'admin' ? (
                      <Link
                        to="/admin"
                        className="border border-line py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-ink"
                      >
                        Admin
                      </Link>
                    ) : (
                      <Link
                        to="/account/orders"
                        className="border border-line py-2.5 text-center text-[10px] uppercase tracking-[0.14em] text-ink"
                      >
                        Orders
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 text-[10px] uppercase tracking-[0.16em] text-muted"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="bg-accent py-3 text-center text-[10px] uppercase tracking-[0.14em] text-accent-ink"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="border border-line py-3 text-center text-[10px] uppercase tracking-[0.14em] text-ink"
                  >
                    Register
                  </Link>
                </div>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-[0.16em] text-muted"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
