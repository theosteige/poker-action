'use client'

import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Union Poker</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Join the poker community</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
