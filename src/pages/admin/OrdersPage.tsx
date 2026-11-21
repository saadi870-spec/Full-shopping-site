import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Eye, Search } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/stores/toastStore';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_OPTIONS, OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';

const PER_PAGE = 10;

export default function AdminOrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const updateStatus = useOrdersStore((state) => state.updateStatus);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== 'all' && order.status !== status) return false;
      if (!term) return true;
      return `${order.id} ${order.customer.name} ${order.customer.email} ${order.customer.city}`
        .toLowerCase()
        .includes(term);
    });
  }, [orders, status, debouncedQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const activeOrder = selected ? orders.find((order) => order.id === selected.id) ?? null : null;

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status]);

  function handleStatus(order: Order, next: OrderStatus) {
    updateStatus(order.id, next);
    toast.success('Order updated', `${order.id} marked as ${next}.`);
  }

  const totals = useMemo(
    () => ({
      count: filtered.length,
      value: filtered
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0),
    }),
    [filtered],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Fulfilment</p>
        <h1 className="mt-2 text-2xl leading-tight text-ink sm:text-[28px]">Orders</h1>
        <p className="mt-1.5 text-[12.5px] text-muted">
          {totals.count} orders · {formatCurrency(totals.value)} in non-cancelled value
        </p>
      </header>

      <div className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order number, customer or city…"
            aria-label="Search orders"
            className="h-10 pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | OrderStatus)}
          aria-label="Filter by status"
          className="h-10 sm:w-48"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line text-[9px] uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((order) => (
                <tr key={order.id} className="text-[12px] transition-colors hover:bg-surface-2/40">
                  <td className="px-5 py-3 font-medium text-ink">{order.id}</td>
                  <td className="px-5 py-3">
                    <p className="text-ink-soft">{order.customer.name}</p>
                    <p className="text-[10px] text-muted">{order.customer.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 text-muted">{order.items.length}</td>
                  <td className="px-5 py-3 tabular-nums text-ink">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-3">
                    <Select
                      value={order.status}
                      onChange={(event) => handleStatus(order, event.target.value as OrderStatus)}
                      aria-label={`Update status for ${order.id}`}
                      className="h-8 w-[126px] text-[11px] capitalize"
                    >
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      aria-label={`View order ${order.id}`}
                      className="inline-grid h-8 w-8 place-items-center border border-line text-ink transition-colors hover:bg-surface-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-5 py-12">
            <EmptyState
              icon={<ClipboardList className="h-7 w-7" />}
              title="No orders found"
              description="Adjust the search or status filter to see more results."
              className="border-0 bg-transparent py-0"
            />
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <p className="text-[11px] text-muted">
              Page {safePage} of {pageCount}
            </p>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(activeOrder)}
        onClose={() => setSelected(null)}
        title={activeOrder ? `Order ${activeOrder.id}` : undefined}
        description={
          activeOrder
            ? `${activeOrder.customer.name} · ${formatDate(activeOrder.createdAt, true)}`
            : undefined
        }
        className="max-w-2xl"
      >
        {activeOrder && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <OrderStatusBadge status={activeOrder.status} />
              <Select
                value={activeOrder.status}
                onChange={(event) => handleStatus(activeOrder, event.target.value as OrderStatus)}
                aria-label="Update order status"
                className="h-9 w-40 text-[12px]"
              >
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <ul className="max-h-56 divide-y divide-line overflow-y-auto border-y border-line">
              {activeOrder.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-ink">{item.title}</p>
                    <p className="text-[10px] text-muted">
                      #{item.productId} · Qty {item.quantity}
                      {item.size ? ` · ${item.size}` : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12px] tabular-nums text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 text-[12px] sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">Customer</p>
                <p className="leading-relaxed text-ink-soft">
                  {activeOrder.customer.name}
                  <br />
                  {activeOrder.customer.email}
                  <br />
                  {activeOrder.customer.phone}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">Ship to</p>
                <p className="leading-relaxed text-ink-soft">
                  {activeOrder.customer.address}
                  <br />
                  {activeOrder.customer.city}, {activeOrder.customer.country}
                </p>
              </div>
            </div>

            <dl className="space-y-1.5 border-t border-line pt-4 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{formatCurrency(activeOrder.subtotal)}</dd>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd className="tabular-nums text-sale">−{formatCurrency(activeOrder.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping ({activeOrder.paymentMethod})</dt>
                <dd className="tabular-nums text-ink">
                  {activeOrder.shipping === 0 ? 'Free' : formatCurrency(activeOrder.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 text-[13px] font-medium text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(activeOrder.total)}</dd>
              </div>
            </dl>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
