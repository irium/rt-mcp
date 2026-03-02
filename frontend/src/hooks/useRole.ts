import { useAuthStore, type AuthState } from '../store/authStore'

export function useRole() {
  const user = useAuthStore((state: AuthState) => state.user)

  return {
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    role: user?.role,
    canDownload: user?.role === 'admin',
    canAccessSettings: user?.role === 'admin',
  }
}
