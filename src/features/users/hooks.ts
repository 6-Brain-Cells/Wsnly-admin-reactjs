import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { usersApi, type ListUsersParams } from './api'
import { userKeys } from './keys'
import type { UserUpdatePayload } from '@/types/user'

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
  })
}

export function useUser(id: number | string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: Boolean(id),
  })
}

export function useUpdateUser(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserUpdatePayload) => usersApi.update(id, payload),
    onSuccess: (user) => {
      qc.setQueryData(userKeys.detail(id), (old: unknown) => ({
        ...(old as object),
        ...user,
      }))
      qc.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => usersApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useChangeRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: number; newRole: string }) =>
      usersApi.changeRole(userId, newRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
