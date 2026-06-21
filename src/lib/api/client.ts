import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { config } from '@/config/env'
import { useAuthStore } from '@/features/auth/store'

interface FailedQueueItem {
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

function processQueue(error: AxiosError | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  failedQueue = []
}

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const status = error.response?.status

    if (status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const refresh = useAuthStore.getState().refreshToken
    if (!refresh) {
      useAuthStore.getState().clear()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(
        `${config.apiBaseUrl}/api/v1/auth/refresh`,
        { refresh },
      )
      const newToken: string = data.token ?? data.access
      useAuthStore.getState().setTokens(newToken, refresh)
      processQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null)
      useAuthStore.getState().clear()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export interface ApiError {
  message: string
  status: number
  code?: string
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string; error?: { message?: string } }
      | undefined
    return {
      message:
        data?.error?.message ??
        data?.message ??
        data?.detail ??
        error.message ??
        'Request failed',
      status: error.response?.status ?? 0,
      code: (data as { code?: string })?.code,
    }
  }
  if (error instanceof Error) {
    return { message: error.message, status: 0 }
  }
  return { message: 'Unknown error', status: 0 }
}
