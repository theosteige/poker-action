'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button, Card, ConfirmDialog } from '@/components/ui'
import { GameInfo, EditGameForm, PlayerList, Ledger, RequestBuyInForm, BankControls, PlayerBuyInStatus } from '@/components/game'
import { type PaymentHandle, type Debt, type PlayerSettlement } from '@/lib/settlement'

interface GameData {
  game: {
    id: string
    scheduledTime: string
    location: string
    bigBlindAmount: string
    status: 'upcoming' | 'active' | 'completed'
    inviteCode: string
    createdAt: string
    host: {
      id: string
      displayName: string
      paymentHandles: PaymentHandle[]
    }
  }
  players: {
    id: string
    displayName: string
    paymentHandles: PaymentHandle[]
    joinedAt: string
    isHost: boolean
  }[]
  buyIns: {
    id: string
    playerId: string
    playerDisplayName: string
    amount: string
    paidToBank: boolean
    requestedByPlayer: boolean
    approved: boolean
    timestamp: string
  }[]
  cashOuts: {
    playerId: string
    playerDisplayName: string
    amount: string
    timestamp: string
  }[]
  settlement: {
    players: PlayerSettlement[]
    debts: Debt[]
    isComplete: boolean
    totalInPlay: number
  }
  currentUser: {
    id: string
    isHost: boolean
    isPlayer: boolean
  }
}

type PageState = 'loading' | 'loaded' | 'error' | 'not_found' | 'unauthorized'

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthContext()

  const [state, setState] = useState<PageState>('loading')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const gameId = params.gameId as string

  const fetchGameData = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`)

      if (response.status === 401) {
        router.push(`/login?returnUrl=/games/${gameId}`)
        return
      }

      if (response.status === 403) {
        setState('unauthorized')
        return
      }

      if (response.status === 404) {
        setState('not_found')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load game')
      }

      const data: GameData = await response.json()
      setGameData(data)
      setState('loaded')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game')
      setState('error')
    }
  }, [gameId, router])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?returnUrl=/games/${gameId}`)
        return
      }
      fetchGameData()
    }
  }, [authLoading, user, fetchGameData, gameId, router])

  const handleCopyInvite = () => {
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleBuyInSuccess = () => {
    // Refresh game data after buy-in request
    fetchGameData()
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    fetchGameData()
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete game')
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game')
      setShowDeleteConfirm(false)
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  // Loading state
  if (state === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-600">Loading game...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Game Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            This game doesn&apos;t exist or the link may be incorrect.
          </p>
          <Link href="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Unauthorized state
  if (state === 'unauthorized') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-600 mb-6">
            You&apos;re not a player in this game. Ask the host for an invite link.
          </p>
          <Link href="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Error Loading Game
          </h1>
          <p className="text-neutral-600 mb-6">
            {error || 'Something went wrong. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => fetchGameData()}>
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Loaded state
  if (!gameData) {
    return null
  }

  const { game, settlement, currentUser } = gameData
  const isHost = currentUser.isHost
  const isGameActive = game.status === 'active' || game.status === 'upcoming'

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Copy success toast */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          Invite link copied!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Completed game banner */}
        {game.status === 'completed' && (
          <div className="mb-6 p-4 bg-neutral-100 border border-neutral-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  This game has been completed
                </p>
                <p className="text-sm text-neutral-600">
                  The ledger below shows the final settlement. This game is read-only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
            <Link
              href="/dashboard"
              className="hover:text-neutral-700 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-neutral-900">Game Room</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">
              {game.location}
            </h1>
            {isHost && isGameActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                You are the Bank
              </span>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Game info & controls */}
          <div className="lg:col-span-1 space-y-6">
            {isEditing ? (
              <EditGameForm
                gameId={game.id}
                currentScheduledTime={game.scheduledTime}
                currentLocation={game.location}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            ) : (
              <GameInfo
                scheduledTime={game.scheduledTime}
                location={game.location}
                bigBlindAmount={game.bigBlindAmount}
                status={game.status}
                host={game.host}
                inviteCode={game.inviteCode}
                onCopyInvite={handleCopyInvite}
                isHost={isHost}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            )}

            {/* Player actions */}
            {!isHost && isGameActive && (
              <RequestBuyInForm
                gameId={game.id}
                bigBlindAmount={game.bigBlindAmount}
                onSuccess={handleBuyInSuccess}
              />
            )}

            {/* Player buy-in status - shows pending and approved buy-ins */}
            {!isHost && (
              <PlayerBuyInStatus
                buyIns={gameData.buyIns.filter(
                  (bi) => bi.playerId === currentUser.id
                )}
                gameStatus={game.status}
              />
            )}
          </div>

          {/* Center column - Player list */}
          <div className="lg:col-span-1">
            <PlayerList
              players={settlement.players}
              hostId={game.host.id}
              currentUserId={currentUser.id}
              gameStatus={game.status}
            />
          </div>

          {/* Right column - Settlement/Ledger */}
          <div className="lg:col-span-1">
            <Ledger
              debts={settlement.debts}
              isComplete={settlement.isComplete}
              totalInPlay={settlement.totalInPlay}
              hostId={game.host.id}
            />
          </div>
        </div>

        {/* Bank controls for host */}
        {isHost && isGameActive && (
          <div className="mt-8">
            <BankControls
              gameId={game.id}
              hostId={game.host.id}
              players={gameData.players}
              buyIns={gameData.buyIns}
              settlements={settlement.players}
              bigBlindAmount={game.bigBlindAmount}
              onDataChange={fetchGameData}
            />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Game"
        message={`Are you sure you want to delete this game at "${game.location}"? This action cannot be undone. All player data and buy-in records will be permanently removed.`}
        confirmLabel="Delete Game"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  )
}

