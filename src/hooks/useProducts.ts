import { useQuery } from '@tanstack/react-query';
import { fetchAllProducts, fetchCategoryList, fetchProductById } from '@/services/products';
import type { Product } from '@/types';

const queryKeys = {
  products: ['products'] as const,
  product: (id: number) => ['products', 'detail', id] as const,
  categories: ['categories'] as const,
};

/** The whole catalogue is fetched once and cached; ~194 items from DummyJSON. */
export function useProductsQuery() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => fetchProductById(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategoryList,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRelatedProducts(product: Product | undefined, limit = 4): Product[] {
  const { data } = useProductsQuery();
  if (!product || !data) return [];
  return data
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}
