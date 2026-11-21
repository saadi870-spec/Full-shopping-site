export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: ProductReview[];
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartItem {
  /** Stable key derived from product + selected options. */
  key: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export type CouponType = 'percent' | 'fixed' | 'shipping';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  label: string;
  minSubtotal?: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  savings: number;
  shipping: number;
  discount: number;
  total: number;
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'popularity-desc'
  | 'title-asc';

export interface ProductFilters {
  search: string;
  category: string;
  saleOnly: boolean;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
  page: number;
  perPage: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  size?: string;
  color?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  customer: OrderCustomer;
  userId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  orders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  createdAt: string;
  newsletter?: boolean;
}

export interface StoredUser extends User {
  /** Demo-only credential handling. Never do this in a real application. */
  password: string;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}
