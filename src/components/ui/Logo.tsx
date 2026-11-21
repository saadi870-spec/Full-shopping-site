import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="ShopSphere home"
      className={cn('group inline-flex flex-col items-start leading-none', className)}
    >
      <span className="font-display text-[22px] tracking-[0.26em] text-ink transition-opacity group-hover:opacity-70 sm:text-[24px]">
        SHOPSPHERE
      </span>
      <span className="mt-1 text-[7px] uppercase tracking-[0.3em] text-muted">
        Considered essentials
      </span>
    </Link>
  );
}
