'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameHistoryCard } from './GameHistoryCard'
import { Button, Card } from '@/components/ui'

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
  playerCount: number
  userNet: number
  isHost: boolean
}

interface Pagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

type LoadingState = 'loading' | 'loaded' | 'error'

export function GameHistoryList() {
  const [games, setGames] = useState<Game[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [state, setState] = useState<LoadingState>('loading')
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (page: number = 1) => {
    try {
      setState('loading')
      const response = await fetch(`/api/games/history?page=${page}&pageSize=10`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch game history')
      }

      const data = await response.json()
      setGames(data.games)
      setPagination(data.pagination)
      setState('loaded')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game history')
      setState('error')
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handlePageChange = (newPage: number) => {
    fetchHistory(newPage)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-4 w-28 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Failed to Load History
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
        <Button onClick={() => fetchHistory()}>Try Again</Button>
      </Card>
    )
  }

  // Empty state
  if (games.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No Game History Yet
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your completed games will appear here. Play some games to build your history!
        </p>
      </Card>
    )
  }

  return (
    <div>
      {/* Summary stats */}
      {pagination && (
        <div className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          Showing {games.length} of {pagination.totalCount} completed game
          {pagination.totalCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Game list */}
      <div className="space-y-4">
        {games.map((game) => (
          <GameHistoryCard key={game.id} game={game} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                const current = pagination.page
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - current) <= 1
                )
              })
              .map((page, index, filtered) => {
                // Add ellipsis where needed
                const showEllipsisBefore =
                  index > 0 && filtered[index - 1] !== page - 1
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsisBefore && (
                      <span className="px-2 text-neutral-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[36px] h-9 rounded-md text-sm font-medium transition-colors ${
                        page === pagination.page
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasMore}
          >
            Next
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
