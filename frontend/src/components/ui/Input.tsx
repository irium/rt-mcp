import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelAlign?: 'left' | 'center' | 'right'
}

export function Input({
  label,
  name,
  className,
  labelAlign,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-medium text-gray-700 dark:text-gray-300",
            labelAlign === 'left' && 'text-left',
            labelAlign === 'center' && 'text-center',
            labelAlign === 'right' && 'text-right'
          )}
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        className={cn(
          'px-3 py-2 rounded-lg border',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
          'transition-colors duration-200',
          className
        )}
        {...props}
      />
    </div>
  )
}
