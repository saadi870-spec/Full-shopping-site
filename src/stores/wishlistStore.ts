import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => boolean;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        set((state) => ({
          items: exists
            ? state.items.filter((item) => item.id !== product.id)
            : [product, ...state.items],
        }));
        return !exists;
      },
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      has: (id) => get().items.some((item) => item.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'shopsphere-wishlist', partialize: (state) => ({ items: state.items }) },
  ),
);
