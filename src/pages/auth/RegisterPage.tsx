import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { registerSchema, type RegisterValues } from '@/lib/schemas';
import { toast } from '@/stores/toastStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field, Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const registerUser = useAuthStore((state) => state.register);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false },
  });

  if (currentUser) return <Navigate to="/account" replace />;

  async function onSubmit(values: RegisterValues) {
    setFormError('');
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (!result.ok) {
      setFormError(result.error ?? 'Unable to create your account.');
      return;
    }
    toast.success('Account created', 'Welcome to ShopSphere.');
    navigate('/account', { replace: true });
  }

  return (
    <AuthShell
      eyebrow="Join ShopSphere"
      title="Create your account"
      subtitle="Save pieces you love, track orders and enjoy a faster checkout."
      footer={
        <p className="text-[13px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="flex items-start gap-2 border border-sale/30 bg-sale/5 px-3 py-2.5 text-[12px] text-sale">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {formError}
          </div>
        )}

        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Jordan Ellis" invalid={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" invalid={Boolean(errors.email)} {...register('email')} />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message} hint="8 characters minimum">
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" invalid={Boolean(errors.password)} {...register('password')} />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" invalid={Boolean(errors.confirmPassword)} {...register('confirmPassword')} />
        </Field>

        <div>
          <Checkbox
            id="terms"
            label="I understand this is a demo — my details stay in this browser"
            {...register('terms')}
          />
          {errors.terms && <p className="mt-1.5 text-[11px] text-sale">{errors.terms.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-[10px] leading-relaxed text-muted">
          Demo only: account details are kept in this browser's local storage and are not sent to a
          server. Do not reuse a real password.
        </p>
      </form>
    </AuthShell>
  );
}
