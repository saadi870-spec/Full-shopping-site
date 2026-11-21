import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Coupon, Product } from '@/types';
import { buildCartKey, calculateTotals, findCoupon } from '@/lib/cart';

interface AddItemOptions {
  quantity?: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (product: Product, options?: AddItemOptions) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
}

const MAX_QUANTITY = 10;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, options) => {
        const quantity = Math.max(1, options?.quantity ?? 1);
        const key = buildCartKey(product.id, { size: options?.size, color: options?.color });

        set((state) => {
          const existing = state.items.find((item) => item.key === key);
          if (existing) {
            const limit = Math.min(MAX_QUANTITY, product.stock || MAX_QUANTITY);
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: Math.min(item.quantity + quantity, limit) }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                product,
                quantity: Math.min(quantity, MAX_QUANTITY),
                size: options?.size,
                color: options?.color,
              },
            ],
          };
        });
      },

      removeItem: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.key !== key) return item;
            const limit = Math.min(MAX_QUANTITY, item.product.stock || MAX_QUANTITY);
            return { ...item, quantity: Math.max(1, Math.min(quantity, limit)) };
          }),
        })),

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (code) => {
        const coupon = findCoupon(code);
        if (!coupon) {
          return { ok: false, message: 'That code is not recognised.' };
        }
        const { subtotal } = calculateTotals(get().items, coupon);
        if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
          return {
            ok: false,
            message: `Spend at least $${coupon.minSubtotal} to use ${coupon.code}.`,
          };
        }
        set({ coupon });
        return { ok: true, message: `${coupon.code} applied — ${coupon.label}.` };
      },

      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'shopsphere-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    },
  ),
);
