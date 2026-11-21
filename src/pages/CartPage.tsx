import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Tag, Trash2, Truck, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/stores/toastStore';
import { calculateTotals, COUPONS, FREE_SHIPPING_THRESHOLD, shippingProgress } from '@/lib/cart';
import { formatCurrency, titleCase } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ConfirmDialog } from '@/components/ui/Modal';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const totals = calculateTotals(items, coupon);
  const progress = shippingProgress(totals.subtotal);

  function handleApplyCoupon(event: React.FormEvent) {
    event.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Enter a code first.');
      return;
    }
    const result = applyCoupon(couponInput);
    if (result.ok) {
      setCouponError('');
      setCouponInput('');
      toast.success('Coupon applied', result.message);
    } else {
      setCouponError(result.message);
    }
  }

  function handleRemove(key: string, title: string) {
    removeItem(key);
    toast.info('Removed from bag', title);
  }

  function handleSaveForLater(productId: number, key: string) {
    const item = items.find((entry) => entry.key === key);
    if (!item) return;
    if (!useWishlistStore.getState().has(productId)) toggleWishlist(item.product);
    removeItem(key);
    toast.success('Saved for later', `${item.product.title} moved to your wishlist.`);
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-10 lg:py-14">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} className="mb-8" />
        <h1 className="mb-8 text-3xl text-ink sm:text-[34px]">Your cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-9 w-9" />}
          title="Your bag is empty"
          description="Nothing has caught your eye yet. Explore the collection and add something considered."
          action={<Button to="/products">Browse the collection</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag' }]} className="mb-8" />

      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Almost yours</p>
          <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[34px]">
            Shopping cart
            <span className="ml-3 align-middle text-sm tracking-normal text-muted">
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </span>
          </h1>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[10px] uppercase tracking-[0.16em] text-ink"
        >
          Continue shopping
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <div className="border border-line bg-surface">
          <div className="hidden items-center justify-between border-b border-line px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] text-muted sm:flex">
            <span>Item</span>
            <span>Price</span>
          </div>

          <div>
            {items.map((item) => {
              const maxQuantity = Math.min(10, item.product.stock || 10);
              return (
                <article
                  key={item.key}
                  className="flex gap-4 border-b border-line p-5 last:border-b-0 sm:gap-6 sm:p-6"
                >
                  <Link
                    to={`/products/${item.product.id}`}
                    className="block h-28 w-24 shrink-0 overflow-hidden bg-surface-2 sm:h-32 sm:w-28"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-muted">
                          {titleCase(item.product.category)}
                        </p>
                        <h2 className="mt-1 truncate text-[14px] font-medium text-ink">
                          <Link to={`/products/${item.product.id}`} className="hover:opacity-70">
                            {item.product.title}
                          </Link>
                        </h2>
                        <p className="mt-1 text-[11px] text-muted">
                          {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`]
                            .filter(Boolean)
                            .join(' · ') || `SKU: ${item.product.sku ?? item.product.id}`}
                        </p>
                        {item.product.stock <= 5 && (
                          <p className="mt-1 text-[11px] text-sale">
                            Only {item.product.stock} left in stock — order soon.
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-medium text-ink">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-muted">
                            {formatCurrency(item.product.price)} each
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.key, value)}
                        max={maxQuantity}
                        size="sm"
                        className="h-9"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemove(item.key, item.product.title)}
                        className="flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-sale"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveForLater(item.product.id, item.key)}
                        className="flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink"
                      >
                        <Heart className="h-3.5 w-3.5" /> Save for later
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              className="text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-sale"
            >
              Clear cart
            </button>
            <p className="text-[12px] text-muted">
              Subtotal{' '}
              <span className="ml-2 text-[14px] font-medium text-ink">
                {formatCurrency(totals.subtotal)}
              </span>
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-surface p-6">
            <h2 className="text-lg text-ink">Order summary</h2>

            {totals.subtotal < FREE_SHIPPING_THRESHOLD && (
              <div className="mt-4 border border-line bg-surface-2/60 p-3">
                <p className="flex items-center gap-2 text-[11px] text-ink-soft">
                  <Truck className="h-3.5 w-3.5" />
                  {formatCurrency(progress.remaining)} away from complimentary shipping
                </p>
                <div className="mt-2 h-1 bg-line">
                  <div className="h-full bg-ink transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}

            <dl className="mt-5 space-y-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">You save</dt>
                  <dd className="tabular-nums text-sale">−{formatCurrency(totals.savings)}</dd>
                </div>
              )}
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Coupon ({coupon?.code})</dt>
                  <dd className="tabular-nums text-sale">−{formatCurrency(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular-nums text-ink">
                  {totals.shipping === 0 ? 'Complimentary' : formatCurrency(totals.shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Total</span>
              <span className="font-display text-2xl text-ink">{formatCurrency(totals.total)}</span>
            </div>

            <div className="mt-5">
              {coupon ? (
                <div className="flex items-center justify-between border border-line bg-surface-2/60 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink">
                    <Tag className="h-3.5 w-3.5" />
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      toast.info('Coupon removed');
                    }}
                    aria-label="Remove coupon"
                    className="text-muted transition-colors hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCouponOpen((open) => !open)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink"
                  >
                    <Tag className="h-3.5 w-3.5" /> Have a promo code?
                  </button>

                  {couponOpen && (
                    <form onSubmit={handleApplyCoupon} className="mt-3 animate-fade-in">
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(event) => {
                            setCouponInput(event.target.value);
                            setCouponError('');
                          }}
                          placeholder="SPHERE10"
                          aria-label="Promo code"
                          className={cn(
                            'h-10 min-w-0 flex-1 border bg-surface px-3 text-[12px] uppercase tracking-[0.1em] text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:outline-none',
                            couponError ? 'border-sale' : 'border-line focus:border-ink',
                          )}
                        />
                        <Button type="submit" size="sm" className="h-10">
                          Apply
                        </Button>
                      </div>
                      {couponError && <p className="mt-1.5 text-[11px] text-sale">{couponError}</p>}
                      <p className="mt-2 text-[10px] text-muted">
                        Try {COUPONS.map((entry) => entry.code).join(' · ')}
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>

            <Button to="/checkout" size="lg" className="mt-5 w-full">
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-3 text-center text-[10px] text-muted">
              Free shipping over $75 · Demo store, no real payment
            </p>

            <div className="mt-5 flex items-center justify-center gap-3 border-t border-line pt-4 text-[9px] uppercase tracking-[0.14em] text-muted">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Amex</span>
              <span>PayPal</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="mt-4 hidden w-full items-center justify-center gap-2 border border-line py-3 text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-sale hover:text-sale lg:flex"
          >
            <Trash2 className="h-3.5 w-3.5" /> Empty cart
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Empty your cart?"
        description="This removes every item from your bag. You can always add them back later."
        confirmLabel="Empty cart"
        destructive
        onConfirm={() => {
          clearCart();
          setClearOpen(false);
          toast.info('Cart emptied');
        }}
      />
    </div>
  );
}
