import { useAuthStore, type AuthState } from '../store/authStore'

export function useRole() {
  const user = useAuthStore((state: AuthState) => state.user)
  const allowAnonymous = useAuthStore((state: AuthState) => state.allowAnonymous)

  return {
    isAdmin: user?.role === 'admin' || allowAnonymous,
    isUser: user?.role === 'user',
    role: user?.role,
    canDownload: user?.role === 'admin' || allowAnonymous,
    canAccessSettings: user?.role === 'admin',
  }
}
