import React from 'react'
import { useRole } from '../../hooks/useRole'

interface RoleGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

/**
 * A component that conditionally renders children based on user role.
 * Used to hide UI elements that the user doesn't have permission to access.
 *
 * Note: This is for UI purposes only. Backend must enforce permissions.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requireAdmin = false,
  fallback = null,
}) => {
  const { isAdmin } = useRole()

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
