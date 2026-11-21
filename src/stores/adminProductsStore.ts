import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

/**
 * Admin product management works on top of the read-only DummyJSON catalogue.
 * New / edited products and deleted ids are persisted locally as overrides so
 * the CRUD experience survives a reload without pretending to be a backend.
 */
interface AdminProductsState {
  created: Product[];
  edited: Record<string, Product>;
  deleted: number[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  resetProducts: () => void;
}

export const useAdminProductsStore = create<AdminProductsState>()(
  persist(
    (set) => ({
      created: [],
      edited: {},
      deleted: [],

      addProduct: (product) => set((state) => ({ created: [product, ...state.created] })),

      updateProduct: (product) =>
        set((state) => ({
          created: state.created.map((item) => (item.id === product.id ? product : item)),
          edited: { ...state.edited, [product.id]: product },
        })),

      deleteProduct: (id) =>
        set((state) => ({
          created: state.created.filter((item) => item.id !== id),
          deleted: state.deleted.includes(id) ? state.deleted : [...state.deleted, id],
        })),

      resetProducts: () => set({ created: [], edited: {}, deleted: [] }),
    }),
    { name: 'shopsphere-admin-products', version: 1 },
  ),
);

export function mergeAdminProducts(
  base: Product[],
  overrides: Pick<AdminProductsState, 'created' | 'edited' | 'deleted'>,
): Product[] {
  const merged = base
    .filter((product) => !overrides.deleted.includes(product.id))
    .map((product) => overrides.edited[product.id] ?? product);
  return [...overrides.created, ...merged];
}
