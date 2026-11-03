import { createContext } from 'react'

// "system" = follow the OS setting (and keep following it if it changes).
export type Theme = 'light' | 'dark' | 'system'

export type ThemeContextValue = {
  theme: Theme // what the user picked
  resolvedTheme: 'light' | 'dark' // what is actually on screen
  setTheme: (theme: Theme) => void
}

// null = "no <ThemeProvider> above you". useTheme() turns that into a clear error.
export const ThemeContext = createContext<ThemeContextValue | null>(null)
