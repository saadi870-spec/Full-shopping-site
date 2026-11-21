import { z } from 'zod';

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Password is too long');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(60),
    email,
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().refine((value) => value === true, {
      message: 'Please confirm you understand this is a demo',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const newsletterSchema = z.object({ email });
export type NewsletterValues = z.infer<typeof newsletterSchema>;

export const checkoutSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name is required'),
    lastName: z.string().trim().min(2, 'Last name is required'),
    email,
    phone: z.string().trim().min(7, 'Enter a contact number'),
    address: z.string().trim().min(5, 'Street address is required'),
    apartment: z.string().trim().optional(),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State or region is required'),
    postalCode: z.string().trim().min(3, 'Postal code is required'),
    country: z.string().trim().min(2, 'Country is required'),
    paymentMethod: z.enum(['card', 'paypal', 'cod']),
    cardName: z.string().trim().optional(),
    cardNumber: z.string().trim().optional(),
    expiry: z.string().trim().optional(),
    cvv: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.paymentMethod !== 'card') return;

    if (!values.cardName || values.cardName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardName'], message: 'Name on card is required' });
    }
    const digits = (values.cardNumber ?? '').replace(/\s/g, '');
    if (!/^\d{15,16}$/.test(digits)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardNumber'], message: 'Enter a valid card number' });
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry ?? '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiry'], message: 'Use MM/YY' });
    }
    if (!/^\d{3,4}$/.test(values.cvv ?? '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cvv'], message: '3 or 4 digits' });
    }
  });
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email,
  phone: z.string().trim().optional(),
  line1: z.string().trim().optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: password,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const adminProductSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  brand: z.string().trim().optional(),
  category: z.string().trim().min(1, 'Choose a category'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountPercentage: z.coerce.number().min(0).max(90).optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  rating: z.coerce.number().min(0).max(5).optional(),
  description: z.string().trim().min(10, 'Add a short description'),
  image: z.string().trim().optional(),
});
export type AdminProductValues = z.infer<typeof adminProductSchema>;
