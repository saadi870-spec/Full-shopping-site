import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/stores/toastStore';
import { cn } from '@/lib/cn';
import { titleCase } from '@/lib/format';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wishlisted = useWishlistStore((state) => state.items.some((item) => item.id === product.id));

  const secondaryImage = product.images?.[1] ?? product.images?.[0] ?? product.thumbnail;
  const reviewCount = product.reviews?.length ?? 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function handleAddToBag() {
    addItem(product);
    toast.success('Added to your bag', product.title);
  }

  function handleWishlist() {
    const added = toggleWishlist(product);
    if (added) toast.success('Saved to wishlist', product.title);
    else toast.info('Removed from wishlist', product.title);
  }

  return (
    <article className={cn('group relative', className)}>
      <div className="relative overflow-hidden bg-surface-2">
        <Link
          to={`/products/${product.id}`}
          className="block aspect-[4/5] overflow-hidden"
          aria-label={product.title}
        >
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
          {secondaryImage !== product.thumbnail && (
            <img
              src={secondaryImage}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.discountPercentage > 0 && (
            <Badge tone="sale">-{Math.round(product.discountPercentage)}%</Badge>
          )}
          {lowStock && <Badge tone="ink">Only {product.stock} left</Badge>}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/85 text-ink backdrop-blur-sm transition-all duration-200 hover:bg-surface hover:scale-105"
        >
          <Heart className={cn('h-4 w-4 transition-colors', wishlisted && 'fill-sale text-sale')} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-0 p-2.5 opacity-100 transition-all duration-300 md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-within:translate-y-0 md:focus-within:opacity-100">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={product.stock === 0}
            className="flex w-full items-center justify-center gap-2 bg-ink/95 py-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-bg backdrop-blur-sm transition-colors hover:bg-ink disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.stock === 0 ? 'Sold out' : 'Add to bag'}
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted">
            {titleCase(product.category)}
          </p>
          <h3 className="mt-1 truncate text-[13px] font-medium text-ink">
            <Link to={`/products/${product.id}`} className="transition-opacity hover:opacity-70">
              {product.title}
            </Link>
          </h3>
          <Price product={product} size="sm" className="mt-1.5" />
        </div>
        <Rating
          value={product.rating}
          count={reviewCount}
          className="shrink-0 pt-3.5"
          showValue={false}
        />
      </div>
    </article>
  );
}
