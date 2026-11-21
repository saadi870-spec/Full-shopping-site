import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useProductsQuery } from '@/hooks/useProducts';
import { popularityScore } from '@/lib/productFilters';
import { getErrorMessage } from '@/services/http';
import { Hero } from '@/components/home/Hero';
import { TrustBar } from '@/components/home/TrustBar';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { PromoBanner } from '@/components/home/PromoBanner';
import { Newsletter } from '@/components/home/Newsletter';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useProductsQuery();

  const bestSellers = useMemo(
    () =>
      [...(data ?? [])]
        .sort((a, b) => popularityScore(b) - popularityScore(a))
        .slice(0, 8),
    [data],
  );

  const newArrivals = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.id - a.id).slice(0, 4),
    [data],
  );

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase products={data ?? []} loading={isLoading} />

      <section className="container-page border-t border-line pt-14 lg:pt-16">
        <SectionHeading
          eyebrow="Most loved"
          title="Best-selling pieces"
          description="Ranked by rating, written reviews and availability across the live catalogue."
          action={{ label: 'Shop all', to: '/products?sort=popularity-desc' }}
        />
        <div className="mt-8">
          {isLoading && <ProductGridSkeleton count={8} />}
          {isError && (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" />}
              title="The store is taking a short break"
              description={getErrorMessage(error)}
              action={<Button onClick={() => refetch()}>Reload products</Button>}
            />
          )}
          {!isLoading && !isError && <ProductGrid products={bestSellers} />}
        </div>
      </section>

      <PromoBanner />

      <section className="container-page py-14 lg:py-16">
        <SectionHeading
          eyebrow="Just arrived"
          title="New arrivals"
          description="The newest entries in the catalogue, straight from the studios we stock."
          action={{ label: 'View the collection', to: '/products' }}
        />
        <div className="mt-8">
          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <ProductGrid products={newArrivals} />
          )}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
