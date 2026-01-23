'use client'

import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Poker Hub</h1>
          <p className="text-gray-600 mt-2">Join the poker community</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
