import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { compareAtPrice } from '@/lib/cart';
import type { Product } from '@/types';

interface PriceProps {
  product: Pick<Product, 'price' | 'discountPercentage'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDiscount?: boolean;
}

const SIZES = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-2xl',
};

export function Price({ product, size = 'md', className, showDiscount = true }: PriceProps) {
  const original = compareAtPrice(product);
  const hasDiscount = original > product.price;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-medium tracking-tight text-ink', SIZES[size])}>
        {formatCurrency(product.price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-muted line-through">{formatCurrency(original)}</span>
          {showDiscount && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-sale">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
