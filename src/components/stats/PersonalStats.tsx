'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui'

interface Stats {
  totalNet: number
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  averageBuyIn: number
}

interface PersonalStatsProps {
  className?: string
}

export function PersonalStats({ className = '' }: PersonalStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/me')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-20 bg-neutral-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-neutral-200 rounded"></div>
            <div className="h-24 bg-neutral-200 rounded"></div>
            <div className="h-24 bg-neutral-200 rounded"></div>
            <div className="h-24 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Personal Statistics
        </h2>
        <div className="text-center py-6">
          <div className="text-red-500 mb-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-600">{error}</p>
        </div>
      </Card>
    )
  }

  if (!stats || stats.gamesPlayed === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Personal Statistics
        </h2>
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
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
          <p className="text-neutral-600 font-medium mb-1">No stats yet</p>
          <p className="text-sm text-neutral-500">
            Complete your first poker game to see your statistics
          </p>
        </div>
      </Card>
    )
  }

  const netColor = stats.totalNet >= 0 ? 'text-green-600' : 'text-red-600'
  const netBgColor = stats.totalNet >= 0 ? 'bg-green-50' : 'bg-red-50'
  const netSign = stats.totalNet >= 0 ? '+' : ''

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        Personal Statistics
      </h2>

      {/* Primary Stat - Total Net */}
      <div className={`rounded-lg ${netBgColor} p-6 mb-6 text-center`}>
        <p className="text-sm text-neutral-600 mb-1">All-Time Net Profit/Loss</p>
        <p className={`text-4xl font-bold ${netColor}`}>
          {netSign}${Math.abs(stats.totalNet).toFixed(2)}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Based on {stats.gamesPlayed} completed game{stats.gamesPlayed !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Games Played */}
        <div className="bg-neutral-50 rounded-lg p-4 text-center">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {stats.gamesPlayed}
          </p>
          <p className="text-sm text-neutral-500">Games Played</p>
        </div>

        {/* Win Rate */}
        <div className="bg-neutral-50 rounded-lg p-4 text-center">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {winRate}%
          </p>
          <p className="text-sm text-neutral-500">Win Rate</p>
        </div>

        {/* Average Buy-In */}
        <div className="bg-neutral-50 rounded-lg p-4 text-center">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            ${stats.averageBuyIn.toFixed(2)}
          </p>
          <p className="text-sm text-neutral-500">Avg Buy-In</p>
        </div>

        {/* Win/Loss Record */}
        <div className="bg-neutral-50 rounded-lg p-4 text-center">
          <div className="text-neutral-400 mb-2">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-green-600">{stats.gamesWon}W</span>
            <span className="text-neutral-400">-</span>
            <span className="text-xl font-bold text-red-600">{stats.gamesLost}L</span>
          </div>
          <p className="text-sm text-neutral-500">Record</p>
        </div>
      </div>

      {/* Breakdown Note */}
      {stats.gamesPlayed > 0 && (
        <p className="text-xs text-neutral-400 text-center mt-4">
          Statistics are calculated from completed games only
        </p>
      )}
    </Card>
  )
}
