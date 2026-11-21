import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoredUser, User } from '@/types';

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface ProfileInput {
  name: string;
  email: string;
  phone?: string;
  address?: User['address'];
  newsletter?: boolean;
}

interface AuthState {
  users: StoredUser[];
  currentUser: User | null;
  login: (email: string, password: string) => AuthResult;
  register: (input: RegisterInput) => AuthResult;
  logout: () => void;
  updateProfile: (input: ProfileInput) => AuthResult;
  changePassword: (currentPassword: string, nextPassword: string) => AuthResult;
}

const DEMO_USERS: StoredUser[] = [
  {
    id: 'u-admin',
    name: 'Amara Okafor',
    email: 'admin@shopsphere.dev',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (415) 555-0142',
    createdAt: '2023-02-11T09:00:00.000Z',
    address: {
      line1: '18 Fillmore Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94117',
      country: 'United States',
    },
  },
  {
    id: 'u-demo',
    name: 'Jordan Ellis',
    email: 'demo@shopsphere.dev',
    password: 'demo1234',
    role: 'customer',
    phone: '+1 (212) 555-0178',
    createdAt: '2024-05-03T09:00:00.000Z',
    newsletter: true,
    address: {
      line1: '74 Bedford Avenue',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11211',
      country: 'United States',
    },
  },
];

/**
 * Mock authentication. Credentials live in localStorage, so this demonstrates
 * application flows and protected routing only — it is NOT real security.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: DEMO_USERS,
      currentUser: null,

      login: (email, password) => {
        const normalised = email.trim().toLowerCase();
        const user = get().users.find((candidate) => candidate.email.toLowerCase() === normalised);
        if (!user || user.password !== password) {
          return { ok: false, error: 'Incorrect email or password.' };
        }
        const { password: _password, ...currentUser } = user;
        set({ currentUser });
        return { ok: true, user: currentUser };
      },

      register: ({ name, email, password }) => {
        const normalised = email.trim().toLowerCase();
        if (get().users.some((user) => user.email.toLowerCase() === normalised)) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const stored: StoredUser = {
          id: `u-${Date.now().toString(36)}`,
          name: name.trim(),
          email: normalised,
          password,
          role: 'customer',
          createdAt: new Date().toISOString(),
          newsletter: true,
        };
        const { password: _password, ...currentUser } = stored;
        set((state) => ({ users: [...state.users, stored], currentUser }));
        return { ok: true, user: currentUser };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: ({ name, email, phone, address, newsletter }) => {
        const current = get().currentUser;
        if (!current) return { ok: false, error: 'You are not signed in.' };
        const normalised = email.trim().toLowerCase();
        const taken = get().users.some(
          (user) => user.email.toLowerCase() === normalised && user.id !== current.id,
        );
        if (taken) return { ok: false, error: 'That email is already in use.' };

        const updated: User = { ...current, name, email: normalised, phone, address, newsletter };
        set((state) => ({
          currentUser: updated,
          users: state.users.map((user) =>
            user.id === current.id ? { ...user, ...updated } : user,
          ),
        }));
        return { ok: true, user: updated };
      },

      changePassword: (currentPassword, nextPassword) => {
        const current = get().currentUser;
        if (!current) return { ok: false, error: 'You are not signed in.' };
        const stored = get().users.find((user) => user.id === current.id);
        if (!stored || stored.password !== currentPassword) {
          return { ok: false, error: 'Your current password is incorrect.' };
        }
        set((state) => ({
          users: state.users.map((user) =>
            user.id === current.id ? { ...user, password: nextPassword } : user,
          ),
        }));
        return { ok: true };
      },
    }),
    {
      name: 'shopsphere-auth',
      version: 1,
    },
  ),
);

export const DEMO_CREDENTIALS = {
  customer: { email: 'demo@shopsphere.dev', password: 'demo1234' },
  admin: { email: 'admin@shopsphere.dev', password: 'admin123' },
};
