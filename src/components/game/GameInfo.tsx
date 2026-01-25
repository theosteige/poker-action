'use client'

import { format } from 'date-fns'
import { Card } from '@/components/ui'
import { type PaymentHandle } from '@/lib/settlement'

interface GameInfoProps {
  scheduledTime: string
  location: string
  bigBlindAmount: string
  status: 'upcoming' | 'active' | 'completed'
  host: {
    displayName: string
    paymentHandles: PaymentHandle[]
  }
  inviteCode: string
  onCopyInvite?: () => void
  isHost?: boolean
  onEditClick?: () => void
}

const statusConfig = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-100 text-blue-800',
  },
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-neutral-100 text-neutral-800',
  },
}

export function GameInfo({
  scheduledTime,
  location,
  bigBlindAmount,
  status,
  host,
  inviteCode,
  onCopyInvite,
  isHost = false,
  onEditClick,
}: GameInfoProps) {
  const { label: statusLabel, className: statusClassName } = statusConfig[status]

  const formattedDate = format(new Date(scheduledTime), 'EEEE, MMMM d, yyyy')
  const formattedTime = format(new Date(scheduledTime), 'h:mm a')

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/games/join/${inviteCode}`
      : `/games/join/${inviteCode}`

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      onCopyInvite?.()
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      onCopyInvite?.()
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Game Details</h2>
        <div className="flex items-center gap-2">
          {isHost && onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          )}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClassName}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-neutral-600"
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
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{formattedDate}</p>
            <p className="text-sm text-neutral-600">{formattedTime}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{location}</p>
          </div>
        </div>

        {/* Big Blind */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-neutral-600"
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
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              ${parseFloat(bigBlindAmount).toFixed(2)} Big Blind
            </p>
            <p className="text-xs text-neutral-500">
              ${(parseFloat(bigBlindAmount) / 2).toFixed(2)} / $
              {parseFloat(bigBlindAmount).toFixed(2)} blinds
            </p>
          </div>
        </div>

        {/* Host */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Hosted by {host.displayName}
            </p>
            <p className="text-xs text-neutral-500">Bank / Game Admin</p>
          </div>
        </div>

        {/* Invite Link - Only show if not completed */}
        {status !== 'completed' && (
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">Invite Link</p>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
