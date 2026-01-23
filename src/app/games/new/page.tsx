'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateGameForm, InviteLinkModal } from '@/components/game'

interface GameCreatedData {
  id: string
  inviteCode: string
  inviteUrl: string
  location: string
  scheduledTime: string
  bigBlindAmount: string
}

export default function NewGamePage() {
  const [createdGame, setCreatedGame] = useState<GameCreatedData | null>(null)

  const handleGameCreated = (game: GameCreatedData) => {
    setCreatedGame(game)
  }

  const handleCloseModal = () => {
    setCreatedGame(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>

        <CreateGameForm onGameCreated={handleGameCreated} />
      </div>

      {createdGame && (
        <InviteLinkModal
          gameId={createdGame.id}
          inviteUrl={createdGame.inviteUrl}
          location={createdGame.location}
          scheduledTime={createdGame.scheduledTime}
          bigBlindAmount={createdGame.bigBlindAmount}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
