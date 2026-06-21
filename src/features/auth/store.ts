import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ROLES, type Role } from '@/constants/enums'
import type { User } from '@/types/user'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setAuth: (access: string, refresh: string, user: User) => void
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  clear: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (access, refresh, user) =>
        set({ accessToken: access, refreshToken: refresh, user }),
      setUser: (user) => set({ user }),
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      clear: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => Boolean(get().accessToken && get().user),
      isAdmin: () => get().user?.role === (ROLES.ADMIN satisfies Role),
    }),
    {
      name: 'wslny-admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
