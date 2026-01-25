'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card } from '@/components/ui'

interface GameHistoryCardProps {
  game: {
    id: string
    scheduledTime: string
    location: string
    bigBlindAmount: string
    status: string
    host: {
      id: string
      displayName: string
    }
    playerCount: number
    userNet: number
    isHost: boolean
  }
}

export function GameHistoryCard({ game }: GameHistoryCardProps) {
  const scheduledDate = new Date(game.scheduledTime)
  const isPositive = game.userNet > 0
  const isNegative = game.userNet < 0

  return (
    <Link href={`/games/${game.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{game.location}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Hosted by {game.isHost ? 'you' : game.host.displayName}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              isPositive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : isNegative
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {isPositive && '+'}
            ${Math.abs(game.userNet).toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
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
            <span>{format(scheduledDate, 'MMM d, yyyy')}</span>
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
            <span>{format(scheduledDate, 'h:mm a')}</span>
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
            <span>${Number(game.bigBlindAmount).toFixed(2)} BB</span>
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
            <span>{game.playerCount} player{game.playerCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
