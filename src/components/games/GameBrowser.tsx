'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameBrowserCard } from './GameBrowserCard'
import { Spinner, ErrorMessage } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface BrowseGame {
  id: string
  scheduledTime: string
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

type SortOption = 'date' | 'host'

export function GameBrowser() {
  const [games, setGames] = useState<BrowseGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [hostFilter, setHostFilter] = useState('')
  const [requestingGameId, setRequestingGameId] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('sortBy', sortBy)
      if (hostFilter.trim()) {
        params.set('host', hostFilter.trim())
      }

      const response = await fetch(`/api/games/upcoming?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch games')
      }

      setGames(data.games)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load games'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, hostFilter])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  const handleRequestJoin = async (gameId: string) => {
    try {
      setRequestingGameId(gameId)

      const response = await fetch(`/api/games/${gameId}/join-requests`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request to join')
      }

      addToast('success', 'Join request sent! Waiting for host approval.')

      // Refresh the games list to update the status
      await fetchGames()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request to join'
      addToast('error', message)
    } finally {
      setRequestingGameId(null)
    }
  }

  // Filter out games where user is already a player (show only browsable games)
  const browsableGames = games.filter((game) => !game.isPlayer || game.isHost)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading games"
        message={error}
        onRetry={fetchGames}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="hostFilter"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Filter by host
          </label>
          <input
            type="text"
            id="hostFilter"
            value={hostFilter}
            onChange={(e) => setHostFilter(e.target.value)}
            placeholder="Search by host name..."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
          />
        </div>
        <div className="sm:w-48">
          <label
            htmlFor="sortBy"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Sort by
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
          >
            <option value="date">Date (soonest first)</option>
            <option value="host">Host name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Games list */}
      {browsableGames.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <svg
            className="w-12 h-12 mx-auto text-neutral-400 mb-4"
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
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No upcoming games
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {hostFilter
              ? 'No games found matching your filter.'
              : 'There are no upcoming games available right now.'}
          </p>
          {hostFilter && (
            <button
              onClick={() => setHostFilter('')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {browsableGames.map((game) => (
            <GameBrowserCard
              key={game.id}
              game={game}
              onRequestJoin={handleRequestJoin}
              isRequesting={requestingGameId === game.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
