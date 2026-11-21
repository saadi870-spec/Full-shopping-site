import { Heart, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  { icon: Truck, title: 'Complimentary shipping', description: 'On all orders over $75' },
  { icon: RotateCcw, title: 'Easy returns', description: '30-day return policy' },
  { icon: ShieldCheck, title: 'Demo checkout', description: 'No card is ever charged' },
  { icon: Heart, title: 'Saved pieces', description: 'Your wishlist, kept for later' },
];

export function TrustBar() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-7 py-8 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink/70" strokeWidth={1.4} />
            <div>
              <p className="text-[12px] font-medium text-ink">{title}</p>
              <p className="mt-0.5 text-[11px] text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
