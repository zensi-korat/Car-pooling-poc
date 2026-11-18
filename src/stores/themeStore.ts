import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// "system" = follow the OS setting (and keep following it if it changes).
export type Theme = 'light' | 'dark' | 'system'

type ThemeStore = {
  theme: Theme // what the user picked
  systemIsDark: boolean // what the OS is set to
  setTheme: (theme: Theme) => void
}

const DARK_QUERY = '(prefers-color-scheme: dark)'

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        systemIsDark: window.matchMedia(DARK_QUERY).matches,
        setTheme: (theme) => set({ theme }, false, 'theme/setTheme'),
      }),
      // Saved in localStorage as {"state":{"theme":"dark"},…}. index.html reads the same key before React loads.
      { name: 'pool-theme', partialize: (state) => ({ theme: state.theme }) },
    ),
    { name: 'theme' },
  ),
)

// What is actually on screen. Derived, not stored: use it as useThemeStore(selectResolvedTheme).
export function selectResolvedTheme(state: ThemeStore): 'light' | 'dark' {
  if (state.theme !== 'system') return state.theme
  return state.systemIsDark ? 'dark' : 'light'
}

// Outside React: follow the OS setting, and keep the "dark" class (read by shadcn's CSS) in sync.
window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
  useThemeStore.setState({ systemIsDark: event.matches }, false, 'theme/systemChanged')
})

function applyTheme(state: ThemeStore) {
  document.documentElement.classList.toggle('dark', selectResolvedTheme(state) === 'dark')
}
applyTheme(useThemeStore.getState())
useThemeStore.subscribe(applyTheme)
