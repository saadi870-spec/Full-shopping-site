import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Toaster } from '@/components/ui/Toaster';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden overflow-hidden bg-[#2b2723] lg:block">
          <img
            src="/images/hero.jpg"
            alt=""
            className="h-full w-full object-cover opacity-90"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/60">The ShopSphere edit</p>
            <p className="mt-4 max-w-sm font-display text-3xl leading-tight">
              “Considered pieces, chosen slowly. Made to outlast the season.”
            </p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-white/60">
              Spring / Summer 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-6 sm:px-10">
            <Logo />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Store
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 pb-14 sm:px-10">
            <div className="w-full max-w-sm animate-fade-up">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
              <h1 className="mt-3 text-[clamp(1.9rem,3vw,2.5rem)] leading-tight text-ink">{title}</h1>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">{subtitle}</p>
              <div className="mt-8">{children}</div>
              {footer && <div className="mt-7">{footer}</div>}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
