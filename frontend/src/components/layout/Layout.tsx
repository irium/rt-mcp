import type { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  isConnected?: boolean
}

/**
 * Main layout component
 * Wraps the entire application with header and content area
 */
export function Layout({ children, isConnected }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header isConnected={isConnected} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
