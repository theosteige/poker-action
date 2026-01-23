'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, Button, ErrorMessage } from '@/components/ui'
import { GameCard } from './GameCard'

interface Game {
  id: string
  scheduledTime: string
  location: string
  bigBlindAmount: string
  status: string
  host: {
    id: string
    displayName: string
  }
  players?: { playerId: string }[]
}

interface UpcomingGamesProps {
  currentUserId?: string
}

export function UpcomingGames({ currentUserId }: UpcomingGamesProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/games')
      if (!response.ok) {
        throw new Error('Failed to load games. Please try again.')
      }
      const data = await response.json()
      // Filter to only upcoming games and sort by scheduled time
      const upcomingGames = (data.games || [])
        .filter((game: Game) => game.status === 'upcoming' || game.status === 'active')
        .sort((a: Game, b: Game) =>
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        )
      setGames(upcomingGames)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load games"
        message={error}
        onRetry={fetchGames}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Upcoming Games
        </h2>
        <Link href="/games/new">
          <Button size="sm">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Game
          </Button>
        </Link>
      </div>

      {games.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-neutral-400 mb-4">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-neutral-600 mb-4">
            No upcoming games. Create one to get started!
          </p>
          <Link href="/games/new">
            <Button>Create Your First Game</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              playerCount={game.players?.length}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
