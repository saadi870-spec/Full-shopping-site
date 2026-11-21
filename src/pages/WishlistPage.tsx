import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ProductGrid } from '@/components/product/ProductGrid';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const clear = useWishlistStore((state) => state.clear);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} className="mb-8" />

      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Saved pieces</p>
          <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[34px]">Your wishlist</h1>
          <p className="mt-2 text-[13px] text-muted">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'} kept for later
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="self-start border-b border-ink/30 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink sm:self-auto"
          >
            Clear wishlist
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-9 w-9" />}
          title="No saved pieces yet"
          description="Tap the heart on any product to keep it here for later."
          action={<Button to="/products">Explore the collection</Button>}
        />
      ) : (
        <ProductGrid products={items} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Clear your wishlist?"
        description="Every saved piece will be removed. You can save them again at any time."
        confirmLabel="Clear wishlist"
        destructive
        onConfirm={() => {
          clear();
          setConfirmOpen(false);
          toast.info('Wishlist cleared');
        }}
      />
    </div>
  );
}
