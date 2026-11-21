import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
  /** Renders a router link styled as a button. */
  to?: string;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-[2px] font-medium uppercase tracking-[0.15em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 select-none';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-85 active:translate-y-px',
  secondary: 'bg-surface-2 text-ink hover:bg-line/80',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-accent-ink',
  ghost: 'text-ink/80 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-sale text-white hover:opacity-90',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[10px]',
  md: 'h-11 px-6 text-[11px]',
  lg: 'h-[52px] px-8 text-[11px]',
  icon: 'h-10 w-10',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  to,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);
  const content = (
    <>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        onClick={props.onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
