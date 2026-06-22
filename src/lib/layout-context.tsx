import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface LayoutContextValue {
  title: string | null
  setTitle: (title: string | null) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitleState] = useState<string | null>(null)

  const setTitle = useCallback((next: string | null) => {
    setTitleState((prev) => (prev === next ? prev : next))
  }, [])

  const value = useMemo(() => ({ title, setTitle }), [title, setTitle])
  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export function useLayoutTitle() {
  const ctx = useContext(LayoutContext)
  if (!ctx) {
    throw new Error('useLayoutTitle must be used inside <LayoutProvider>')
  }
  return ctx
}

/**
 * Pages call this to register their title in the topbar. Setting `null`
 * clears the title (used on dynamic pages where the title comes from params).
 * The setter is referentially stable so this hook is safe to call on every
 * render; the actual `setState` only fires when the title changes.
 */
export function useSetLayoutTitle(title: string | null) {
  const { setTitle } = useLayoutTitle()
  useEffect(() => {
    setTitle(title)
  }, [title, setTitle])
}
