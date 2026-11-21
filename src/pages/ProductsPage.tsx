import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useProductsQuery } from '@/hooks/useProducts';
import { SORT_OPTIONS, applyProductFilters, countActiveFilters, priceBounds } from '@/lib/productFilters';
import { getErrorMessage } from '@/services/http';
import type { ProductFilters, SortOption } from '@/types';
import { formatCurrency, titleCase } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { FiltersPanel } from '@/components/product/FiltersPanel';

const PER_PAGE = 12;

/** Reads the typed filter state from the URL, falling back to catalogue defaults. */
function readFilters(params: URLSearchParams, bounds: [number, number]): ProductFilters {
  const sort = params.get('sort') as SortOption | null;
  const min = Number(params.get('min'));
  const max = Number(params.get('max'));
  const page = Number(params.get('page'));

  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    saleOnly: params.get('sale') === 'true',
    minPrice: params.has('min') && Number.isFinite(min) ? min : bounds[0],
    maxPrice: params.has('max') && Number.isFinite(max) ? max : bounds[1],
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortOption) : 'featured',
    page: Number.isInteger(page) && page > 1 ? page : 1,
    perPage: PER_PAGE,
  };
}

/** Serialises filters back to the URL, omitting anything that matches the defaults. */
function writeFilters(filters: ProductFilters, bounds: [number, number]): URLSearchParams {
  const next = new URLSearchParams();
  if (filters.search) next.set('search', filters.search);
  if (filters.category) next.set('category', filters.category);
  if (filters.saleOnly) next.set('sale', 'true');
  if (filters.minPrice !== bounds[0]) next.set('min', String(filters.minPrice));
  if (filters.maxPrice !== bounds[1]) next.set('max', String(filters.maxPrice));
  if (filters.sort !== 'featured') next.set('sort', filters.sort);
  if (filters.page > 1) next.set('page', String(filters.page));
  return next;
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useProductsQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catalogue = useMemo(() => data ?? [], [data]);
  const bounds = useMemo(() => priceBounds(catalogue), [catalogue]);
  const filters = useMemo(() => readFilters(params, bounds), [params, bounds]);
  const result = useMemo(() => applyProductFilters(catalogue, filters), [catalogue, filters]);

  const categoryCounts = useMemo(() => {
    return catalogue.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
      return counts;
    }, {});
  }, [catalogue]);

  const categories = useMemo(
    () =>
      Object.keys(categoryCounts).sort(
        (a, b) => categoryCounts[b] - categoryCounts[a] || a.localeCompare(b),
      ),
    [categoryCounts],
  );

  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  function updateFilters(patch: Partial<ProductFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    setParams(writeFilters(next, bounds), { replace: true });
  }

  // Write the debounced search term to the URL; filter changes above are immediate.
  useEffect(() => {
    const term = searchDraft.trim();
    if (term === filters.search) return;

    const timer = window.setTimeout(() => {
      setParams(writeFilters({ ...filters, search: term, page: 1 }, bounds), { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft, filters, bounds, setParams]);

  function resetFilters() {
    setSearchDraft('');
    setParams(new URLSearchParams(), { replace: true });
  }

  function changePage(page: number) {
    updateFilters({ page });
    window.scrollTo({ top: 220, behavior: 'smooth' });
  }

  const activeFilterCount = countActiveFilters(filters, bounds);
  const priceFiltered = filters.minPrice > bounds[0] || filters.maxPrice < bounds[1];
  const hasChips = Boolean(filters.saleOnly || filters.category || filters.search || priceFiltered);
  const hasQuery = Boolean(filters.search || filters.category || filters.saleOnly);

  const heading = filters.search
    ? `Results for “${filters.search}”`
    : filters.category
      ? titleCase(filters.category)
      : filters.saleOnly
        ? 'The sale edit'
        : 'All products';

  const filterPanel = (
    <FiltersPanel
      filters={filters}
      bounds={bounds}
      categories={categories}
      categoryCounts={categoryCounts}
      onChange={updateFilters}
      onReset={resetFilters}
      activeCount={activeFilterCount}
    />
  );

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs
        items={[{ label: 'Home', to: '/' }, { label: filters.saleOnly ? 'Sale' : 'Shop' }]}
        className="mb-8"
      />

      <header className="mb-9 flex flex-col gap-4 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
            {filters.saleOnly ? 'Reduced prices' : 'The collection'}
          </p>
          <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[34px]">{heading}</h1>
          <p className="mt-2 text-[13px] text-muted">
            {isLoading
              ? 'Loading the catalogue…'
              : `${result.total} ${result.total === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Sort</span>
            <Select
              aria-label="Sort products"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value as SortOption })}
              className="h-9 w-[190px] text-[12px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-9 items-center gap-2 border border-line px-3.5 text-[10px] uppercase tracking-[0.14em] text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] text-bg">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filterPanel}</div>
        </aside>

        <div>
          {hasChips && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filters.saleOnly && (
                <button
                  type="button"
                  onClick={() => updateFilters({ saleOnly: false })}
                  className="inline-flex items-center gap-1.5 border border-sale/30 bg-sale/5 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-sale"
                >
                  On sale
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.category && (
                <button
                  type="button"
                  onClick={() => updateFilters({ category: '' })}
                  className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-soft"
                >
                  {titleCase(filters.category)}
                  <X className="h-3 w-3" />
                </button>
              )}
              {priceFiltered && (
                <button
                  type="button"
                  onClick={() => updateFilters({ minPrice: bounds[0], maxPrice: bounds[1] })}
                  className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-soft"
                >
                  {formatCurrency(filters.minPrice)} – {formatCurrency(filters.maxPrice)}
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft('');
                    updateFilters({ search: '' });
                  }}
                  className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-soft"
                >
                  “{filters.search}”
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {isError && (
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" />}
              title="We couldn't load the collection"
              description={getErrorMessage(error)}
              action={<Button onClick={() => refetch()}>Try again</Button>}
            />
          )}

          {isLoading && <ProductGridSkeleton count={8} />}

          {!isLoading && !isError && result.items.length === 0 && (
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title={hasQuery ? 'No products match your filters' : 'Nothing here yet'}
              description={
                hasQuery
                  ? 'Try a different keyword, widen the price range or browse another category.'
                  : 'The catalogue is empty right now. Please check back shortly.'
              }
              action={
                <Button onClick={resetFilters} variant="outline">
                  Reset filters
                </Button>
              }
            />
          )}

          {!isLoading && !isError && result.items.length > 0 && (
            <>
              <ProductGrid products={result.items} />
              <div className="mt-12 flex flex-col items-center gap-3 border-t border-line pt-8">
                <p className="text-[11px] text-muted">
                  Page {result.page} of {result.pageCount}
                </p>
                <Pagination page={result.page} pageCount={result.pageCount} onChange={changePage} />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {filterPanel}
        <div className="mt-6">
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Show {result.total} results
          </Button>
        </div>
      </Modal>
    </div>
  );
}
