import { Link, useParams } from 'react-router-dom';
import { Check, Mail, MapPin, Package, Truck } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrdersStore((state) => state.orders.find((entry) => entry.id === id));
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<Package className="h-9 w-9" />}
          title="Order not found"
          description="We couldn't find that order number. It may have been placed in a different browser session."
          action={<Button to="/products">Continue shopping</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
            <Check className="h-6 w-6" strokeWidth={2} />
          </span>
          <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-muted">
            Order {order.id}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight text-ink">
            Thank you, {order.customer.name.split(' ')[0]}.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
            Your order is confirmed. This is a demo store, so no confirmation email was sent to{' '}
            <span className="text-ink">{order.customer.email}</span>.
          </p>
          <div className="mt-5 flex justify-center">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="mt-10 border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
            <div className="flex items-center gap-2 text-[12px] text-ink">
              <Truck className="h-4 w-4 text-muted" />
              Demo order — nothing will ship
            </div>
            <span className="text-[11px] text-muted">Placed {formatDate(order.createdAt, true)}</span>
          </div>

          <ul className="divide-y divide-line px-6">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`} className="flex gap-4 py-5">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-surface-2">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.1em] text-muted">
                      {item.title.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    Qty {item.quantity}
                    {item.size ? ` · Size ${item.size}` : ''}
                    {item.color ? ` · ${item.color}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] tabular-nums text-ink">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line px-6 py-5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums text-ink">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Discount</span>
                <span className="tabular-nums text-sale">−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="tabular-nums text-ink">
                {order.shipping === 0 ? 'Complimentary' : formatCurrency(order.shipping)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Order total</span>
              <span className="font-display text-xl text-ink">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="grid gap-6 border-t border-line px-6 py-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
                <MapPin className="h-3.5 w-3.5" /> Shipping to
              </p>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {order.customer.name}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.country}
              </p>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
                <Mail className="h-3.5 w-3.5" /> Payment method
              </p>
              <p className="text-[13px] leading-relaxed text-ink-soft">{order.paymentMethod}</p>
              <p className="mt-1 text-[11px] text-muted">Chosen at checkout — nothing was charged.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to={currentUser ? '/account/orders' : '/products'} size="lg">
            {currentUser ? 'View order history' : 'Continue shopping'}
          </Button>
          <Button to="/products" size="lg" variant="outline">
            Keep browsing
          </Button>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted">
          This is a portfolio demo — no payment was processed and no parcel will be shipped.{' '}
          <Link to="/" className="underline underline-offset-2">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
