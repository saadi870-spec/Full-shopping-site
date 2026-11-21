import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#2b2723] text-white">
      <img
        src="/images/hero.jpg"
        alt="Model wearing an oversized cream wool coat in a warm studio"
        className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

      <div className="container-page relative flex min-h-[520px] items-center py-16 sm:min-h-[580px] lg:min-h-[640px]">
        <div className="max-w-xl animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/70">
            Spring / Summer 2026
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.04] tracking-[-0.015em]">
            Timeless design.
            <br />
            Modern essence.
          </h1>
          <p className="mt-6 max-w-sm text-[13.5px] leading-relaxed text-white/80">
            Discover effortless pieces crafted for a life well-lived — quiet luxury, considered
            materials and objects made to be kept.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/products?category=womens-dresses"
              className="inline-flex h-12 items-center justify-center bg-white px-8 text-[10px] font-medium uppercase tracking-[0.18em] text-[#14110f] transition-colors hover:bg-white/85"
            >
              Shop women
            </Link>
            <Link
              to="/products?category=mens-shirts"
              className="inline-flex h-12 items-center justify-center border border-white/50 px-8 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Shop men
            </Link>
          </div>

          <p className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/60">
            Free shipping over $75
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </section>
  );
}
