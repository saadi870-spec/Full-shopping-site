import type { ReactNode } from 'react';
import type { Product } from '@/types';
import { cn } from '@/lib/cn';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  className?: string;
  columns?: 3 | 4;
  emptyState?: ReactNode;
}

export function ProductGrid({ products, className, columns = 4, emptyState }: ProductGridProps) {
  if (products.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3',
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
