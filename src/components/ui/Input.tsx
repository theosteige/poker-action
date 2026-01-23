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
            className="block text-sm font-medium text-gray-700 mb-1"
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
            text-base sm:text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            min-h-[44px]
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
