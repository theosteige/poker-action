'use client'

import { useEffect, useState } from 'react'
import { WinnersBoard, LosersBoard } from '@/components/leaderboard'
import { Card } from '@/components/ui'

interface LeaderboardEntry {
  userId: string
  displayName: string
  totalNet: number
  gamesPlayed: number
}

interface LeaderboardData {
  winners: LeaderboardEntry[]
  losers: LeaderboardEntry[]
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        const data = await response.json()
        setLeaderboard(data.leaderboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Leaderboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-20 bg-neutral-200 rounded"></div>
                <div className="h-20 bg-neutral-200 rounded"></div>
                <div className="h-20 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-20 bg-neutral-200 rounded"></div>
                <div className="h-20 bg-neutral-200 rounded"></div>
                <div className="h-20 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Leaderboard</h1>
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 mb-3">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium mb-1">Failed to load leaderboard</p>
            <p className="text-sm text-neutral-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const hasAnyData = leaderboard && (leaderboard.winners.length > 0 || leaderboard.losers.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Leaderboard</h1>
        <p className="text-neutral-600 mt-1">
          All-time poker standings from completed games
        </p>
      </div>

      {!hasAnyData ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-neutral-300 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
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
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              No Completed Games Yet
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              The leaderboard shows all-time poker standings from completed games.
              Once players finish some games, the top winners and losers will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <WinnersBoard winners={leaderboard?.winners || []} />
          <LosersBoard losers={leaderboard?.losers || []} />
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center mt-8">
        Statistics are calculated from completed games only. Rankings update when games are marked complete.
      </p>
    </div>
  )
}
