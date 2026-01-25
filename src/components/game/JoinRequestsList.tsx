'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Button, useToast, ConfirmDialog } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'

interface JoinRequest {
  id: string
  gameId: string
  playerId: string
  playerName: string
  status: string
  requestedAt: string
}

interface JoinRequestsListProps {
  gameId: string
  onPlayerAdded: () => void
}

export function JoinRequestsList({ gameId, onPlayerAdded }: JoinRequestsListProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showDenyConfirm, setShowDenyConfirm] = useState<string | null>(null)
  const { addToast } = useToast()

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/join-requests`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching join requests:', error)
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    fetchRequests()
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [fetchRequests])

  const handleAction = async (requestId: string, action: 'approve' | 'deny') => {
    setProcessingId(requestId)
    try {
      const response = await fetch(`/api/games/${gameId}/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        addToast('success', data.message)

        // Remove the request from the list
        setRequests((prev) => prev.filter((r) => r.id !== requestId))

        // If approved, trigger a refresh of the game data
        if (action === 'approve') {
          onPlayerAdded()
        }
      } else {
        const data = await response.json()
        addToast('error', data.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Error processing join request:', error)
      addToast('error', 'Failed to process request')
    } finally {
      setProcessingId(null)
      setShowDenyConfirm(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-10 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null // Don't show anything if there are no pending requests
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-blue-800">
            Join Requests
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 rounded-full">
              {requests.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-neutral-600">
                  {request.playerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 truncate">
                  {request.playerName}
                </p>
                <p className="text-sm text-neutral-500">
                  Requested{' '}
                  {formatDistanceToNow(new Date(request.requestedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleAction(request.id, 'approve')}
                disabled={processingId === request.id}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                {processingId === request.id ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowDenyConfirm(request.id)}
                disabled={processingId === request.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Deny
              </Button>
            </div>

            <ConfirmDialog
              isOpen={showDenyConfirm === request.id}
              onCancel={() => setShowDenyConfirm(null)}
              onConfirm={() => handleAction(request.id, 'deny')}
              title="Deny Join Request"
              message={`Are you sure you want to deny ${request.playerName}'s request to join this game? They can request again later.`}
              confirmLabel="Deny Request"
              variant="danger"
              isLoading={processingId === request.id}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
