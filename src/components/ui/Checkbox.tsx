import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn('group flex cursor-pointer items-start gap-2.5 text-[13px] text-ink-soft', className)}
    >
      <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-[2px] border border-ink/30 bg-surface transition-colors checked:border-ink checked:bg-accent focus-visible:outline-offset-2"
          {...props}
        />
        <Check
          className="pointer-events-none absolute h-3 w-3 scale-75 text-accent-ink opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  );
});
