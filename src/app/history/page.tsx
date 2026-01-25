'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { GameHistoryList } from '@/components/history'

export default function HistoryPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthContext()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?returnUrl=/history')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Game History</h1>
          <p className="mt-1 text-neutral-600">
            View your completed poker games and results
          </p>
        </div>

        {/* Game history list */}
        <GameHistoryList />
      </div>
    </div>
  )
}
