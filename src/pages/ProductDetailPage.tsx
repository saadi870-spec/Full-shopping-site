import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useProductQuery, useRelatedProducts, useProductsQuery } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/stores/toastStore';
import { APPAREL_SIZES, PRODUCT_COLORS, compareAtPrice, savingsPerUnit } from '@/lib/cart';
import { titleCase, formatCurrency } from '@/lib/format';
import { getErrorMessage } from '@/services/http';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGrid } from '@/components/product/ProductGrid';

const SIZED_CATEGORIES = new Set([
  'womens-dresses',
  'mens-shirts',
  'womens-shoes',
  'mens-shoes',
  'tops',
  'mens-suits',
]);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { data: product, isLoading, isError, error, refetch } = useProductQuery(productId);
  const { data: catalogue } = useProductsQuery();
  const related = useRelatedProducts(product, 4);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlisted = useWishlistStore((state) =>
    product ? state.items.some((item) => item.id === product.id) : false,
  );

  const requiresSize = product ? SIZED_CATEGORIES.has(product.category) : false;
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(PRODUCT_COLORS[0].name);
  const [quantity, setQuantity] = useState(1);

  const fallbackRelated = useMemo(() => {
    if (related.length > 0 || !catalogue) return related;
    return catalogue.filter((item) => item.id !== productId).slice(0, 4);
  }, [related, catalogue, productId]);

  function handleAdd(buyNow = false) {
    if (!product) return;
    addItem(product, { quantity, size: requiresSize ? size : undefined, color });
    toast.success(buyNow ? 'Heading to checkout' : 'Added to your bag', product.title);
    if (buyNow) navigate('/checkout');
  }

  function handleWishlist() {
    if (!product) return;
    const added = toggleWishlist(product);
    toast[added ? 'success' : 'info'](
      added ? 'Saved to wishlist' : 'Removed from wishlist',
      product.title,
    );
  }

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="This piece is unavailable"
          description={
            isError ? getErrorMessage(error) : "We couldn't find the product you were looking for."
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => refetch()} variant="outline">
                Try again
              </Button>
              <Button to="/products">Back to the collection</Button>
            </div>
          }
        />
      </div>
    );
  }

  const originalPrice = compareAtPrice(product);
  const savings = savingsPerUnit(product);
  const reviewCount = product.reviews?.length ?? 0;
  const maxQuantity = Math.min(10, product.stock || 10);

  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/products' },
          { label: titleCase(product.category), to: `/products?category=${product.category}` },
          { label: product.title },
        ]}
        className="mb-7"
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                {titleCase(product.category)} / {product.brand ?? 'ShopSphere'}
              </p>
              <h1 className="mt-2.5 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.1] text-ink">
                {product.title}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={wishlisted}
              className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink"
            >
              <Heart className={cn('h-[18px] w-[18px]', wishlisted && 'fill-sale text-sale')} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating value={product.rating} count={reviewCount} />
            <span className="h-3 w-px bg-line" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {product.brand ?? 'ShopSphere'}
            </span>
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-[11px] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> In stock
              </span>
            ) : (
              <span className="text-[11px] text-sale">Out of stock</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl leading-none text-ink">
              {formatCurrency(product.price)}
            </span>
            {savings > 0 && (
              <>
                <span className="pb-0.5 text-sm text-muted line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <Badge tone="sale">Save {formatCurrency(savings)}</Badge>
              </>
            )}
          </div>

          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-7 border-t border-line pt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Colour</p>
              <span className="text-[12px] text-ink">{color}</span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              {PRODUCT_COLORS.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setColor(option.name)}
                  aria-label={option.name}
                  aria-pressed={color === option.name}
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-full border transition-all',
                    color === option.name ? 'border-ink' : 'border-transparent hover:border-line',
                  )}
                >
                  <span
                    className="block h-6 w-6 rounded-full border border-black/10"
                    style={{ backgroundColor: option.value }}
                  />
                </button>
              ))}
            </div>
          </div>

          {requiresSize && (
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Size</p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {APPAREL_SIZES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={cn(
                      'h-11 border text-[11px] uppercase tracking-[0.1em] transition-colors',
                      size === option
                        ? 'border-ink bg-ink text-bg'
                        : 'border-line text-ink hover:border-ink',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="flex h-12 items-center border border-line">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid h-full w-10 place-items-center text-ink transition-colors hover:bg-surface-2 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="grid h-full w-10 place-items-center border-x border-line text-[13px] tabular-nums text-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Increase quantity"
                className="grid h-full w-10 place-items-center text-ink transition-colors hover:bg-surface-2 disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              size="lg"
              className="min-w-[190px] flex-1"
              onClick={() => handleAdd(false)}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0 ? 'Sold out' : 'Add to bag'}
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="mt-2.5 w-full"
            onClick={() => handleAdd(true)}
            disabled={product.stock === 0}
          >
            Buy it now
          </Button>

          <div className="mt-6 flex items-start gap-2 text-[12px] text-muted">
            <Package className="mt-0.5 h-4 w-4 shrink-0" />
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="text-sale">
                Only {product.stock} left in stock — order soon.
              </span>
            ) : (
              <span>{product.stock} units available · {product.shippingInformation ?? 'Ships in 2–4 business days'}</span>
            )}
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 border-y border-line py-5 sm:grid-cols-2">
            {[
              { icon: Truck, label: 'Fast and safe delivery' },
              { icon: RotateCcw, label: product.returnPolicy ?? '30-day returns' },
              { icon: ShieldCheck, label: 'Demo checkout — no charge' },
              { icon: Check, label: product.warrantyInformation ?? 'Quality guaranteed' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-[12px] text-ink-soft">
                <Icon className="h-4 w-4 text-muted" strokeWidth={1.6} />
                {label}
              </li>
            ))}
          </ul>

          <Accordion
            className="mt-6 border-t-0"
            items={[
              {
                id: 'delivery',
                title: 'Delivery & returns',
                content: (
                  <div className="space-y-2">
                    <p>{product.shippingInformation ?? 'Ships within 2–4 business days.'}</p>
                    <p>{product.returnPolicy ?? 'Returns accepted within 30 days of delivery.'}</p>
                    <p>Complimentary shipping on orders over $75.</p>
                  </div>
                ),
              },
              {
                id: 'details',
                title: 'Product details',
                content: (
                  <div className="space-y-1.5">
                    <p>SKU: {product.sku ?? `SS-${product.id}`}</p>
                    <p>Category: {titleCase(product.category)}</p>
                    <p>Weight: {product.weight ? `${product.weight} kg` : '—'}</p>
                    <p>Minimum order: {product.minimumOrderQuantity ?? 1}</p>
                    {product.tags?.length ? <p>Tags: {product.tags.join(', ')}</p> : null}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-16 lg:mt-24">
        <ProductReviews product={product} />
      </div>

      {fallbackRelated.length > 0 && (
        <section className="mt-16 lg:mt-20">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted">You may also like</p>
              <h2 className="mt-2 text-2xl text-ink">More in {titleCase(product.category)}</h2>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="hidden border-b border-ink/30 pb-1 text-[10px] uppercase tracking-[0.16em] text-ink sm:inline-block"
            >
              View all
            </Link>
          </div>
          <ProductGrid products={fallbackRelated} />
        </section>
      )}
    </div>
  );
}
