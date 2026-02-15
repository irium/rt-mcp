import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

/**
 * Theme store using Zustand
 * Persists theme preference to localStorage
 * Supports system preference detection
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      initializeTheme: () => {
        const stored = localStorage.getItem('theme-storage')
        let theme: Theme = 'light'

        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            theme = parsed.state?.theme || 'light'
          } catch {
            // If parsing fails, check system preference
            theme = getSystemTheme()
          }
        } else {
          // No stored preference, use system preference
          theme = getSystemTheme()
        }

        set({ theme })
        // Only apply if not already applied (by inline script in index.html)
        const root = document.documentElement
        const isDarkApplied = root.classList.contains('dark')
        const shouldBeDark = theme === 'dark'
        
        if (isDarkApplied !== shouldBeDark) {
          applyTheme(theme)
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)

/**
 * Get system theme preference
 */
function getSystemTheme(): Theme {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Listen for system theme changes
 */
if (window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const stored = localStorage.getItem('theme-storage')
      // Only auto-switch if user hasn't set a preference
      if (!stored) {
        const theme = e.matches ? 'dark' : 'light'
        useThemeStore.getState().setTheme(theme)
      }
    })
}
