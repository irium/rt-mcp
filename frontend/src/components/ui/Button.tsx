import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  className,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        'rounded-lg font-medium',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
