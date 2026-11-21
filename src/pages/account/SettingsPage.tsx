import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { toast } from '@/stores/toastStore';
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/schemas';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';

export function SettingsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  const [resetOpen, setResetOpen] = useState(false);
  const [newsletter, setNewsletter] = useState(currentUser?.newsletter ?? false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  if (!currentUser) return null;

  async function onSubmitPassword(values: ChangePasswordValues) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const result = changePassword(values.currentPassword, values.newPassword);
    if (!result.ok) {
      toast.error('Password not changed', result.error);
      return;
    }
    reset();
    toast.success('Password updated', 'Use your new password next time you sign in.');
  }

  function handleNewsletter(next: boolean) {
    setNewsletter(next);
    const result = updateProfile({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone,
      address: currentUser?.address,
      newsletter: next,
    });
    if (result.ok) toast.success(next ? 'Subscribed' : 'Unsubscribed', 'Your email preferences are saved.');
  }

  function resetDemoData() {
    ['shopsphere-cart', 'shopsphere-wishlist', 'shopsphere-orders', 'shopsphere-admin-products'].forEach(
      (key) => localStorage.removeItem(key),
    );
    toast.info('Demo data reset', 'Reloading the store…');
    window.setTimeout(() => window.location.reload(), 600);
  }

  return (
    <div className="space-y-7">
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Preferences</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[32px]">Settings</h1>
        <p className="mt-2 text-[13px] text-muted">
          Manage your password, appearance and communication preferences.
        </p>
      </header>

      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg text-ink">Appearance</h2>
        <p className="mt-1 text-[12px] text-muted">Choose how ShopSphere looks on this device.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-sm">
          {[
            { value: 'light' as const, label: 'Light', icon: Sun },
            { value: 'dark' as const, label: 'Dark', icon: Moon },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 border px-3 py-4 text-[11px] transition-colors',
                theme === value ? 'border-ink bg-surface-2 text-ink' : 'border-line text-muted hover:border-ink/40',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setTheme(prefersDark ? 'dark' : 'light');
            }}
            className="flex flex-col items-center gap-2 border border-line px-3 py-4 text-[11px] text-muted transition-colors hover:border-ink/40"
          >
            <Monitor className="h-4 w-4" />
            System
          </button>
        </div>
      </section>

      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg text-ink">Notifications</h2>
        <p className="mt-1 text-[12px] text-muted">Occasional updates about new arrivals and the edit.</p>
        <div className="mt-4">
          <Checkbox
            id="newsletter"
            label="Email me new arrivals, sales and studio stories"
            checked={newsletter}
            onChange={(event) => handleNewsletter(event.target.checked)}
          />
        </div>
      </section>

      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg text-ink">Password</h2>
        <p className="mt-1 text-[12px] text-muted">
          Demo accounts keep credentials in local storage, so treat this as a flow demonstration.
        </p>
        <form onSubmit={handleSubmit(onSubmitPassword)} noValidate className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message}>
            <Input id="currentPassword" type="password" autoComplete="current-password" invalid={Boolean(errors.currentPassword)} {...register('currentPassword')} />
          </Field>
          <Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
            <Input id="newPassword" type="password" autoComplete="new-password" invalid={Boolean(errors.newPassword)} {...register('newPassword')} />
          </Field>
          <Field label="Confirm new" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" invalid={Boolean(errors.confirmPassword)} {...register('confirmPassword')} />
          </Field>
          <div className="sm:col-span-3">
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </section>

      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg text-ink">Session & data</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
          <Button variant="ghost" onClick={() => setResetOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Reset demo data
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-muted">
          Resetting clears the cart, wishlist, locally placed orders and admin product edits in this
          browser.
        </p>
      </section>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        description="Your cart, wishlist, placed orders and admin product changes will be cleared from this browser. This cannot be undone."
        confirmLabel="Reset data"
        destructive
        onConfirm={resetDemoData}
      />
    </div>
  );
}
