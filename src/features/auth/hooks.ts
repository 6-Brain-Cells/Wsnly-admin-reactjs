import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.token, data.refresh_token, data.user)
    },
  })
}

export function useGoogleLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: (data) => {
      setAuth(data.token, data.refresh_token, data.user)
    },
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
