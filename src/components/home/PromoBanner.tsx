import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PromoBanner() {
  return (
    <section className="container-page grid gap-4 py-4 md:grid-cols-2 lg:gap-6">
      <Link
        to="/products?category=fragrances"
        className="group relative flex min-h-[320px] items-end overflow-hidden bg-[#d9cec1] p-8 text-[#14110f] md:min-h-[400px] md:p-10"
      >
        <img
          src="/images/promo-fragrance.jpg"
          alt="A glass perfume bottle on a travertine plinth in warm sunlight"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="relative text-white">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/80">The fragrance edit</p>
          <h3 className="mt-3 max-w-xs font-display text-3xl leading-tight">
            Scents that linger beyond the season.
          </h3>
          <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
            Discover
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>

      <div className="flex min-h-[320px] flex-col justify-between bg-surface-2 p-8 md:min-h-[400px] md:p-10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Home & living</p>
          <span className="font-display text-sm text-muted">No. 02</span>
        </div>

        <div>
          <h3 className="max-w-sm font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.15] text-ink">
            Objects for quieter rooms and slower mornings.
          </h3>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
            Sculptural lighting, warm woods and stoneware — the pieces that make a space feel
            finished.
          </p>
          <Link
            to="/products?category=home-decoration"
            className="mt-7 inline-flex items-center gap-2 border-b border-ink/40 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
          >
            Shop home
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
