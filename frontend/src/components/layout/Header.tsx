import { Tv } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../../utils/cn'

interface HeaderProps {
  isConnected?: boolean
}

/**
 * Header component with title, status indicator, and theme toggle
 */
export function Header({ isConnected = true }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Tv className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                RuTracker Search
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and download torrents
              </p>
            </div>
          </div>

          {/* Status and Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                )}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
