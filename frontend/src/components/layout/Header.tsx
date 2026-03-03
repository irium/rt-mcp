import { Tv, LogOut, User } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/cn'

interface HeaderProps {
  isConnected?: boolean
}

/**
 * Header component with title, status indicator, theme toggle, and user info
 */
export function Header({ isConnected = true }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <Tv className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                RuTracker Search
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Find and download torrents
              </p>
            </div>
          </div>

          {/* Status, User Info, and Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            {/* Connection Status - compact on mobile */}
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              title={isConnected ? 'Connected' : 'Disconnected'}
              aria-label={isConnected ? 'Connected' : 'Disconnected'}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  isConnected
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                )}
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* User Info and Logout */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-[80px] sm:max-w-none truncate">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  title="Logout"
                  className={cn(
                    'p-1.5 sm:p-2 rounded-lg transition-colors duration-200',
                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                    'focus:outline-none'
                  )}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="[&_button]:p-1.5 sm:[&_button]:p-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
