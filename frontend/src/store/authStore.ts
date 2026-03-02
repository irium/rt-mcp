import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  username: string
  role: 'admin' | 'user'
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  allowAnonymous: boolean

  // Actions
  setAuth: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
  checkAnonymousMode: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
}

// Use persist middleware to save token to localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      allowAnonymous: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => set({ token: null, user: null, isAuthenticated: false }),

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const user = await response.json()
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ token: null, user: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false })
        }
      },

      checkAnonymousMode: async () => {
        try {
          const response = await fetch('/api/auth/config')
          const { allowAnonymous } = await response.json()
          set({ allowAnonymous })
        } catch {
          set({ allowAnonymous: false })
        }
      },

      login: async (username, password) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Login failed')
        }

        const { access_token, user } = await response.json()
        set({ token: access_token, user, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
)
