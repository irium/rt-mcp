import { useAuthStore, type AuthState } from '../store/authStore'

export function useRole() {
  const user = useAuthStore((state: AuthState) => state.user)
  const singleUserMode = useAuthStore((state: AuthState) => state.singleUserMode)

  return {
    isAdmin: user?.role === 'admin' || singleUserMode,
    isUser: user?.role === 'user',
    role: user?.role,
    canDownload: user?.role === 'admin' || singleUserMode,
    canAccessSettings: user?.role === 'admin',
  }
}
