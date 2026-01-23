'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { type PaymentHandle } from '@/lib/settlement'

interface Player {
  id: string
  displayName: string
  paymentHandles: PaymentHandle[]
  isHost: boolean
}

interface BuyIn {
  id: string
  playerId: string
  playerDisplayName: string
  amount: string
  paidToBank: boolean
  requestedByPlayer: boolean
  approved: boolean
  timestamp: string
}

interface PlayerSettlement {
  playerId: string
  displayName: string
  totalBuyIns: number
  cashOut: number
  hasCashedOut: boolean
}

interface BankControlsProps {
  gameId: string
  players: Player[]
  buyIns: BuyIn[]
  settlements: PlayerSettlement[]
  bigBlindAmount: string
  onDataChange: () => void
}

export function BankControls({
  gameId,
  players,
  buyIns,
  settlements,
  bigBlindAmount,
  onDataChange,
}: BankControlsProps) {
  const [activeTab, setActiveTab] = useState<'buy-in' | 'cash-out' | 'manage'>('buy-in')

  const pendingRequests = buyIns.filter(
    (bi) => bi.requestedByPlayer && !bi.approved
  )

  const approvedBuyIns = buyIns.filter((bi) => bi.approved)

  // Players who haven't cashed out yet
  const activePlayers = settlements.filter((s) => !s.hasCashedOut)

  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-600"
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
          <h2 className="text-lg font-semibold text-amber-800">Bank Controls</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('buy-in')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'buy-in'
                ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Add Buy-In
          </button>
          <button
            onClick={() => setActiveTab('cash-out')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'cash-out'
                ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Cash Out
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors relative ${
              activeTab === 'manage'
                ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Manage
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'buy-in' && (
          <AddBuyInForm
            gameId={gameId}
            players={players}
            bigBlindAmount={bigBlindAmount}
            onSuccess={onDataChange}
          />
        )}

        {activeTab === 'cash-out' && (
          <CashOutForm
            gameId={gameId}
            activePlayers={activePlayers}
            onSuccess={onDataChange}
          />
        )}

        {activeTab === 'manage' && (
          <ManageBuyIns
            gameId={gameId}
            pendingRequests={pendingRequests}
            approvedBuyIns={approvedBuyIns}
            onAction={onDataChange}
          />
        )}
      </div>
    </Card>
  )
}

// Add Buy-In Form Component
interface AddBuyInFormProps {
  gameId: string
  players: Player[]
  bigBlindAmount: string
  onSuccess: () => void
}

function AddBuyInForm({ gameId, players, bigBlindAmount, onSuccess }: AddBuyInFormProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [amount, setAmount] = useState('')
  const [paidToBank, setPaidToBank] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const bb = parseFloat(bigBlindAmount) || 1
  const quickAmounts = [bb * 50, bb * 100, bb * 200]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!selectedPlayerId) {
      setError('Please select a player')
      return
    }

    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/games/${gameId}/buy-ins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          amount: amountNum,
          paidToBank,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add buy-in')
      }

      setSuccess(true)
      setAmount('')
      setSelectedPlayerId('')
      setPaidToBank(true)
      onSuccess()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add buy-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Player
        </label>
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Select a player...</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.displayName} {player.isHost ? '(Host)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-2">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              type="button"
              onClick={() => setAmount(qa.toString())}
              className="px-3 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors"
            >
              ${qa}
            </button>
          ))}
        </div>
      </div>

      {/* Paid to Bank Toggle */}
      <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">Paid to Bank</p>
          <p className="text-xs text-neutral-500">
            Player has given cash to the bank
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPaidToBank(!paidToBank)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            paidToBank ? 'bg-green-500' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              paidToBank ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          Buy-in added successfully!
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-amber-600 hover:bg-amber-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Buy-In'}
      </Button>
    </form>
  )
}

// Cash Out Form Component
interface CashOutFormProps {
  gameId: string
  activePlayers: PlayerSettlement[]
  onSuccess: () => void
}

function CashOutForm({ gameId, activePlayers, onSuccess }: CashOutFormProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedPlayer = activePlayers.find((p) => p.playerId === selectedPlayerId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!selectedPlayerId) {
      setError('Please select a player')
      return
    }

    const amountNum = parseFloat(amount)
    if (amountNum < 0) {
      setError('Amount cannot be negative')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/games/${gameId}/cash-outs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          amount: amountNum,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cash out player')
      }

      setSuccess(true)
      setAmount('')
      setSelectedPlayerId('')
      onSuccess()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cash out player')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (activePlayers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-green-600"
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
        <p className="text-sm font-medium text-neutral-900 mb-1">
          All Players Cashed Out
        </p>
        <p className="text-xs text-neutral-500">
          Everyone has been settled. Game complete!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Player
        </label>
        <select
          value={selectedPlayerId}
          onChange={(e) => {
            setSelectedPlayerId(e.target.value)
            setAmount('')
          }}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Select a player...</option>
          {activePlayers.map((player) => (
            <option key={player.playerId} value={player.playerId}>
              {player.displayName} (Buy-ins: ${player.totalBuyIns.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Player Info */}
      {selectedPlayer && (
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">{selectedPlayer.displayName}</span> has{' '}
            <span className="font-semibold text-neutral-900">
              ${selectedPlayer.totalBuyIns.toFixed(2)}
            </span>{' '}
            in buy-ins
          </p>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Cash-Out Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Enter the total chip value the player is cashing out
        </p>
      </div>

      {/* Preview Net */}
      {selectedPlayer && amount && (
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-sm text-neutral-600 mb-1">Preview:</p>
          {(() => {
            const cashOutAmount = parseFloat(amount) || 0
            const net = cashOutAmount - selectedPlayer.totalBuyIns
            const isPositive = net > 0
            const isNegative = net < 0
            return (
              <p
                className={`text-lg font-bold ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                    ? 'text-red-600'
                    : 'text-neutral-600'
                }`}
              >
                {isPositive ? '+' : ''}${net.toFixed(2)}
              </p>
            )
          })()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          Player cashed out successfully!
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-amber-600 hover:bg-amber-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Cash Out Player'}
      </Button>
    </form>
  )
}

// Manage Buy-Ins Component
interface ManageBuyInsProps {
  gameId: string
  pendingRequests: BuyIn[]
  approvedBuyIns: BuyIn[]
  onAction: () => void
}

function ManageBuyIns({
  gameId,
  pendingRequests,
  approvedBuyIns,
  onAction,
}: ManageBuyInsProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (buyInId: string) => {
    setProcessingId(buyInId)
    try {
      const response = await fetch(`/api/games/${gameId}/buy-ins/${buyInId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve')
      }

      onAction()
    } catch (err) {
      console.error('Error approving buy-in:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeny = async (buyInId: string) => {
    setProcessingId(buyInId)
    try {
      const response = await fetch(`/api/games/${gameId}/buy-ins/${buyInId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to deny')
      }

      onAction()
    } catch (err) {
      console.error('Error denying buy-in:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleTogglePaid = async (buyInId: string, currentPaidStatus: boolean) => {
    setProcessingId(buyInId)
    try {
      const response = await fetch(`/api/games/${gameId}/buy-ins/${buyInId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'togglePaid',
          paidToBank: !currentPaidStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      onAction()
    } catch (err) {
      console.error('Error toggling paid status:', err)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No pending requests
          </p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((buyIn) => (
              <div
                key={buyIn.id}
                className="flex items-center justify-between bg-amber-50 rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {buyIn.playerDisplayName}
                  </p>
                  <p className="text-sm text-amber-700 font-semibold">
                    ${parseFloat(buyIn.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeny(buyIn.id)}
                    disabled={processingId === buyIn.id}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleApprove(buyIn.id)}
                    disabled={processingId === buyIn.id}
                    className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Buy-Ins */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          All Buy-Ins ({approvedBuyIns.length})
        </h3>

        {approvedBuyIns.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No buy-ins yet
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {approvedBuyIns.map((buyIn) => (
              <div
                key={buyIn.id}
                className="flex items-center justify-between bg-neutral-50 rounded-lg p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {buyIn.playerDisplayName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    ${parseFloat(buyIn.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      buyIn.paidToBank
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {buyIn.paidToBank ? 'Paid' : 'Unpaid'}
                  </span>
                  <button
                    onClick={() => handleTogglePaid(buyIn.id, buyIn.paidToBank)}
                    disabled={processingId === buyIn.id}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      buyIn.paidToBank ? 'bg-green-500' : 'bg-neutral-300'
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        buyIn.paidToBank ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
