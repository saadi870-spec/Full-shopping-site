import type { ProductFilters } from '@/types';
import { formatCurrency, titleCase } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/Input';

interface FiltersPanelProps {
  filters: ProductFilters;
  bounds: [number, number];
  categories: string[];
  categoryCounts: Record<string, number>;
  onChange: (patch: Partial<ProductFilters>) => void;
  onReset: () => void;
  activeCount: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function FiltersPanel({
  filters,
  bounds,
  categories,
  categoryCounts,
  onChange,
  onReset,
  activeCount,
}: FiltersPanelProps) {
  const totalCount = Object.values(categoryCounts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className="border-b border-ink/30 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-ink transition-opacity disabled:opacity-30"
        >
          Clear all
        </button>
      </div>

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted">Category</p>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onChange({ category: '' })}
            className={cn(
              'flex w-full items-center justify-between text-left text-[13px] transition-colors',
              filters.category === ''
                ? 'text-ink underline decoration-1 underline-offset-4'
                : 'text-muted hover:text-ink',
            )}
          >
            <span>All categories</span>
            <span className="text-[11px] tabular-nums text-muted/70">{totalCount}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange({ category: category === filters.category ? '' : category })}
              className={cn(
                'flex w-full items-center justify-between gap-3 text-left text-[13px] transition-colors',
                filters.category === category
                  ? 'text-ink underline decoration-1 underline-offset-4'
                  : 'text-muted hover:text-ink',
              )}
            >
              <span className="truncate">{titleCase(category)}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted/70">
                {categoryCounts[category] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted">Price range</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={bounds[0]}
            max={filters.maxPrice}
            value={filters.minPrice}
            aria-label="Minimum price"
            onChange={(event) => {
              const value = event.target.value === '' ? bounds[0] : Number(event.target.value);
              onChange({
                minPrice: clamp(Number.isFinite(value) ? value : bounds[0], bounds[0], filters.maxPrice),
              });
            }}
            className="h-10 text-[13px]"
          />
          <span className="text-muted">—</span>
          <Input
            type="number"
            inputMode="numeric"
            min={filters.minPrice}
            max={bounds[1]}
            value={filters.maxPrice}
            aria-label="Maximum price"
            onChange={(event) => {
              const value = event.target.value === '' ? bounds[1] : Number(event.target.value);
              onChange({
                maxPrice: clamp(Number.isFinite(value) ? value : bounds[1], filters.minPrice, bounds[1]),
              });
            }}
            className="h-10 text-[13px]"
          />
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Catalogue range {formatCurrency(bounds[0])} – {formatCurrency(bounds[1])}
        </p>
      </div>

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted">Quick price</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Under $25', min: bounds[0], max: Math.min(25, bounds[1]) },
            { label: '$25 – $100', min: 25, max: 100 },
            { label: '$100 – $500', min: 100, max: 500 },
            { label: '$500+', min: 500, max: bounds[1] },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ minPrice: preset.min, maxPrice: preset.max })}
              className={cn(
                'border px-2.5 py-1.5 text-[11px] transition-colors',
                filters.minPrice === preset.min && filters.maxPrice === preset.max
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line text-ink-soft hover:border-ink',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
