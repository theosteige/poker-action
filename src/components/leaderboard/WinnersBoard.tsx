'use client'

import { Card } from '@/components/ui'

interface LeaderboardEntry {
  userId: string
  displayName: string
  totalNet: number
  gamesPlayed: number
}

interface WinnersBoardProps {
  winners: LeaderboardEntry[]
  className?: string
}

function getRankBadge(rank: number): { bg: string; text: string; border: string } {
  switch (rank) {
    case 1:
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' }
    case 2:
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600' }
    case 3:
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' }
    default:
      return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-700 dark:text-neutral-300', border: 'border-neutral-300 dark:border-neutral-600' }
  }
}

function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return `#${rank}`
  }
}

export function WinnersBoard({ winners, className = '' }: WinnersBoardProps) {
  if (winners.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Top Winners</h2>
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
          <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-1">No winners yet</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Complete some games to see the leaderboard
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🏆</span>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Top Winners</h2>
      </div>

      <div className="space-y-3">
        {winners.map((winner, index) => {
          const rank = index + 1
          const badge = getRankBadge(rank)
          const icon = getRankIcon(rank)

          return (
            <div
              key={winner.userId}
              className={`flex items-center gap-4 p-4 rounded-lg border ${badge.border} ${badge.bg}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-2xl">
                {icon}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${badge.text}`}>
                  {winner.displayName}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {winner.gamesPlayed} game{winner.gamesPlayed !== 1 ? 's' : ''} played
                </p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  +${winner.totalNet.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">profit</p>
              </div>
            </div>
          )
        })}
      </div>

      {winners.length < 3 && (
        <p className="text-xs text-neutral-400 text-center mt-4">
          {3 - winners.length} more player{winners.length === 2 ? '' : 's'} needed for full leaderboard
        </p>
      )}
    </Card>
  )
}
