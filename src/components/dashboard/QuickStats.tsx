'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, ErrorMessage } from '@/components/ui'

interface Stats {
  totalNet: number
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  averageBuyIn: number
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stats/me')
      if (!response.ok) {
        throw new Error('Failed to load stats. Please try again.')
      }
      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-neutral-200 rounded"></div>
            <div className="h-16 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load stats"
        message={error}
        onRetry={fetchStats}
      />
    )
  }

  if (!stats || stats.gamesPlayed === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Your Stats
        </h2>
        <div className="text-center py-4">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-10 h-10 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-600">
            Play your first game to see your stats
          </p>
        </div>
      </Card>
    )
  }

  const netColor = stats.totalNet >= 0 ? 'text-green-600' : 'text-red-600'
  const netSign = stats.totalNet >= 0 ? '+' : ''

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Your Stats
      </h2>

      <div className="space-y-4">
        {/* Net Profit/Loss - Primary stat */}
        <div className="text-center pb-4 border-b border-neutral-100">
          <p className="text-sm text-neutral-500 mb-1">Total Net</p>
          <p className={`text-3xl font-bold ${netColor}`}>
            {netSign}${Math.abs(stats.totalNet).toFixed(2)}
          </p>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-neutral-900">
              {stats.gamesPlayed}
            </p>
            <p className="text-sm text-neutral-500">Games Played</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-neutral-900">
              ${stats.averageBuyIn.toFixed(2)}
            </p>
            <p className="text-sm text-neutral-500">Avg Buy-in</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">
              {stats.gamesWon}
            </p>
            <p className="text-sm text-neutral-500">Wins</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-semibold text-red-600">
              {stats.gamesLost}
            </p>
            <p className="text-sm text-neutral-500">Losses</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
