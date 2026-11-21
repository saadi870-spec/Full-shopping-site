import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGrid } from '@/components/product/ProductGrid';

export function AccountWishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <div className="space-y-7">
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Saved pieces</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[32px]">Your wishlist</h1>
        <p className="mt-2 text-[13px] text-muted">
          {items.length} {items.length === 1 ? 'piece' : 'pieces'} kept for later. Tap a heart to
          remove an item.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-9 w-9" />}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here."
          action={<Button to="/products">Explore the collection</Button>}
        />
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
