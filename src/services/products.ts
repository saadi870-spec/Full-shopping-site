import type { Product, ProductsResponse } from '@/types';
import { api } from './http';

/** DummyJSON hosts ~194 products; `limit=0` returns the full catalogue. */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await api.get<ProductsResponse>('/products', {
    params: { limit: 0 },
  });
  return data.products;
}

export async function fetchProductById(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function fetchCategoryList(): Promise<string[]> {
  const { data } = await api.get<string[]>('/products/category-list');
  return data;
}
