import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-neutral-900
        rounded-lg
        shadow-sm
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  )
}
