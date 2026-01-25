import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-neutral-900 rounded-xl shadow-md dark:shadow-neutral-950/50
        border border-transparent dark:border-neutral-800
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  )
}
