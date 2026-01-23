'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { Card } from '@/components/ui'

export default function DashboardPage() {
  const { user } = useAuthContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your poker game dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Upcoming Games
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No upcoming games. Create one to get started!
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Quick Stats
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Play your first game to see your stats.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Activity
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No recent activity to show.
          </p>
        </Card>
      </div>
    </div>
  )
}
