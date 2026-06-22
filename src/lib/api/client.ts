import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { config } from '@/config/env'
import { useAuthStore } from '@/features/auth/store'
import { isAdminEndpoint } from './admin-allowlist'

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

// Attach the JWT to every outbound request.
// Uses AxiosHeaders.set() rather than direct property assignment, which
// is the canonical axios v1 way and avoids cases where an interceptor
// runs before AxiosHeaders has fully initialised the proxy.
api.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    requestConfig.headers.set('Authorization', `Bearer ${token}`)
  }
  return requestConfig
})

/**
 * Dev-only guard: the admin dashboard MUST NOT call end-user endpoints
 * owned by the Flutter mobile client. See `.speckit/plan.md` §0.2 and risk R11.
 *
 * We run this as a request interceptor (NOT an adapter wrapper) because
 * axios's `dispatchRequest` resolves the adapter internally and does not
 * reliably honour `instance.defaults.adapter` for all request shapes —
 * using the interceptor runs reliably and rejects the promise cleanly,
 * which `toApiError` then surfaces as a regular API error in `onError`.
 */
if (import.meta.env.DEV) {
  api.interceptors.request.use((requestConfig) => {
    const url = requestConfig.url ?? ''
    if (!isAdminEndpoint(url)) {
      const message = `[admin-allowlist] Forbidden endpoint for admin dashboard: ${url}`
      if (import.meta.env.DEV) {
        console.error(message)
      }
      return Promise.reject(new Error(message))
    }
    return requestConfig
  })
}

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
    // Non-Axios errors (network failures, our interceptor guards, etc.)
    // should still surface as a usable message rather than a stack trace.
    return { message: error.message, status: 0 }
  }
  return { message: 'Unknown error', status: 0 }
}
