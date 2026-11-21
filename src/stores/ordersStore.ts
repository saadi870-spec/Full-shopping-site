import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '@/types';
import { generateMockOrders } from '@/services/mockData';

interface OrdersState {
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateStatus: (id: string, status: OrderStatus) => void;
  resetDemoOrders: () => void;
}

function createOrderId(existing: Order[]): string {
  const highest = existing.reduce((max, order) => {
    const parsed = Number.parseInt(order.id.replace(/\D/g, ''), 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 24_150);
  return `SS-${highest + 1}`;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: generateMockOrders(),

      placeOrder: (input) => {
        const order: Order = {
          ...input,
          id: createOrderId(get().orders),
          createdAt: new Date().toISOString(),
          status: 'processing',
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
        })),

      resetDemoOrders: () => set({ orders: generateMockOrders() }),
    }),
    { name: 'shopsphere-orders', version: 1 },
  ),
);

export function ordersForEmail(orders: Order[], email?: string): Order[] {
  if (!email) return [];
  return orders.filter((order) => order.customer.email.toLowerCase() === email.toLowerCase());
}
