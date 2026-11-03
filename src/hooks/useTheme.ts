import { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

// A custom hook: components call useTheme() instead of useContext(ThemeContext),
// and forgetting the provider fails loudly instead of returning null.
export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
