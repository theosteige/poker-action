'use client'

import { Card } from '@/components/ui'

interface LeaderboardEntry {
  userId: string
  displayName: string
  totalNet: number
  gamesPlayed: number
}

interface LosersBoardProps {
  losers: LeaderboardEntry[]
  className?: string
}

function getRankStyle(rank: number): { bg: string; border: string } {
  switch (rank) {
    case 1:
      return { bg: 'bg-red-50', border: 'border-red-200' }
    case 2:
      return { bg: 'bg-red-50/70', border: 'border-red-200/70' }
    case 3:
      return { bg: 'bg-red-50/50', border: 'border-red-200/50' }
    default:
      return { bg: 'bg-neutral-50', border: 'border-neutral-200' }
  }
}

export function LosersBoard({ losers, className = '' }: LosersBoardProps) {
  if (losers.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📉</span>
          <h2 className="text-lg font-semibold text-neutral-900">Top Losers</h2>
        </div>
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-neutral-600 font-medium mb-1">No data yet</p>
          <p className="text-sm text-neutral-500">
            Complete some games to see the leaderboard
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📉</span>
        <h2 className="text-lg font-semibold text-neutral-900">Top Losers</h2>
      </div>

      <div className="space-y-3">
        {losers.map((loser, index) => {
          const rank = index + 1
          const style = getRankStyle(rank)

          return (
            <div
              key={loser.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border ${style.border} ${style.bg}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">#{rank}</span>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800 truncate">
                  {loser.displayName}
                </p>
                <p className="text-sm text-neutral-500">
                  {loser.gamesPlayed} game{loser.gamesPlayed !== 1 ? 's' : ''} played
                </p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-bold text-red-600">
                  -${Math.abs(loser.totalNet).toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500">loss</p>
              </div>
            </div>
          )
        })}
      </div>

      {losers.length < 3 && (
        <p className="text-xs text-neutral-400 text-center mt-4">
          {3 - losers.length} more player{losers.length === 2 ? '' : 's'} needed for full leaderboard
        </p>
      )}
    </Card>
  )
}
