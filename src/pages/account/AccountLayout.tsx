import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore, ordersForEmail } from '@/stores/ordersStore';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';
import { toast } from '@/stores/toastStore';

const NAV = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/settings', label: 'Settings', icon: Settings },
];

export function AccountLayout() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const orders = useOrdersStore((state) => state.orders);

  if (!currentUser) return null;

  const myOrders = ordersForEmail(orders, currentUser.email);

  function handleLogout() {
    logout();
    toast.info('Signed out', 'See you again soon.');
    navigate('/');
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-medium tracking-[0.08em] text-ink">
              {initials(currentUser.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">{currentUser.name}</p>
              <p className="truncate text-[11px] text-muted">{currentUser.email}</p>
            </div>
          </div>

          <nav
            className="no-scrollbar mt-4 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible"
            aria-label="Account navigation"
          >
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-[12px] transition-colors',
                    isActive
                      ? 'bg-surface-2 font-medium text-ink'
                      : 'text-muted hover:bg-surface-2/60 hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                {label}
                {label === 'Orders' && myOrders.length > 0 && (
                  <span className="ml-auto hidden text-[10px] text-muted lg:inline">
                    {myOrders.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 hidden space-y-1 border-t border-line pt-4 lg:block">
            {currentUser.role === 'admin' && (
              <NavLink
                to="/admin"
                className="flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-muted transition-colors hover:bg-surface-2/60 hover:text-ink"
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={1.6} /> Admin studio
              </NavLink>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] text-muted transition-colors hover:bg-surface-2/60 hover:text-sale"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.6} /> Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
