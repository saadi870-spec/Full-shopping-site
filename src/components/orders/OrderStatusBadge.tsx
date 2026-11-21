import type { OrderStatus } from '@/types';
import { cn } from '@/lib/cn';

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-surface-2 text-ink-soft' },
  processing: { label: 'Processing', className: 'bg-[#c08a3e]/12 text-[#a06f26] dark:text-[#e0b06a]' },
  shipped: { label: 'Shipped', className: 'bg-[#3f6b8f]/12 text-[#35617f] dark:text-[#8fb9d6]' },
  delivered: { label: 'Delivered', className: 'bg-success/12 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-sale/10 text-sale' },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.1em]',
        style.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {style.label}
    </span>
  );
}

export const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
