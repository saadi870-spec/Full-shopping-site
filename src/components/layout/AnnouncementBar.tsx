import { Truck } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-bg">
      <div className="container-page flex h-9 items-center justify-between text-[10px] uppercase tracking-[0.18em]">
        <span className="hidden items-center gap-1.5 opacity-80 sm:flex">
          <Truck className="h-3 w-3" aria-hidden />
          Free returns within 30 days
        </span>
        <p className="mx-auto text-center sm:mx-0">
          Complimentary shipping on all orders over $75
        </p>
        <span className="hidden items-center gap-1 opacity-80 sm:flex">Ships worldwide</span>
      </div>
    </div>
  );
}
