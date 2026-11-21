import type { Product, ProductFilters, SortOption } from '@/types';

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity-desc', label: 'Best selling' },
  { value: 'rating-desc', label: 'Highest rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'title-asc', label: 'Alphabetical' },
];

export function priceBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 0];
  const prices = products.map((product) => product.price);
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
}

export function popularityScore(product: Product): number {
  return product.rating * 12 + (product.reviews?.length ?? 0) * 2 + Math.min(product.stock, 100) / 20;
}

function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const haystack = [
    product.title,
    product.brand ?? '',
    product.category,
    product.description,
    ...(product.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.id - a.id);
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'popularity-desc':
      sorted.sort((a, b) => popularityScore(b) - popularityScore(a));
      break;
    case 'title-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }
  return sorted;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  pageCount: number;
  page: number;
}

/** Applies every active filter, sorts the result and slices out the current page. */
export function applyProductFilters(products: Product[], filters: ProductFilters): PaginatedProducts {
  const search = filters.search.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (filters.saleOnly && product.discountPercentage <= 0) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
    return matchesSearch(product, search);
  });

  const sorted = sortProducts(filtered, filters.sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / filters.perPage));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const start = (page - 1) * filters.perPage;

  return {
    items: sorted.slice(start, start + filters.perPage),
    total: sorted.length,
    pageCount,
    page,
  };
}

export function countActiveFilters(filters: ProductFilters, bounds: [number, number]): number {
  let count = 0;
  if (filters.saleOnly) count += 1;
  if (filters.category) count += 1;
  if (filters.search.trim()) count += 1;
  if (filters.minPrice > bounds[0] || filters.maxPrice < bounds[1]) count += 1;
  return count;
}
