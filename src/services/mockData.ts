import type { Customer, Order, OrderStatus } from '@/types';

/*
 * Mock order + customer data for the admin experience.
 * The DummyJSON product API has no orders/customers endpoints, so the
 * dashboard operates on a deterministic local dataset (clearly labelled
 * as demo data in the UI).
 */

const FIRST_NAMES = [
  'Sofia', 'Liam', 'Maya', 'Noah', 'Amara', 'Elias', 'Ines', 'Diego',
  'Hana', 'Oscar', 'Layla', 'Theo', 'Nadia', 'Marcus', 'Yuki', 'Freya',
  'Idris', 'Chiara', 'Ravi', 'Elena',
];

const LAST_NAMES = [
  'Marchetti', 'Bennett', 'Okonkwo', 'Haddad', 'Lindqvist', 'Moreau',
  'Castillo', 'Nakamura', 'Fischer', 'Rossi', 'Verma', 'Doyle',
  'Kowalski', 'Silva', 'Ahmadi', 'Petrov', 'Kim', 'Dubois',
];

const LOCATIONS: Array<[string, string]> = [
  ['Milan', 'Italy'],
  ['London', 'United Kingdom'],
  ['New York', 'United States'],
  ['Lisbon', 'Portugal'],
  ['Toronto', 'Canada'],
  ['Berlin', 'Germany'],
  ['Sydney', 'Australia'],
  ['Amsterdam', 'Netherlands'],
  ['Barcelona', 'Spain'],
  ['Tokyo', 'Japan'],
];

const MOCK_PRODUCTS = [
  { id: 1, title: 'Essence Mascara Lash Princess', price: 9.99 },
  { id: 6, title: 'Calvin Klein CK One', price: 49.99 },
  { id: 10, title: 'Gucci Bloom Eau de Parfum', price: 97.99 },
  { id: 60, title: 'Raw Leather Bag', price: 32.55 },
  { id: 85, title: 'Apple MacBook Pro 14 Inch Space Grey', price: 1999.99 },
  { id: 91, title: 'Black Sun Glasses', price: 29.99 },
  { id: 125, title: 'Green Dress', price: 44.99 },
  { id: 130, title: 'Cricket Helmet', price: 69.99 },
  { id: 143, title: 'Sugar Free Gold', price: 5.49 },
  { id: 159, title: 'Chocolate Chip Cookies', price: 7.99 },
  { id: 175, title: 'Cabinet', price: 399.99 },
  { id: 194, title: 'Bamboo Spatula', price: 12.99 },
];

const PAYMENT_METHODS = ['Visa •••• 4242', 'Mastercard •••• 8891', 'PayPal', 'Apple Pay'];

const STATUSES: OrderStatus[] = [
  'delivered', 'delivered', 'delivered', 'delivered',
  'shipped', 'shipped', 'processing', 'processing',
  'pending', 'cancelled',
];

/** Deterministic PRNG so the demo dataset never changes between reloads. */
function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, list: T[]): T {
  return list[Math.floor(random() * list.length)];
}

export function generateMockOrders(count = 42): Order[] {
  const random = mulberry32(20260219);
  const now = new Date();
  const orders: Order[] = [];

  for (let index = 0; index < count; index += 1) {
    const first = pick(random, FIRST_NAMES);
    const last = pick(random, LAST_NAMES);
    const [city, country] = pick(random, LOCATIONS);
    const daysAgo = Math.floor(random() * 330);
    const createdAt = new Date(now.getTime() - daysAgo * 86_400_000);
    const lineCount = 1 + Math.floor(random() * 3);
    const items = Array.from({ length: lineCount }, () => {
      const product = pick(random, MOCK_PRODUCTS);
      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1 + Math.floor(random() * 3),
      };
    });

    const subtotal = Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
    ) / 100;
    const shipping = subtotal >= 75 ? 0 : 6.95;
    const discount = random() > 0.75 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;

    orders.push({
      id: `SS-${String(24_150 + index)}`,
      createdAt: createdAt.toISOString(),
      status: daysAgo < 3 ? 'processing' : pick(random, STATUSES),
      items,
      subtotal,
      discount,
      shipping,
      total: Math.round((subtotal - discount + shipping) * 100) / 100,
      paymentMethod: pick(random, PAYMENT_METHODS),
      customer: {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        phone: `+1 (${200 + Math.floor(random() * 700)}) 555-0${100 + Math.floor(random() * 800)}`,
        city,
        country,
        address: `${10 + Math.floor(random() * 200)} ${pick(random, ['Harper', 'Vine', 'Linden', 'Market', 'Cedar'])} Street`,
      },
    });
  }

  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Customers are derived from orders so counts and spend stay consistent. */
export function deriveCustomers(orders: Order[]): Customer[] {
  const byEmail = new Map<string, Customer>();

  orders.forEach((order) => {
    const existing = byEmail.get(order.customer.email);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent = Math.round((existing.totalSpent + order.total) * 100) / 100;
      if (new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
        existing.lastOrderAt = order.createdAt;
      }
      if (new Date(order.createdAt) < new Date(existing.joinedAt)) {
        existing.joinedAt = order.createdAt;
      }
      return;
    }

    byEmail.set(order.customer.email, {
      id: order.customer.email,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone ?? '—',
      city: order.customer.city ?? '—',
      country: order.customer.country ?? '—',
      orders: 1,
      totalSpent: order.total,
      joinedAt: order.createdAt,
      lastOrderAt: order.createdAt,
    });
  });

  return Array.from(byEmail.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}
