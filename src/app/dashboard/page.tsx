'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { UpcomingGames, QuickStats } from '@/components/dashboard'

export default function DashboardPage() {
  const { user } = useAuthContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="text-neutral-600">
          Your poker game dashboard
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - Upcoming Games */}
        <div className="lg:col-span-2">
          <UpcomingGames currentUserId={user?.id} />
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="lg:col-span-1">
          <QuickStats />
        </div>
      </div>
    </div>
  )
}
