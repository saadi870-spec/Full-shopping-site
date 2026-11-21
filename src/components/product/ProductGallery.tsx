import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : [product.thumbnail];
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  const step = (delta: number) => {
    setActive((current) => (current + delta + images.length) % images.length);
  };

  return (
    <div>
      <div className="group relative aspect-[4/5] overflow-hidden bg-surface-2">
        <img
          key={images[active]}
          src={images[active]}
          alt={`${product.title} — view ${active + 1}`}
          className="h-full w-full animate-fade-in object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5">
          {product.discountPercentage > 0 && (
            <Badge tone="sale">-{Math.round(product.discountPercentage)}%</Badge>
          )}
          {product.stock === 0 && <Badge tone="ink">Sold out</Badge>}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/80 text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/80 text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <p className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.16em] text-ink/60">
          {active + 1} / {images.length}
        </p>
      </div>

      {images.length > 1 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2.5">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'aspect-[4/5] overflow-hidden border bg-surface-2 transition-all',
                index === active ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
