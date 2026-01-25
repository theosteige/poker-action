'use client'

import { format } from 'date-fns'
import { Card, Button } from '@/components/ui'

interface GameBrowserCardProps {
  game: {
    id: string
    scheduledTime: string | Date
    location: string
    bigBlindAmount: string | number
    host: {
      id: string
      displayName: string
    }
    playerCount: number
    isHost: boolean
    isPlayer: boolean
    joinRequestStatus: 'pending' | 'approved' | 'denied' | null
  }
  onRequestJoin?: (gameId: string) => void
  isRequesting?: boolean
}

export function GameBrowserCard({
  game,
  onRequestJoin,
  isRequesting,
}: GameBrowserCardProps) {
  const scheduledDate = new Date(game.scheduledTime)

  // Determine the user's status with this game
  const getStatusBadge = () => {
    if (game.isHost) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Your Game
        </span>
      )
    }
    if (game.isPlayer) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Joined
        </span>
      )
    }
    if (game.joinRequestStatus === 'pending') {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Pending
        </span>
      )
    }
    if (game.joinRequestStatus === 'denied') {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Denied
        </span>
      )
    }
    return null
  }

  // Determine if the user can request to join
  const canRequestJoin =
    !game.isHost && !game.isPlayer && game.joinRequestStatus !== 'pending'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {game.location}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Hosted by {game.host.displayName}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-tabular">{format(scheduledDate, 'MMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-tabular">{format(scheduledDate, 'h:mm a')}</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-tabular">${Number(game.bigBlindAmount).toFixed(2)} BB</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-tabular">
            {game.playerCount} player{game.playerCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Action button */}
      {canRequestJoin && onRequestJoin && (
        <Button
          onClick={() => onRequestJoin(game.id)}
          disabled={isRequesting}
          className="w-full"
          size="sm"
        >
          {isRequesting ? 'Requesting...' : 'Request to Join'}
        </Button>
      )}

      {(game.isHost || game.isPlayer) && (
        <Button
          onClick={() => (window.location.href = `/games/${game.id}`)}
          variant="secondary"
          className="w-full"
          size="sm"
        >
          View Game
        </Button>
      )}

      {game.joinRequestStatus === 'pending' && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
          Waiting for host approval
        </p>
      )}

      {game.joinRequestStatus === 'denied' && (
        <Button
          onClick={() => onRequestJoin?.(game.id)}
          disabled={isRequesting}
          variant="secondary"
          className="w-full"
          size="sm"
        >
          {isRequesting ? 'Requesting...' : 'Request Again'}
        </Button>
      )}
    </Card>
  )
}
