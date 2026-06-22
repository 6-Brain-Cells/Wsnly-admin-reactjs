import { useCallback, useEffect, useState } from 'react'

import { config } from '@/config/env'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (typeof window.google !== 'undefined') return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface GoogleCredentialResponse {
  credential: string
}

export function useGoogleIdentity(): {
  ready: boolean
  clientId: string | null
  renderButton: (parent: HTMLElement) => void
} {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!config.isGoogleEnabled) return
    let cancelled = false
    loadGisScript()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Stable callback so consumers can include it in a useEffect dependency
  // array without re-firing on every parent render. The function reads the
  // current `ready` state via closure, which is fine because we only call it
  // from inside the consumer's effect after `ready` becomes true.
  const renderButton = useCallback((parent: HTMLElement) => {
    if (!ready || !config.googleClientId || typeof window === 'undefined') return
    if (!window.google) return
    window.google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: (response: GoogleCredentialResponse) => {
        parent.dispatchEvent(
          new CustomEvent('wslny-google-id-token', {
            detail: response.credential,
            bubbles: true,
          }),
        )
      },
    })
    window.google.accounts.id.renderButton(parent, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: parent.clientWidth,
      text: 'continue_with',
      logo_alignment: 'left',
    })
  }, [ready])

  return {
    ready,
    clientId: config.isGoogleEnabled ? config.googleClientId : null,
    renderButton,
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'small' | 'medium' | 'large'
              width?: number
              text?: string
              logo_alignment?: 'left' | 'center'
            },
          ) => void
          prompt: () => void
        }
      }
    }
  }
}
