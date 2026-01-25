'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, type = 'text', ...props }, ref) => {
    const inputId = id || props.name

    // Determine appropriate inputMode based on type for better mobile keyboards
    const getInputMode = () => {
      switch (type) {
        case 'email':
          return 'email'
        case 'tel':
          return 'tel'
        case 'url':
          return 'url'
        case 'number':
          return 'decimal'
        case 'search':
          return 'search'
        default:
          return undefined
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          inputMode={getInputMode()}
          autoComplete={props.autoComplete || 'off'}
          className={`
            w-full px-3 py-2.5
            border rounded-lg
            bg-white dark:bg-neutral-800
            text-base sm:text-sm text-neutral-900 dark:text-neutral-100
            placeholder-neutral-400 dark:placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent
            disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed
            min-h-[44px]
            ${error ? 'border-red-500 dark:border-red-400' : 'border-neutral-300 dark:border-neutral-600'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
