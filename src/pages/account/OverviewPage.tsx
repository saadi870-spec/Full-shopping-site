import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MapPin, Package, Receipt, Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore, ordersForEmail } from '@/stores/ordersStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { formatCurrency, formatDate } from '@/lib/format';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function OverviewPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const orders = useOrdersStore((state) => state.orders);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  if (!currentUser) return null;

  const myOrders = ordersForEmail(orders, currentUser.email);
  const inTransit = myOrders.filter(
    (order) => order.status === 'shipped' || order.status === 'processing',
  ).length;
  const spent = myOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: 'Orders placed', value: myOrders.length, icon: Receipt },
    { label: 'In progress', value: inTransit, icon: Truck },
    { label: 'Saved pieces', value: wishlistCount, icon: Heart },
    { label: 'Lifetime spend', value: formatCurrency(spent), icon: Package },
  ];

  return (
    <div className="space-y-9">
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">My account</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[32px]">
          {greeting()}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Here's what's happening with your orders, saved pieces and details.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
              <Icon className="h-4 w-4 text-muted" strokeWidth={1.6} />
            </div>
            <p className="mt-3 font-display text-2xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl text-ink">Recent orders</h2>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            All orders <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {myOrders.length === 0 ? (
          <div className="border border-dashed border-line px-5 py-10 text-center">
            <p className="text-[13px] text-muted">
              You haven't placed an order yet. Your first one is waiting.
            </p>
            <Link
              to="/products"
              className="mt-3 inline-block border-b border-ink pb-0.5 text-[10px] uppercase tracking-[0.14em] text-ink"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line border border-line bg-surface">
            {myOrders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                to="/account/orders"
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-surface-2/50"
              >
                <div className="min-w-[120px]">
                  <p className="text-[12px] font-medium text-ink">{order.id}</p>
                  <p className="text-[11px] text-muted">{formatDate(order.createdAt)}</p>
                </div>
                <p className="flex-1 text-[12px] text-muted">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                  {order.items[0]?.title}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                </p>
                <OrderStatusBadge status={order.status} />
                <p className="w-20 text-right text-[12px] tabular-nums text-ink">
                  {formatCurrency(order.total)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-line bg-surface p-5">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
            <MapPin className="h-3.5 w-3.5" /> Default address
          </p>
          {currentUser.address ? (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {currentUser.name}
              <br />
              {currentUser.address.line1}
              {currentUser.address.line2 ? `, ${currentUser.address.line2}` : ''}
              <br />
              {currentUser.address.city}, {currentUser.address.state} {currentUser.address.postalCode}
              <br />
              {currentUser.address.country}
            </p>
          ) : (
            <p className="mt-3 text-[13px] text-muted">No address saved yet.</p>
          )}
          <Link
            to="/account/profile"
            className="mt-4 inline-block border-b border-ink/30 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-ink"
          >
            Manage profile
          </Link>
        </section>

        <section className="border border-line bg-surface p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Account details</p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="truncate text-ink-soft">{currentUser.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Phone</dt>
              <dd className="text-ink-soft">{currentUser.phone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Member since</dt>
              <dd className="text-ink-soft">{formatDate(currentUser.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Account type</dt>
              <dd className="capitalize text-ink-soft">{currentUser.role}</dd>
            </div>
          </dl>
          <Link
            to="/account/settings"
            className="mt-4 inline-block border-b border-ink/30 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-ink"
          >
            Account settings
          </Link>
        </section>
      </div>

      {currentUser.role === 'admin' && (
        <section className="flex flex-wrap items-center justify-between gap-4 border border-ink/15 bg-surface-2 p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Administrator</p>
            <p className="mt-1 text-[13px] text-ink">
              You have access to the store studio — products, orders and customers.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-bg"
          >
            Open admin studio <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}
    </div>
  );
}
