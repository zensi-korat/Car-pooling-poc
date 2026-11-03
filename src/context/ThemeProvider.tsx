import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'

const STORAGE_KEY = 'theme'
const darkQuery = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    // Private mode / blocked storage: fall through to the default.
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: the function runs once on the first render, not on every render.
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(darkQuery).matches)

  // Derived value: computed during render, NOT stored in state (it would just go out of sync).
  const resolvedTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme

  // Effect 1: keep listening to the OS setting. Cleanup removes the listener on unmount.
  useEffect(() => {
    const media = window.matchMedia(darkQuery)
    const onChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Effect 2: sync React state → the DOM (outside React). shadcn's CSS reads the "dark" class.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  // useCallback: the same function on every render (needed for the useMemo below).
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not saved, but the theme still changes for this visit.
    }
  }, [])

  // useMemo: the same object until a value changes, so useTheme() users don't re-render for nothing.
  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
