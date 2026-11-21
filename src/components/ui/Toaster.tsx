import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/stores/toastStore';
import { cn } from '@/lib/cn';

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ACCENTS: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-sale',
  info: 'text-ink',
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-line bg-surface px-4 py-3.5 shadow-lg"
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', ACCENTS[toast.variant])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-snug text-ink">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
