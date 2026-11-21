import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useAuthStore, DEMO_CREDENTIALS } from '@/stores/authStore';
import { loginSchema, type LoginValues } from '@/lib/schemas';
import { toast } from '@/stores/toastStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/account'} replace />;
  }

  async function onSubmit(values: LoginValues) {
    setFormError('');
    await new Promise((resolve) => setTimeout(resolve, 350));
    const result = login(values.email, values.password);
    if (!result.ok || !result.user) {
      setFormError(result.error ?? 'Unable to sign in.');
      return;
    }

    toast.success(`Welcome back, ${result.user.name.split(' ')[0]}`);
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    const destination =
      result.user.role === 'admin' ? '/admin' : (from ?? '/account');
    navigate(destination, { replace: true });
  }

  function fillDemo(kind: 'customer' | 'admin') {
    const credentials = DEMO_CREDENTIALS[kind];
    setValue('email', credentials.email, { shouldValidate: true });
    setValue('password', credentials.password, { shouldValidate: true });
    setFormError('');
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to ShopSphere"
      subtitle="Track orders, revisit saved pieces and check out faster."
      footer={
        <p className="text-[13px] text-muted">
          New to ShopSphere?{' '}
          <Link to="/register" className="text-ink underline underline-offset-4">
            Create an account
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

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-[11px] text-muted underline underline-offset-4 hover:text-ink"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-7 border border-line bg-surface p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Demo accounts</p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => fillDemo('customer')}
            className="flex w-full items-center justify-between border border-line px-3 py-2 text-left text-[11px] transition-colors hover:border-ink"
          >
            <span className="text-ink">Customer</span>
            <span className="text-muted">demo@shopsphere.dev · demo1234</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="flex w-full items-center justify-between border border-line px-3 py-2 text-left text-[11px] transition-colors hover:border-ink"
          >
            <span className="text-ink">Admin</span>
            <span className="text-muted">admin@shopsphere.dev · admin123</span>
          </button>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted">
          Demo authentication only — credentials are stored in this browser and are not secure.
        </p>
      </div>
    </AuthShell>
  );
}
