import type { Product } from '@/types';
import { formatDate } from '@/lib/format';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/cn';

export function ProductReviews({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];
  const total = reviews.length;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => Math.round(review.rating) === star).length;
    return { star, count, percent: total ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <section className="border-t border-line pt-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="text-xl text-ink">Reviews</h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl leading-none text-ink">
              {product.rating.toFixed(1)}
            </span>
            <div className="pb-1">
              <Rating value={product.rating} showValue={false} size="md" />
              <p className="mt-1 text-[11px] text-muted">
                {total > 0 ? `${total} written reviews` : 'No written reviews yet'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.map((row) => (
              <div key={row.star} className="flex items-center gap-2.5">
                <span className="w-3 text-[11px] text-muted">{row.star}</span>
                <div className="h-1 flex-1 bg-surface-2">
                  <div
                    className={cn('h-full bg-ink/70')}
                    style={{ width: `${row.percent}%` }}
                    aria-hidden
                  />
                </div>
                <span className="w-8 text-right text-[10px] tabular-nums text-muted">
                  {row.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {reviews.length === 0 && (
            <p className="text-[13px] leading-relaxed text-muted">
              This piece is new to the store. Be the first to share how it fits, feels and wears.
            </p>
          )}

          {reviews.slice(0, 4).map((review, index) => (
            <article key={`${review.reviewerEmail}-${index}`} className="border-b border-line pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-ink">{review.reviewerName}</p>
                <span className="text-[11px] text-muted">{formatDate(review.date)}</span>
              </div>
              <Rating value={review.rating} className="mt-1.5" showValue={false} />
              <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-muted">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
