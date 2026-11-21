import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CreditCard, Lock, ShoppingBag, Wallet } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { toast } from '@/stores/toastStore';
import { calculateTotals } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';
import { checkoutSchema, type CheckoutValues } from '@/lib/schemas';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Italy',
  'France',
  'Germany',
  'Spain',
  'Netherlands',
  'Australia',
  'Japan',
  'Egypt',
  'United Arab Emirates',
];

const PAYMENT_OPTIONS = [
  { value: 'card' as const, label: 'Credit / debit card', description: 'Visa, Mastercard, Amex', icon: CreditCard },
  { value: 'paypal' as const, label: 'PayPal', description: 'Pay with your PayPal balance', icon: Wallet },
  { value: 'cod' as const, label: 'Cash on delivery', description: 'Pay when your parcel arrives', icon: Banknote },
];

function SectionHeading({ step, title, description }: { step: string; title: string; description?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center border border-line text-[10px] tabular-nums text-muted">
        {step}
      </span>
      <div>
        <h2 className="text-lg leading-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-[12px] text-muted">{description}</p>}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const clearCart = useCartStore((state) => state.clearCart);
  const currentUser = useAuthStore((state) => state.currentUser);
  const placeOrder = useOrdersStore((state) => state.placeOrder);

  const totals = useMemo(() => calculateTotals(items, coupon), [items, coupon]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: currentUser?.name.split(' ')[0] ?? '',
      lastName: currentUser?.name.split(' ').slice(1).join(' ') ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      address: currentUser?.address?.line1 ?? '',
      apartment: currentUser?.address?.line2 ?? '',
      city: currentUser?.address?.city ?? '',
      state: currentUser?.address?.state ?? '',
      postalCode: currentUser?.address?.postalCode ?? '',
      country: currentUser?.address?.country ?? 'United States',
      paymentMethod: 'card',
      cardName: currentUser?.name ?? '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<ShoppingBag className="h-9 w-9" />}
          title="Nothing to check out"
          description="Add a piece to your bag before heading to checkout."
          action={<Button to="/products">Browse the collection</Button>}
        />
      </div>
    );
  }

  async function onSubmit(values: CheckoutValues) {
    // Demo checkout: simulated latency, no payment is processed.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const cardDigits = (values.cardNumber ?? '').replace(/\s/g, '');
    const paymentLabel =
      values.paymentMethod === 'card'
        ? `Card •••• ${cardDigits.slice(-4)}`
        : values.paymentMethod === 'paypal'
          ? 'PayPal'
          : 'Cash on delivery';

    const order = placeOrder({
      items: items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
        size: item.size,
        color: item.color,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      paymentMethod: paymentLabel,
      customer: {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        address: [values.address, values.apartment].filter(Boolean).join(', '),
        city: values.city,
        country: values.country,
      },
      userId: currentUser?.id,
    });

    clearCart();
    toast.success('Order placed', `${order.id} is being prepared.`);
    navigate(`/order-confirmation/${order.id}`, { replace: true });
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs
        items={[{ label: 'Home', to: '/' }, { label: 'Bag', to: '/cart' }, { label: 'Checkout' }]}
        className="mb-8"
      />

      <header className="mb-8 border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Checkout</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[34px]">
          Complete your order
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="space-y-10">
          <section>
            <SectionHeading step="01" title="Contact information" description="Where we can reach you about this order." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" autoComplete="given-name" invalid={Boolean(errors.firstName)} {...register('firstName')} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <Input id="lastName" autoComplete="family-name" invalid={Boolean(errors.lastName)} {...register('lastName')} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} {...register('email')} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" autoComplete="tel" invalid={Boolean(errors.phone)} {...register('phone')} />
              </Field>
            </div>
          </section>

          <section>
            <SectionHeading step="02" title="Shipping address" description="Where should we send your order?" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Street address" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
                <Input id="address" autoComplete="address-line1" invalid={Boolean(errors.address)} {...register('address')} />
              </Field>
              <Field label="Apartment, suite (optional)" htmlFor="apartment" error={errors.apartment?.message} className="sm:col-span-2">
                <Input id="apartment" autoComplete="address-line2" {...register('apartment')} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city?.message}>
                <Input id="city" autoComplete="address-level2" invalid={Boolean(errors.city)} {...register('city')} />
              </Field>
              <Field label="State / region" htmlFor="state" error={errors.state?.message}>
                <Input id="state" autoComplete="address-level1" invalid={Boolean(errors.state)} {...register('state')} />
              </Field>
              <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode?.message}>
                <Input id="postalCode" autoComplete="postal-code" invalid={Boolean(errors.postalCode)} {...register('postalCode')} />
              </Field>
              <Field label="Country" htmlFor="country" error={errors.country?.message}>
                <Select id="country" autoComplete="country-name" invalid={Boolean(errors.country)} {...register('country')}>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section>
            <SectionHeading step="03" title="Payment method" description="Demo checkout — no card is charged and nothing is stored." />
            <div className="space-y-2.5">
              {PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = paymentMethod === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3.5 border p-4 transition-colors',
                      selected ? 'border-ink bg-surface' : 'border-line bg-surface hover:border-ink/40',
                    )}
                  >
                    <input type="radio" value={option.value} className="sr-only" {...register('paymentMethod')} />
                    <span
                      className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                        selected ? 'border-ink' : 'border-line',
                      )}
                      aria-hidden
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                    <Icon className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink">{option.label}</span>
                      <span className="block text-[11px] text-muted">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-5 animate-fade-in space-y-4 border border-line bg-surface p-5">
                <Field label="Name on card" htmlFor="cardName" error={errors.cardName?.message}>
                  <Input id="cardName" autoComplete="cc-name" invalid={Boolean(errors.cardName)} {...register('cardName')} />
                </Field>
                <Field label="Card number" htmlFor="cardNumber" error={errors.cardNumber?.message} hint="Demo only">
                  <Input
                    id="cardNumber"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    invalid={Boolean(errors.cardNumber)}
                    {...register('cardNumber')}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" htmlFor="expiry" error={errors.expiry?.message}>
                    <Input id="expiry" placeholder="MM/YY" autoComplete="cc-exp" invalid={Boolean(errors.expiry)} {...register('expiry')} />
                  </Field>
                  <Field label="CVV" htmlFor="cvv" error={errors.cvv?.message}>
                    <Input id="cvv" inputMode="numeric" placeholder="123" autoComplete="cc-csc" invalid={Boolean(errors.cvv)} {...register('cvv')} />
                  </Field>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-surface p-6">
            <h2 className="text-lg text-ink">Order summary</h2>

            <ul className="mt-5 space-y-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden bg-surface-2">
                    <img src={item.product.thumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{item.product.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Qty {item.quantity}
                      {item.size ? ` · ${item.size}` : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-[12.5px] tabular-nums text-ink">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
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

            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Total</span>
              <span className="font-display text-2xl text-ink">{formatCurrency(totals.total)}</span>
            </div>

            <Button type="submit" size="lg" className="mt-5 w-full" loading={isSubmitting}>
              <Lock className="h-3.5 w-3.5" />
              {isSubmitting ? 'Placing order…' : 'Place order'}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted">
              <Lock className="h-3 w-3" /> Demo checkout · no card is charged
            </p>

            <Link
              to="/cart"
              className="mt-4 block text-center text-[10px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Return to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
