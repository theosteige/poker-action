'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface RequestJoinButtonProps {
  gameId: string
  /** Current status - null means no existing request */
  status: 'pending' | 'approved' | 'denied' | null
  /** Whether the user is already in the game */
  isPlayer?: boolean
  /** Whether the user is the host */
  isHost?: boolean
  /** Callback when request is successful */
  onSuccess?: () => void
  /** Full width button */
  fullWidth?: boolean
}

export function RequestJoinButton({
  gameId,
  status,
  isPlayer = false,
  isHost = false,
  onSuccess,
  fullWidth = false,
}: RequestJoinButtonProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const { addToast } = useToast()

  // Determine what to render based on current state
  if (isHost) {
    return (
      <span className="px-3 py-1.5 rounded text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
        Your Game
      </span>
    )
  }

  if (isPlayer) {
    return (
      <span className="px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Already Joined
      </span>
    )
  }

  if (status === 'pending') {
    return (
      <span className="px-3 py-1.5 rounded text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Pending Approval
      </span>
    )
  }

  if (status === 'approved') {
    return (
      <span className="px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Approved
      </span>
    )
  }

  const handleRequestJoin = async () => {
    try {
      setIsRequesting(true)

      const response = await fetch(`/api/games/${gameId}/join-requests`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send join request')
      }

      addToast('success', 'Join request sent! Waiting for host approval.')
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send join request'
      addToast('error', message)
    } finally {
      setIsRequesting(false)
    }
  }

  // Can request to join (no status or previously denied)
  return (
    <Button
      onClick={handleRequestJoin}
      disabled={isRequesting}
      className={fullWidth ? 'w-full' : ''}
      size="sm"
    >
      {isRequesting
        ? 'Requesting...'
        : status === 'denied'
          ? 'Request Again'
          : 'Request to Join'}
    </Button>
  )
}
