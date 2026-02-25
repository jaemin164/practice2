import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (user) => set((s) => ({ user: { ...s.user, ...user } })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'karrot-auth' }
  )
);
