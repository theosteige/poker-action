'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card } from '@/components/ui'

interface GameCardProps {
  game: {
    id: string
    scheduledTime: string | Date
    location: string
    bigBlindAmount: string | number
    status: string
    host: {
      id: string
      displayName: string
    }
  }
  playerCount?: number
  currentUserId?: string
}

export function GameCard({ game, playerCount, currentUserId }: GameCardProps) {
  const scheduledDate = new Date(game.scheduledTime)
  const isHost = currentUserId === game.host.id

  const statusColors = {
    upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    completed: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  }

  const statusLabels = {
    upcoming: 'Upcoming',
    active: 'In Progress',
    completed: 'Completed',
  }

  return (
    <Link href={`/games/${game.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {game.location}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Hosted by {isHost ? 'you' : game.host.displayName}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[game.status as keyof typeof statusColors] || statusColors.upcoming
            }`}
          >
            {statusLabels[game.status as keyof typeof statusLabels] || game.status}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-4 h-4"
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
            <span>{format(scheduledDate, 'MMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-4 h-4"
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
            <span>{format(scheduledDate, 'h:mm a')}</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <svg
              className="w-4 h-4"
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
            <span>${Number(game.bigBlindAmount).toFixed(2)} BB</span>
          </div>

          {playerCount !== undefined && (
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <svg
                className="w-4 h-4"
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
              <span>{playerCount} player{playerCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
