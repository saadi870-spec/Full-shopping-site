import type { Order } from '@/types';
import { round } from './format';

export interface MonthlyPoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

/** Revenue + order count per calendar month for the last `months` months. */
export function monthlySeries(orders: Order[], months = 12): MonthlyPoint[] {
  const now = new Date();
  const points: MonthlyPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    points.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue: 0,
      orders: 0,
    });
  }

  const indexByKey = new Map(points.map((point, index) => [point.key, index]));

  orders
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      const date = new Date(order.createdAt);
      const index = indexByKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (index === undefined) return;
      points[index].revenue += order.total;
      points[index].orders += 1;
    });

  return points.map((point) => ({ ...point, revenue: round(point.revenue) }));
}

export interface TopProduct {
  title: string;
  productId: number;
  quantity: number;
  revenue: number;
}

export function topSellingProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<number, TopProduct>();

  orders
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      order.items.forEach((item) => {
        const current = map.get(item.productId);
        if (current) {
          current.quantity += item.quantity;
          current.revenue = round(current.revenue + item.price * item.quantity);
        } else {
          map.set(item.productId, {
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            revenue: round(item.price * item.quantity),
          });
        }
      });
    });

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return round(((current - previous) / previous) * 100);
}

export function sumRevenue(orders: Order[]): number {
  return round(
    orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0),
  );
}
