import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, Boxes, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { useProductsQuery } from '@/hooks/useProducts';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAdminProductsStore, mergeAdminProducts } from '@/stores/adminProductsStore';
import { useUiStore } from '@/stores/uiStore';
import { deriveCustomers } from '@/services/mockData';
import {
  monthlySeries,
  percentChange,
  sumRevenue,
  topSellingProducts,
} from '@/lib/analytics';
import { formatCompact, formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { OrderStatus } from '@/types';

const STATUS_ORDER: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboardPage() {
  const { data: catalogue, isLoading } = useProductsQuery();
  const orders = useOrdersStore((state) => state.orders);
  const overrides = useAdminProductsStore();
  const theme = useUiStore((state) => state.theme);

  const customers = useMemo(() => deriveCustomers(orders), [orders]);
  const series = useMemo(() => monthlySeries(orders, 12), [orders]);
  const topProducts = useMemo(() => topSellingProducts(orders, 5), [orders]);
  const productCount = useMemo(
    () =>
      mergeAdminProducts(catalogue ?? [], {
        created: overrides.created,
        edited: overrides.edited,
        deleted: overrides.deleted,
      }).length,
    [catalogue, overrides.created, overrides.edited, overrides.deleted],
  );

  const revenue = sumRevenue(orders);
  const current = series[series.length - 1];
  const previous = series[series.length - 2];
  const revenueDelta = current && previous ? percentChange(current.revenue, previous.revenue) : null;
  const ordersDelta = current && previous ? percentChange(current.orders, previous.orders) : null;

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const mood = {
    ink: theme === 'dark' ? '#f5f1e9' : '#14110f',
    muted: theme === 'dark' ? '#a39a8e' : '#6f675e',
    line: theme === 'dark' ? '#2b2722' : '#e5ded4',
  };

  const metrics = [
    {
      label: 'Total revenue',
      value: formatCurrency(revenue),
      delta: revenueDelta,
      icon: DollarSign,
      hint: 'Excludes cancelled orders',
    },
    {
      label: 'Total orders',
      value: formatNumber(orders.length),
      delta: ordersDelta,
      icon: ShoppingCart,
      hint: `${orders.filter((order) => order.status === 'pending').length} awaiting review`,
    },
    {
      label: 'Customers',
      value: formatNumber(customers.length),
      delta: null,
      icon: Users,
      hint: 'Unique buyers to date',
    },
    {
      label: 'Products',
      value: formatNumber(productCount),
      delta: null,
      icon: Boxes,
      hint: isLoading ? 'Syncing catalogue…' : 'Live catalogue size',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Dashboard</p>
          <h1 className="mt-2 text-2xl leading-tight text-ink sm:text-[28px]">Store overview</h1>
          <p className="mt-1.5 text-[12.5px] text-muted">
            Trading summary across the last twelve months. Demo data, refreshed live from the store.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-bg"
        >
          Manage inventory <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, delta, icon: Icon, hint }) => (
          <div key={label} className="border border-line bg-surface p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
              <Icon className="h-4 w-4 text-muted" strokeWidth={1.6} />
            </div>
            <p className="mt-3 font-display text-[26px] leading-none text-ink">{value}</p>
            <div className="mt-2.5 flex items-center gap-2">
              {delta !== null && (
                <span
                  className={
                    delta >= 0
                      ? 'text-[10px] font-medium uppercase tracking-[0.1em] text-success'
                      : 'text-[10px] font-medium uppercase tracking-[0.1em] text-sale'
                  }
                >
                  {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
                </span>
              )}
              <span className="text-[10px] text-muted">{delta !== null ? 'vs previous month' : hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg text-ink">Revenue</h2>
              <p className="text-[11px] text-muted">Monthly totals, cancelled orders excluded</p>
            </div>
            <span className="text-[11px] text-muted">
              {formatCurrency(series.reduce((sum, point) => sum + point.revenue, 0))} total
            </span>
          </div>

          <div className="mt-5 h-[260px]">
            {isLoading && orders.length === 0 ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={mood.ink} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={mood.ink} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={mood.line} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: mood.muted }}
                    axisLine={{ stroke: mood.line }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: mood.muted }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `$${formatCompact(value)}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 2,
                      fontSize: 12,
                      color: 'var(--ink)',
                    }}
                    labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={mood.ink}
                    strokeWidth={1.6}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="border border-line bg-surface p-5">
          <h2 className="text-lg text-ink">Orders per month</h2>
          <p className="text-[11px] text-muted">Volume by month</p>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid stroke={mood.line} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: mood.muted }}
                  axisLine={{ stroke: mood.line }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: mood.muted }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) => [Number(value), 'Orders']}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 2,
                    fontSize: 12,
                    color: 'var(--ink)',
                  }}
                  labelStyle={{ color: 'var(--muted)', fontSize: 11 }}
                  cursor={{ fill: 'var(--surface-2)' }}
                />
                <Bar dataKey="orders" fill={mood.ink} radius={[2, 2, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg text-ink">Recent orders</h2>
            <Link
              to="/admin/orders"
              className="text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line text-[9px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="text-[12px]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{order.id}</p>
                      <p className="text-[10px] text-muted">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-ink-soft">{order.customer.name}</p>
                      <p className="text-[10px] text-muted">{order.customer.city}</p>
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-line bg-surface p-5">
          <h2 className="text-lg text-ink">Top selling products</h2>
          <p className="text-[11px] text-muted">By units sold</p>

          <ul className="mt-4 space-y-3.5">
            {topProducts.map((product, index) => {
              const max = topProducts[0]?.quantity || 1;
              return (
                <li key={product.productId}>
                  <div className="flex items-baseline justify-between gap-2 text-[12px]">
                    <p className="truncate text-ink-soft">
                      <span className="mr-2 text-[10px] tabular-nums text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {product.title}
                    </p>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted">
                      {product.quantity} sold
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 bg-surface-2">
                    <div
                      className="h-full bg-ink/70"
                      style={{ width: `${(product.quantity / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {topProducts.length === 0 && (
              <li className="text-[12px] text-muted">No sales recorded yet.</li>
            )}
          </ul>

          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Order status</p>
            <ul className="mt-3 space-y-2">
              {statusCounts.map(({ status, count }) => (
                <li key={status} className="flex items-center justify-between text-[12px]">
                  <span className="capitalize text-ink-soft">{status}</span>
                  <span className="tabular-nums text-muted">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
