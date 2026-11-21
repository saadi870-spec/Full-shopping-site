import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { cn } from '@/lib/cn';
import { titleCase } from '@/lib/format';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

interface CategoryShowcaseProps {
  products: Product[];
  loading?: boolean;
}

const PREFERRED = [
  'womens-dresses',
  'mens-shirts',
  'womens-bags',
  'beauty',
  'fragrances',
  'furniture',
];

export function CategoryShowcase({ products, loading = false }: CategoryShowcaseProps) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    });
    const available = Array.from(counts.keys());
    const preferred = PREFERRED.filter((category) => counts.has(category));
    const others = available
      .filter((category) => !preferred.includes(category))
      .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
    return [...preferred, ...others].slice(0, 7);
  }, [products]);

  const [active, setActive] = useState<string | null>(null);
  const selected = active && categories.includes(active) ? active : categories[0] ?? '';

  const selectedProducts = useMemo(
    () =>
      products
        .filter((product) => product.category === selected)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4),
    [products, selected],
  );

  return (
    <section className="container-page py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Curated</p>
          <h2 className="mt-3 text-2xl leading-tight text-ink sm:text-[28px]">Shop by category</h2>

          <div className="no-scrollbar mt-6 flex gap-x-5 gap-y-2.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="shimmer h-4 w-24 shrink-0 rounded-[2px]" />
              ))}

            {!loading &&
              categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActive(category)}
                  className={cn(
                    'shrink-0 whitespace-nowrap text-left text-[13px] transition-colors',
                    category === selected
                      ? 'text-ink underline decoration-1 underline-offset-[6px]'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {titleCase(category)}
                </button>
              ))}
          </div>

          <Link
            to={selected ? `/products?category=${selected}` : '/products'}
            className="mt-7 hidden border-b border-ink/40 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink lg:inline-block"
          >
            View all
          </Link>
        </div>

        <div>
          <div key={selected} className="grid animate-fade-in grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
              : selectedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!loading && selectedProducts.length === 0 && (
            <p className="py-10 text-sm text-muted">No pieces available in this category right now.</p>
          )}

          <Link
            to={selected ? `/products?category=${selected}` : '/products'}
            className="mt-7 inline-block border-b border-ink/40 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink lg:hidden"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
