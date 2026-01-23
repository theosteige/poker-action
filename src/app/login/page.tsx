'use client'

import { LoginForm } from '@/components/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Poker Hub</h1>
          <p className="text-gray-600 mt-2">Manage your poker games with ease</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
