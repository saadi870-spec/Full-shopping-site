import { useState } from 'react';
import { Package } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore, ordersForEmail } from '@/stores/ordersStore';
import { toast } from '@/stores/toastStore';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export function OrdersPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const orders = useOrdersStore((state) => state.orders);
  const updateStatus = useOrdersStore((state) => state.updateStatus);
  const [selected, setSelected] = useState<Order | null>(null);

  if (!currentUser) return null;

  const myOrders = ordersForEmail(orders, currentUser.email);
  const activeOrder = selected
    ? (orders.find((order) => order.id === selected.id) ?? null)
    : null;

  function handleCancel(order: Order) {
    updateStatus(order.id, 'cancelled');
    toast.info('Order cancelled', `${order.id} has been cancelled.`);
    setSelected(null);
  }

  return (
    <div className="space-y-7">
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">History</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[32px]">Your orders</h1>
        <p className="mt-2 text-[13px] text-muted">
          Review receipts and manage recent purchases.
        </p>
      </header>

      {myOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-9 w-9" />}
          title="No orders yet"
          description="When you place an order it will appear here with its full receipt."
          action={<Button to="/products">Start shopping</Button>}
        />
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => (
            <article key={order.id} className="border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <p className="text-[12px] font-medium text-ink">{order.id}</p>
                  <p className="text-[11px] text-muted">{formatDate(order.createdAt)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-[13px] font-medium tabular-nums text-ink">
                  {formatCurrency(order.total)}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="h-12 w-10 overflow-hidden border border-line bg-surface-2"
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[9px] text-muted">
                            {item.title.slice(0, 2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[12px] text-ink">{order.items[0]?.title}</p>
                    <p className="text-[11px] text-muted">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => setSelected(order)}>
                  View details
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(activeOrder)}
        onClose={() => setSelected(null)}
        title={activeOrder ? `Order ${activeOrder.id}` : undefined}
        description={
          activeOrder
            ? `Placed ${formatDate(activeOrder.createdAt, true)} · ${activeOrder.paymentMethod}`
            : undefined
        }
        className="max-w-2xl"
      >
        {activeOrder && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={activeOrder.status} />
              <span className="text-[13px] font-medium text-ink">
                {formatCurrency(activeOrder.total)}
              </span>
            </div>

            <ul className="max-h-64 divide-y divide-line overflow-y-auto border-y border-line">
              {activeOrder.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center gap-3 py-3">
                  <div className="h-14 w-11 shrink-0 overflow-hidden bg-surface-2">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-ink">{item.title}</p>
                    <p className="text-[11px] text-muted">
                      Qty {item.quantity}
                      {item.size ? ` · ${item.size}` : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <p className="text-[12px] tabular-nums text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 text-[12px] sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                  Shipping address
                </p>
                <p className="leading-relaxed text-ink-soft">
                  {activeOrder.customer.name}
                  <br />
                  {activeOrder.customer.address}
                  <br />
                  {activeOrder.customer.city}, {activeOrder.customer.country}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">Summary</p>
                <dl className="space-y-1 text-ink-soft">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="tabular-nums">{formatCurrency(activeOrder.subtotal)}</dd>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Discount</dt>
                      <dd className="tabular-nums">−{formatCurrency(activeOrder.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted">Shipping</dt>
                    <dd className="tabular-nums">
                      {activeOrder.shipping === 0 ? 'Free' : formatCurrency(activeOrder.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-1 font-medium text-ink">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatCurrency(activeOrder.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
              {(activeOrder.status === 'pending' || activeOrder.status === 'processing') && (
                <Button variant="danger" size="sm" onClick={() => handleCancel(activeOrder)}>
                  Cancel order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
