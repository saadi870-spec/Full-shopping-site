import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
  label = 'Quantity',
  className,
}: QuantityStepperProps) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));
  const sizeClasses = size === 'sm' ? 'h-8' : 'h-11';

  return (
    <div className={cn('inline-flex items-center border border-line bg-surface', sizeClasses, className)}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="grid h-full w-9 place-items-center text-ink transition-colors hover:bg-surface-2 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          'grid h-full min-w-9 place-items-center border-x border-line text-center text-[13px] tabular-nums text-ink',
          size === 'sm' ? 'min-w-8' : 'min-w-10',
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="grid h-full w-9 place-items-center text-ink transition-colors hover:bg-surface-2 disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
