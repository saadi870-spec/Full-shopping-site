import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { toast } from '@/stores/toastStore';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Toaster } from '@/components/ui/Toaster';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const orders = useOrdersStore((state) => state.orders);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;

  useEffect(() => {
    setDrawerOpen(false);
  }, [navigate]);

  function handleLogout() {
    logout();
    toast.info('Signed out of the studio');
    navigate('/');
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#14110f] text-[#f4efe7]">
      <div className="px-6 py-6">
        <p className="font-display text-[17px] tracking-[0.24em]">SHOPSPHERE</p>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.28em] text-white/40">Studio admin</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Admin navigation">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-[12.5px] transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            {label}
            {label === 'Orders' && pendingOrders > 0 && (
              <span className="ml-auto grid h-4 min-w-4 place-items-center rounded-full bg-white/15 px-1 text-[9px] text-white">
                {pendingOrders}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} /> View storefront
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[12.5px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[12.5px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} /> Sign out
        </button>

        <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] tracking-[0.06em]">
            {initials(currentUser?.name ?? 'SS')}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] text-white">{currentUser?.name}</p>
            <p className="truncate text-[10px] text-white/40">{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block">{sidebar}</aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/92 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center text-ink lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted">ShopSphere</p>
              <p className="text-[12px] font-medium text-ink">Admin studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted sm:inline">
              {pendingOrders} pending {pendingOrders === 1 ? 'order' : 'orders'}
            </span>
            <Link
              to="/"
              className="hidden items-center gap-1.5 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-surface-2 sm:flex"
            >
              Storefront <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/55"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 animate-fade-in">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
