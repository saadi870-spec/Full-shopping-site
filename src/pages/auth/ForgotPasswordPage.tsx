import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/schemas';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSentTo(values.email);
  }

  return (
    <AuthShell
      eyebrow="Password help"
      title="Reset your password"
      subtitle="Enter the email tied to your account to step through the reset flow."
      footer={
        <p className="text-[13px] text-muted">
          Remembered it?{' '}
          <Link to="/login" className="text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sentTo ? (
        <div className="border border-line bg-surface p-5">
          <MailCheck className="h-6 w-6 text-success" />
          <h2 className="mt-3 text-lg text-ink">Reset link simulated</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            No email is sent by this demo. In a live store, a link for{' '}
            <span className="text-ink">{sentTo}</span> would arrive and expire after 30 minutes.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Sending link…' : 'Send reset link'}
          </Button>

          <p className="text-[10px] leading-relaxed text-muted">
            For your security we never confirm whether an address is registered.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
