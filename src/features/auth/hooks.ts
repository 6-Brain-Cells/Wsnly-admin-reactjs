import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { authApi } from './api'
import { useAuthStore } from './store'
import type {
  ChangePasswordPayload,
  LoginPayload,
  User,
} from '@/types/user'

export const authKeys = {
  profile: ['auth', 'profile'] as const,
}

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: authApi.getProfile,
    enabled,
    staleTime: 60_000,
  })
}

/**
 * Use an explicit bearer token to fetch the full profile. We do this BEFORE
 * committing anything to the auth store so there's never an intermediate
 * "isAuthenticated=true but role=undefined" window — that window used to
 * trigger the LoginPage's stale-state recovery effect (which wiped the
 * just-stored tokens) and leave us logged in but tokenless. (See plan §6.)
 */
export async function fetchProfileWithToken(token: string): Promise<User> {
  const { data } = await api.get<User>('/api/v1/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

/**
 * Exchange credentials for tokens, fetch the full profile with the new
 * token, then commit both to the store atomically. If any step fails the
 * store stays untouched so the user remains logged out.
 *
 * Exported for unit-testing the atomicity guarantee without needing a
 * React renderer.
 */
export async function performLogin(payload: LoginPayload | { idToken: string }) {
  const auth =
    'email' in payload
      ? await authApi.login(payload as LoginPayload)
      : await authApi.googleLogin((payload as { idToken: string }).idToken)

  const profile = await fetchProfileWithToken(auth.token)
  const user: User = { ...auth.user, ...profile }

  useAuthStore.getState().setAuth(auth.token, auth.refresh_token, user)
  return { auth, user }
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => performLogin(payload),
  })
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: (idToken: string) => performLogin({ idToken }),
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<User>) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      setUser(user)
      qc.setQueryData(authKeys.profile, user)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authApi.changePassword(payload),
  })
}
