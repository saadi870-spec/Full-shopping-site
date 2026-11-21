import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail } from 'lucide-react';
import { newsletterSchema, type NewsletterValues } from '@/lib/schemas';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/Button';

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: NewsletterValues) {
    // Demo only — no mailing list backend is connected.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubscribed(true);
    reset();
    toast.success('Demo sign-up received', `Nothing was sent to ${values.email}.`);
  }

  return (
    <section className="container-page py-16 lg:py-20">
      <div className="grid gap-10 bg-ink px-6 py-12 text-bg sm:px-10 md:grid-cols-2 md:items-center md:gap-16 lg:px-16 lg:py-16">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-bg/60">The letter</p>
          <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-bg">
            Early access, considered edits and the occasional story.
          </h2>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-bg/65">
            New arrivals, studio visits and private sales. One thoughtful email a month — never
            more.
          </p>
        </div>

        <div>
          {subscribed ? (
            <div className="flex items-start gap-3 border border-bg/25 p-5">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium text-bg">Demo sign-up complete.</p>
                <p className="mt-1 text-xs text-bg/65">
                  No email will arrive — the list isn't connected to a mailing service.
                </p>
                <button
                  type="button"
                  onClick={() => setSubscribed(false)}
                  className="mt-3 border-b border-bg/40 pb-0.5 text-[10px] uppercase tracking-[0.16em] text-bg/80"
                >
                  Add another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
              <div className="flex items-center gap-2 border-b border-bg/30 pb-3">
                <Mail className="h-4 w-4 text-bg/50" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  aria-invalid={Boolean(errors.email)}
                  className="h-8 flex-1 bg-transparent text-sm text-bg placeholder:text-bg/40 focus:outline-none"
                  {...register('email')}
                />
                <Button
                  type="submit"
                  size="sm"
                  loading={isSubmitting}
                  className="bg-bg text-ink hover:opacity-85"
                >
                  Subscribe
                </Button>
              </div>
              {errors.email && <p className="text-xs text-[#f0a08d]">{errors.email.message}</p>}
              <p className="text-[11px] text-bg/45">
                Demo sign-up — your address is not stored anywhere.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
