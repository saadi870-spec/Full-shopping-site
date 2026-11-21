import type { CartItem, CartTotals, Coupon, Product } from '@/types';
import { round } from './format';

export const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING_FEE = 6.95;

export const COUPONS: Coupon[] = [
  { code: 'SPHERE10', type: 'percent', value: 10, label: '10% off your order' },
  {
    code: 'WELCOME15',
    type: 'fixed',
    value: 15,
    label: '$15 off orders over $100',
    minSubtotal: 100,
  },
  { code: 'FREESHIP', type: 'shipping', value: 0, label: 'Complimentary express shipping' },
];

export const PRODUCT_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Ivory', value: '#efe9df' },
  { name: 'Clay', value: '#a9614a' },
  { name: 'Olive', value: '#6b6b4d' },
  { name: 'Navy', value: '#243a5e' },
];

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export function compareAtPrice(product: Pick<Product, 'price' | 'discountPercentage'>): number {
  const { price, discountPercentage } = product;
  if (!discountPercentage || discountPercentage <= 0) return price;
  return round(price / (1 - discountPercentage / 100));
}

export function savingsPerUnit(product: Pick<Product, 'price' | 'discountPercentage'>): number {
  return round(compareAtPrice(product) - product.price);
}

export function buildCartKey(productId: number, options?: { size?: string; color?: string }): string {
  return [productId, options?.size ?? '', options?.color ?? ''].join('::');
}

export function calculateTotals(items: CartItem[], coupon: Coupon | null): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = round(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );
  const savings = round(
    items.reduce((sum, item) => sum + savingsPerUnit(item.product) * item.quantity, 0),
  );

  let shipping = 0;
  if (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) {
    shipping = STANDARD_SHIPPING_FEE;
  }

  let discount = 0;
  if (coupon && subtotal > 0) {
    const meetsMinimum = !coupon.minSubtotal || subtotal >= coupon.minSubtotal;
    if (meetsMinimum) {
      if (coupon.type === 'percent') discount = round((subtotal * coupon.value) / 100);
      if (coupon.type === 'fixed') discount = round(Math.min(coupon.value, subtotal));
      if (coupon.type === 'shipping') shipping = 0;
    }
  }

  const total = round(Math.max(subtotal - discount + shipping, 0));

  return { itemCount, subtotal, savings, shipping, discount, total };
}

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((coupon) => coupon.code === code.trim().toUpperCase());
}

export function shippingProgress(subtotal: number): { remaining: number; percent: number } {
  const percent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  return { remaining: round(Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)), percent };
}
