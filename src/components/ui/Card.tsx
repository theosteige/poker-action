import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  )
}
