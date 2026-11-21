import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Package, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useCategoriesQuery, useProductsQuery } from '@/hooks/useProducts';
import {
  mergeAdminProducts,
  useAdminProductsStore,
} from '@/stores/adminProductsStore';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/stores/toastStore';
import { adminProductSchema, type AdminProductValues } from '@/lib/schemas';
import { formatCurrency, titleCase } from '@/lib/format';
import { getErrorMessage } from '@/services/http';
import type { Product } from '@/types';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { TableSkeleton } from '@/components/ui/Skeleton';

const PER_PAGE = 8;
const PLACEHOLDER = '/images/placeholder.svg';

const EMPTY_VALUES: AdminProductValues = {
  title: '',
  brand: '',
  category: '',
  price: 0,
  discountPercentage: 0,
  stock: 0,
  rating: 4.5,
  description: '',
  image: '',
};

function toFormValues(product: Product | null): AdminProductValues {
  if (!product) return EMPTY_VALUES;
  return {
    title: product.title,
    brand: product.brand ?? '',
    category: product.category,
    price: product.price,
    discountPercentage: Math.round(product.discountPercentage),
    stock: product.stock,
    rating: product.rating,
    description: product.description,
    image: product.thumbnail,
  };
}

export default function AdminProductsPage() {
  const { data: catalogue, isLoading, isError, error, refetch } = useProductsQuery();
  const { data: categories } = useCategoriesQuery();
  const created = useAdminProductsStore((state) => state.created);
  const edited = useAdminProductsStore((state) => state.edited);
  const deleted = useAdminProductsStore((state) => state.deleted);
  const addProduct = useAdminProductsStore((state) => state.addProduct);
  const updateProduct = useAdminProductsStore((state) => state.updateProduct);
  const deleteProduct = useAdminProductsStore((state) => state.deleteProduct);
  const resetProducts = useAdminProductsStore((state) => state.resetProducts);

  const products = useMemo(
    () => mergeAdminProducts(catalogue ?? [], { created, edited, deleted }),
    [catalogue, created, edited, deleted],
  );

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (category && product.category !== category) return false;
      if (!term) return true;
      return `${product.title} ${product.brand ?? ''} ${product.category} ${product.sku ?? ''}`
        .toLowerCase()
        .includes(term);
    });
  }, [products, category, debouncedQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category]);

  const nextId = useMemo(
    () => Math.max(1000, ...products.map((product) => product.id)) + 1,
    [products],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (formOpen) reset(toFormValues(editing));
  }, [formOpen, editing, reset]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function onSubmit(values: AdminProductValues) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const base = editing;
    const id = base?.id ?? nextId;
    const image = values.image?.trim() || base?.thumbnail || PLACEHOLDER;

    const product: Product = {
      id,
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      price: values.price,
      discountPercentage: values.discountPercentage ?? 0,
      rating: values.rating ?? base?.rating ?? 4.5,
      stock: values.stock,
      brand: values.brand?.trim() || base?.brand || 'ShopSphere',
      sku: base?.sku ?? `SS-${id}`,
      images: image === base?.thumbnail && base?.images?.length ? base.images : [image],
      thumbnail: image,
      tags: base?.tags ?? [],
      reviews: base?.reviews ?? [],
      minimumOrderQuantity: base?.minimumOrderQuantity ?? 1,
      availabilityStatus: values.stock > 0 ? 'In Stock' : 'Out of Stock',
      shippingInformation: base?.shippingInformation ?? 'Ships in 2–4 business days',
      returnPolicy: base?.returnPolicy ?? '30 days return policy',
      warrantyInformation: base?.warrantyInformation,
    };

    if (base) {
      updateProduct(product);
      toast.success('Product updated', product.title);
    } else {
      addProduct(product);
      toast.success('Product added', `${product.title} is now in the catalogue.`);
    }
    setFormOpen(false);
  }

  const stats = [
    { label: 'Catalogue', value: products.length },
    { label: 'Low stock (≤5)', value: products.filter((p) => p.stock > 0 && p.stock <= 5).length },
    { label: 'Out of stock', value: products.filter((p) => p.stock === 0).length },
    { label: 'Categories', value: new Set(products.map((p) => p.category)).size },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Inventory</p>
          <h1 className="mt-2 text-2xl leading-tight text-ink sm:text-[28px]">Products</h1>
          <p className="mt-1.5 text-[12.5px] text-muted">
            {products.length} products in the catalogue. Changes are stored locally for this demo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset edits
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add product
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line bg-surface px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-2xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands or SKU…"
            aria-label="Search products"
            className="h-10 pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
          className="h-10 sm:w-56"
        >
          <option value="">All categories</option>
          {(categories ?? []).map((slug) => (
            <option key={slug} value={slug}>
              {titleCase(slug)}
            </option>
          ))}
        </Select>
      </div>

      <div className="border border-line bg-surface">
        {isLoading && (
          <div className="p-5">
            <TableSkeleton rows={8} columns={4} />
          </div>
        )}

        {isError && (
          <div className="p-5">
            <EmptyState
              icon={<AlertTriangle className="h-7 w-7" />}
              title="Catalogue unavailable"
              description={getErrorMessage(error)}
              action={<Button onClick={() => refetch()}>Retry</Button>}
            />
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line text-[9px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((product) => (
                  <tr key={product.id} className="text-[12px] transition-colors hover:bg-surface-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-10 shrink-0 overflow-hidden bg-surface-2">
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-ink">{product.title}</p>
                          <p className="text-[10px] text-muted">
                            {product.brand ?? 'ShopSphere'} · {product.sku ?? `SS-${product.id}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{titleCase(product.category)}</td>
                    <td className="px-5 py-3 tabular-nums text-ink">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'text-[11px] font-medium',
                          product.stock === 0
                            ? 'text-sale'
                            : product.stock <= 5
                              ? 'text-[#a06f26] dark:text-[#e0b06a]'
                              : 'text-ink-soft',
                        )}
                      >
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Rating value={product.rating} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.title}`}
                          className="grid h-8 w-8 place-items-center border border-line text-ink transition-colors hover:bg-surface-2"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Delete ${product.title}`}
                          className="grid h-8 w-8 place-items-center border border-line text-muted transition-colors hover:border-sale hover:text-sale"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <div className="px-5 py-12 text-center">
            <Package className="mx-auto h-7 w-7 text-muted" />
            <p className="mt-3 text-[13px] text-muted">
              No products match this filter. Try another search.
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <p className="text-[11px] text-muted">
              Showing {(safePage - 1) * PER_PAGE + 1}–
              {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit product' : 'Add a product'}
        description={
          editing
            ? 'Update the details below. Changes are saved to this browser.'
            : 'Create a new catalogue entry. It appears in the storefront immediately.'
        }
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" error={errors.title?.message} className="sm:col-span-2">
              <Input id="title" invalid={Boolean(errors.title)} {...register('title')} />
            </Field>
            <Field label="Brand" htmlFor="brand" error={errors.brand?.message}>
              <Input id="brand" {...register('brand')} />
            </Field>
            <Field label="Category" htmlFor="category" error={errors.category?.message}>
              <Select id="category" invalid={Boolean(errors.category)} {...register('category')}>
                <option value="">Select a category</option>
                {(categories ?? []).map((slug) => (
                  <option key={slug} value={slug}>
                    {titleCase(slug)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Price (USD)" htmlFor="price" error={errors.price?.message}>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                invalid={Boolean(errors.price)}
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Discount %" htmlFor="discountPercentage" error={errors.discountPercentage?.message}>
              <Input
                id="discountPercentage"
                type="number"
                min="0"
                max="90"
                invalid={Boolean(errors.discountPercentage)}
                {...register('discountPercentage', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Stock" htmlFor="stock" error={errors.stock?.message}>
              <Input
                id="stock"
                type="number"
                min="0"
                invalid={Boolean(errors.stock)}
                {...register('stock', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Rating (0–5)" htmlFor="rating" error={errors.rating?.message}>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('rating', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Image URL" htmlFor="image" error={errors.image?.message} className="sm:col-span-2">
              <Input id="image" placeholder="https://… or leave blank for a placeholder" {...register('image')} />
            </Field>
            <Field label="Description" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
              <Textarea id="description" rows={4} invalid={Boolean(errors.description)} {...register('description')} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              {editing ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this product?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be removed from the catalogue in this browser. This can be undone by resetting edits.`
            : ''
        }
        confirmLabel="Delete product"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProduct(deleteTarget.id);
          toast.success('Product deleted', deleteTarget.title);
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset product edits?"
        description="All added, edited and deleted products will return to the original DummyJSON catalogue."
        confirmLabel="Reset catalogue"
        onConfirm={() => {
          resetProducts();
          setResetOpen(false);
          toast.info('Catalogue restored to default');
        }}
      />
    </div>
  );
}
