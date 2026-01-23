'use client'

import { Card } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'

interface BuyIn {
  id: string
  amount: string
  paidToBank: boolean
  requestedByPlayer: boolean
  approved: boolean
  timestamp: string
}

interface PlayerBuyInStatusProps {
  buyIns: BuyIn[]
  gameStatus: 'upcoming' | 'active' | 'completed'
}

export function PlayerBuyInStatus({ buyIns, gameStatus }: PlayerBuyInStatusProps) {
  // Separate buy-ins by status
  const pendingRequests = buyIns.filter((bi) => bi.requestedByPlayer && !bi.approved)
  const approvedBuyIns = buyIns.filter((bi) => bi.approved)

  // Calculate totals
  const totalApproved = approvedBuyIns.reduce(
    (sum, bi) => sum + parseFloat(bi.amount),
    0
  )
  const totalPending = pendingRequests.reduce(
    (sum, bi) => sum + parseFloat(bi.amount),
    0
  )

  // Find recently approved requests (within last 5 minutes) - these were player requests
  const recentlyApproved = approvedBuyIns.filter((bi) => {
    if (!bi.requestedByPlayer) return false
    const approvalTime = new Date(bi.timestamp)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return approvalTime > fiveMinutesAgo
  })

  if (buyIns.length === 0 && gameStatus !== 'completed') {
    return (
      <Card className="p-4">
        <div className="text-center py-2">
          <p className="text-sm text-neutral-600">
            No buy-ins yet. Request a buy-in to get started!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Your Buy-Ins
      </h3>

      {/* Recently Approved Notification */}
      {recentlyApproved.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
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
            <div>
              <p className="text-sm font-medium text-green-800">
                Buy-in{recentlyApproved.length > 1 ? 's' : ''} Approved!
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {recentlyApproved.map((bi) => `$${parseFloat(bi.amount).toFixed(2)}`).join(', ')}{' '}
                {recentlyApproved.length === 1 ? 'was' : 'were'} approved by the bank
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
            Active Buy-Ins
          </p>
          <p className="text-lg font-bold text-neutral-900">
            ${totalApproved.toFixed(2)}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
            Pending
          </p>
          <p className="text-lg font-bold text-amber-700">
            ${totalPending.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Waiting for Approval
          </h4>
          <div className="space-y-2">
            {pendingRequests.map((buyIn) => (
              <div
                key={buyIn.id}
                className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-neutral-900">
                    ${parseFloat(buyIn.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(buyIn.timestamp), { addSuffix: true })}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Buy-Ins */}
      {approvedBuyIns.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Approved ({approvedBuyIns.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {approvedBuyIns.map((buyIn) => (
              <div
                key={buyIn.id}
                className="flex items-center justify-between bg-neutral-50 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
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
                  <span className="text-sm font-medium text-neutral-900">
                    ${parseFloat(buyIn.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      buyIn.paidToBank
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {buyIn.paidToBank ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for approved */}
      {approvedBuyIns.length === 0 && pendingRequests.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-2">
          No buy-ins yet
        </p>
      )}
    </Card>
  )
}
