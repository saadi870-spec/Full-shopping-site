import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import { profileSchema, type ProfileValues } from '@/lib/schemas';
import { formatDate, initials } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      line1: currentUser?.address?.line1 ?? '',
      line2: currentUser?.address?.line2 ?? '',
      city: currentUser?.address?.city ?? '',
      state: currentUser?.address?.state ?? '',
      postalCode: currentUser?.address?.postalCode ?? '',
      country: currentUser?.address?.country ?? '',
    },
  });

  if (!currentUser) return null;

  async function onSubmit(values: ProfileValues) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const hasAddress = Boolean(values.line1 || values.city);
    const result = updateProfile({
      name: values.name,
      email: values.email,
      phone: values.phone,
      newsletter: currentUser?.newsletter,
      address: hasAddress
        ? {
            line1: values.line1 ?? '',
            line2: values.line2,
            city: values.city ?? '',
            state: values.state ?? '',
            postalCode: values.postalCode ?? '',
            country: values.country ?? '',
          }
        : currentUser?.address,
    });

    if (!result.ok) {
      toast.error('Could not save profile', result.error);
      return;
    }
    toast.success('Profile updated', 'Your details have been saved.');
  }

  return (
    <div className="space-y-7">
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Details</p>
        <h1 className="mt-2 text-3xl leading-tight text-ink sm:text-[32px]">Profile</h1>
        <p className="mt-2 text-[13px] text-muted">
          Keep your contact details and default address up to date.
        </p>
      </header>

      <div className="flex items-center gap-4 border border-line bg-surface p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-[14px] tracking-[0.06em] text-ink">
          {initials(currentUser.name)}
        </span>
        <div>
          <p className="text-[14px] font-medium text-ink">{currentUser.name}</p>
          <p className="text-[12px] text-muted">
            {currentUser.email} · Member since {formatDate(currentUser.createdAt)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-7">
        <section className="border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-lg text-ink">Personal information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" autoComplete="name" invalid={Boolean(errors.name)} {...register('name')} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} {...register('email')} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone?.message} className="sm:col-span-2">
              <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
            </Field>
          </div>
        </section>

        <section className="border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-1 text-lg text-ink">Default address</h2>
          <p className="mb-5 text-[12px] text-muted">Used to pre-fill checkout.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street address" htmlFor="line1" error={errors.line1?.message} className="sm:col-span-2">
              <Input id="line1" autoComplete="address-line1" {...register('line1')} />
            </Field>
            <Field label="Apartment, suite" htmlFor="line2" className="sm:col-span-2">
              <Input id="line2" autoComplete="address-line2" {...register('line2')} />
            </Field>
            <Field label="City" htmlFor="city">
              <Input id="city" autoComplete="address-level2" {...register('city')} />
            </Field>
            <Field label="State / region" htmlFor="state">
              <Input id="state" autoComplete="address-level1" {...register('state')} />
            </Field>
            <Field label="Postal code" htmlFor="postalCode">
              <Input id="postalCode" autoComplete="postal-code" {...register('postalCode')} />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input id="country" autoComplete="country-name" {...register('country')} />
            </Field>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <p className="mr-auto text-[11px] text-muted">
            {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
