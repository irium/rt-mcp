import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { cn } from '../../utils/cn'

/**
 * Theme toggle button component
 * Switches between light and dark themes
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-colors duration-200',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'focus:outline-none'
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  )
}
