import { useMemo, useState } from 'react';
import { Eye, Search, Users } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { useDebounce } from '@/hooks/useDebounce';
import { deriveCustomers } from '@/services/mockData';
import { formatCurrency, formatDate, initials } from '@/lib/format';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

export default function AdminCustomersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const customers = useMemo(() => deriveCustomers(orders), [orders]);

  const [query, setQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.city} ${customer.country}`
        .toLowerCase()
        .includes(term),
    );
  }, [customers, debouncedQuery]);

  const selected = customers.find((customer) => customer.email === selectedEmail) ?? null;
  const customerOrders = useMemo(
    () => (selected ? orders.filter((order) => order.customer.email === selected.email) : []),
    [orders, selected],
  );

  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageSpend = customers.length ? totalSpent / customers.length : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Audience</p>
        <h1 className="mt-2 text-2xl leading-tight text-ink sm:text-[28px]">Customers</h1>
        <p className="mt-1.5 text-[12.5px] text-muted">
          {customers.length} customers · average spend {formatCurrency(averageSpend)}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-surface px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Total customers</p>
          <p className="mt-2 font-display text-2xl text-ink">{customers.length}</p>
        </div>
        <div className="border border-line bg-surface px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Lifetime revenue</p>
          <p className="mt-2 font-display text-2xl text-ink">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="border border-line bg-surface px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Repeat buyers</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {customers.filter((customer) => customer.orders > 1).length}
          </p>
        </div>
      </div>

      <div className="relative border border-line bg-surface p-4">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customers by name, email or location…"
          aria-label="Search customers"
          className="h-10 pl-9"
        />
      </div>

      <div className="border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line text-[9px] uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Spent</th>
                <th className="px-5 py-3 font-medium">Last order</th>
                <th className="px-5 py-3 text-right font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((customer) => (
                <tr key={customer.email} className="text-[12px] transition-colors hover:bg-surface-2/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] text-ink">
                        {initials(customer.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{customer.name}</p>
                        <p className="truncate text-[10px] text-muted">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {customer.city}, {customer.country}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink-soft">{customer.orders}</td>
                  <td className="px-5 py-3 tabular-nums text-ink">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDate(customer.lastOrderAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedEmail(customer.email)}
                      aria-label={`View ${customer.name}`}
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

        {filtered.length === 0 && (
          <div className="px-5 py-12">
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No customers found"
              description="Try a different name, email or location."
              className="border-0 bg-transparent py-0"
            />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedEmail(null)}
        title={selected?.name}
        description={selected?.email}
        className="max-w-xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 border border-line bg-surface-2/40 p-4 text-[12px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Location</p>
                <p className="mt-1 text-ink">
                  {selected.city}, {selected.country}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Phone</p>
                <p className="mt-1 text-ink">{selected.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Orders</p>
                <p className="mt-1 text-ink">{selected.orders}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Lifetime spend</p>
                <p className="mt-1 text-ink">{formatCurrency(selected.totalSpent)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">First order</p>
                <p className="mt-1 text-ink">{formatDate(selected.joinedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Last order</p>
                <p className="mt-1 text-ink">{formatDate(selected.lastOrderAt)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted">Order history</p>
              <ul className="max-h-56 divide-y divide-line overflow-y-auto border-y border-line">
                {customerOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-2.5 text-[12px]">
                    <div>
                      <p className="text-ink">{order.id}</p>
                      <p className="text-[10px] text-muted">
                        {formatDate(order.createdAt)} · {order.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="tabular-nums text-ink">{formatCurrency(order.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
