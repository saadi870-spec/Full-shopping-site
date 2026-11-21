import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'sale' | 'success' | 'ink' | 'outline';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-soft',
  sale: 'bg-sale text-white',
  success: 'bg-success/12 text-success',
  ink: 'bg-ink text-bg',
  outline: 'border border-line text-muted',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[2px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
