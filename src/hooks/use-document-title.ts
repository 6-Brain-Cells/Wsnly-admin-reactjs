import { useEffect } from 'react'

import { config } from '@/config/env'

/**
 * Sets `document.title` to `<title> · <appName>` and restores the previous
 * title on unmount. Accepts an optional suffix used by dynamic pages.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const prev = document.title
    const base = config.appName
    document.title = title ? `${title} · ${base}` : base
    return () => {
      document.title = prev
    }
  }, [title])
}
