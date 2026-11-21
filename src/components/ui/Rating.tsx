import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function Rating({ value, count, size = 'sm', showValue = true, className }: RatingProps) {
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-flex">
              <Star className={cn(starSize, 'text-line')} strokeWidth={1.5} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : half ? '50%' : '0%' }}
              >
                <Star className={cn(starSize, 'fill-ink text-ink')} strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-[11px] text-muted">
          {value.toFixed(1)}
          {typeof count === 'number' && ` (${count})`}
        </span>
      )}
      <span className="sr-only">{`Rated ${value} out of 5`}</span>
    </div>
  );
}
