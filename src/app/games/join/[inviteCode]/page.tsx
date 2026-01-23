'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, Button } from '@/components/ui'

interface GameInfo {
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
}

interface GameData {
  game: GameInfo
  alreadyJoined: boolean
  isHost: boolean
}

type PageState = 'loading' | 'error' | 'game_found' | 'not_found' | 'completed' | 'joining' | 'joined'

export default function JoinGamePage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string

  const [state, setState] = useState<PageState>('loading')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchGameInfo = useCallback(async () => {
    setState('loading')
    setError(null)

    try {
      const response = await fetch(`/api/games/join/${inviteCode}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setState('not_found')
        } else if (response.status === 401) {
          // Not authenticated - redirect to login with return URL
          router.push(`/login?returnUrl=/games/join/${inviteCode}`)
        } else {
          setError(data.error || 'Failed to load game')
          setState('error')
        }
        return
      }

      setGameData(data)

      // If already joined or is host, show appropriate state
      if (data.alreadyJoined || data.isHost) {
        setState('joined')
      } else if (data.game.status === 'completed') {
        setState('completed')
      } else {
        setState('game_found')
      }
    } catch {
      setError('An unexpected error occurred')
      setState('error')
    }
  }, [inviteCode, router])

  useEffect(() => {
    if (!inviteCode) {
      setState('not_found')
      return
    }

    fetchGameInfo()
  }, [inviteCode, fetchGameInfo])

  const handleJoinGame = async () => {
    setState('joining')
    setError(null)

    try {
      const response = await fetch(`/api/games/join/${inviteCode}`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join game')
        setState('game_found')
        return
      }

      // Successfully joined - redirect to game room
      router.push(`/games/${data.gameId}`)
    } catch {
      setError('An unexpected error occurred')
      setState('game_found')
    }
  }

  const handleGoToGame = () => {
    if (gameData?.game.id) {
      router.push(`/games/${gameData.game.id}`)
    }
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
          <p className="text-gray-600 mt-4">Loading game details...</p>
        </Card>
      </div>
    )
  }

  // Not found state
  if (state === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-6">
            This invite link is invalid or the game no longer exists.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={fetchGameInfo} className="w-full">
              Try Again
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Completed game state
  if (state === 'completed' && gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Completed</h1>
          <p className="text-gray-600 mb-6">
            This poker game has already ended and cannot accept new players.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Already joined state
  if (state === 'joined' && gameData) {
    const { game, isHost } = gameData
    const gameDate = new Date(game.scheduledTime)

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isHost ? "You're the Host!" : "You're In!"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isHost
                ? 'You created this game.'
                : 'You have already joined this game.'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">
                {format(gameDate, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">
                {format(gameDate, 'h:mm a')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium text-gray-900">{game.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Big Blind</span>
              <span className="font-medium text-gray-900">${game.bigBlindAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Host</span>
              <span className="font-medium text-gray-900">{game.host.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players</span>
              <span className="font-medium text-gray-900">{game.playerCount}</span>
            </div>
          </div>

          <Button onClick={handleGoToGame} className="w-full" size="lg">
            Go to Game Room
          </Button>
        </Card>
      </div>
    )
  }

  // Game found - ready to join
  if ((state === 'game_found' || state === 'joining') && gameData) {
    const { game } = gameData
    const gameDate = new Date(game.scheduledTime)

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join Game</h1>
            <p className="text-gray-600 mt-1">
              You&apos;ve been invited to a poker game
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">
                {format(gameDate, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">
                {format(gameDate, 'h:mm a')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium text-gray-900">{game.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Big Blind</span>
              <span className="font-medium text-gray-900">${game.bigBlindAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hosted by</span>
              <span className="font-medium text-gray-900">{game.host.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players joined</span>
              <span className="font-medium text-gray-900">{game.playerCount}</span>
            </div>
          </div>

          <Button
            onClick={handleJoinGame}
            isLoading={state === 'joining'}
            className="w-full"
            size="lg"
          >
            Join Game
          </Button>
        </Card>
      </div>
    )
  }

  return null
}
