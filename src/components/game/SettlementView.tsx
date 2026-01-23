'use client'

import { Card } from '@/components/ui'
import {
  formatCurrency,
  formatNetAmount,
  type PlayerSettlement,
  type Debt,
  type PaymentHandle,
} from '@/lib/settlement'

interface SettlementViewProps {
  players: PlayerSettlement[]
  debts: Debt[]
  hostId: string
  currentUserId: string
  isComplete: boolean
  totalInPlay: number
}

/**
 * Comprehensive settlement display showing:
 * - Each player's row with name, total buy-in, cash-out, net +/-, settlement amount, owes/owed status
 * - Simplified "Who Pays Whom" list with payment handle links
 */
export function SettlementView({
  players,
  debts,
  hostId,
  currentUserId,
  isComplete,
  totalInPlay,
}: SettlementViewProps) {
  // Sort players: host first, then by settlement amount (those who owe most first)
  const sortedPlayers = [...players].sort((a, b) => {
    // Host always first
    if (a.playerId === hostId) return -1
    if (b.playerId === hostId) return 1
    // Then by settlement (those who owe most at top)
    return a.settlement - b.settlement
  })

  const hasAnyBuyIns = players.some((p) => p.totalBuyIns > 0)
  const totalCashedOut = players.filter((p) => p.hasCashedOut).length

  // Separate debts
  const owedToBank = debts.filter((d) => d.toPlayerId === hostId)
  const bankOwes = debts.filter((d) => d.fromPlayerId === hostId)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Settlement Details</h2>
        {isComplete ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Game Complete
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {totalCashedOut} / {players.length} settled
          </span>
        )}
      </div>

      {!hasAnyBuyIns ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-neutral-400"
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
          <p className="text-sm text-neutral-600">No buy-ins recorded yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            Settlement details will appear once players buy in
          </p>
        </div>
      ) : (
        <>
          {/* Player Settlement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                  <th className="text-left py-3 px-2">Player</th>
                  <th className="text-right py-3 px-2">Buy-in</th>
                  <th className="text-right py-3 px-2">Cash-out</th>
                  <th className="text-right py-3 px-2">Net +/-</th>
                  <th className="text-right py-3 px-2">Settlement</th>
                  <th className="text-center py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sortedPlayers.map((player) => {
                  const isHost = player.playerId === hostId
                  const isCurrentUser = player.playerId === currentUserId
                  const net = formatNetAmount(player.netChips)
                  const settlement = formatNetAmount(player.settlement)

                  return (
                    <tr
                      key={player.playerId}
                      className={`${
                        isCurrentUser
                          ? 'bg-blue-50'
                          : 'hover:bg-neutral-50'
                      } transition-colors`}
                    >
                      {/* Player name */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-neutral-600">
                              {player.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {player.displayName}
                              {isCurrentUser && (
                                <span className="text-neutral-500 font-normal"> (you)</span>
                              )}
                            </p>
                            {isHost && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Bank
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Buy-in total */}
                      <td className="py-3 px-2 text-right text-neutral-700">
                        {player.totalBuyIns > 0 ? formatCurrency(player.totalBuyIns) : '-'}
                        {player.unpaidBuyIns > 0 && (
                          <div className="text-xs text-amber-600">
                            ({formatCurrency(player.unpaidBuyIns)} unpaid)
                          </div>
                        )}
                      </td>

                      {/* Cash-out */}
                      <td className="py-3 px-2 text-right text-neutral-700">
                        {player.hasCashedOut ? formatCurrency(player.cashOut) : '-'}
                      </td>

                      {/* Net +/- */}
                      <td className="py-3 px-2 text-right">
                        {player.hasCashedOut ? (
                          <span
                            className={`font-medium ${
                              net.isPositive
                                ? 'text-green-600'
                                : net.isNegative
                                ? 'text-red-600'
                                : 'text-neutral-600'
                            }`}
                          >
                            {net.text}
                          </span>
                        ) : player.totalBuyIns > 0 ? (
                          <span className="text-neutral-500 italic">In play</span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      {/* Settlement amount */}
                      <td className="py-3 px-2 text-right">
                        {isHost ? (
                          <span className="text-neutral-500 italic">Bank</span>
                        ) : player.hasCashedOut || player.totalBuyIns > 0 ? (
                          <span
                            className={`font-medium ${
                              settlement.isPositive
                                ? 'text-green-600'
                                : settlement.isNegative
                                ? 'text-red-600'
                                : 'text-neutral-600'
                            }`}
                          >
                            {settlement.isPositive && 'Receives '}
                            {settlement.isNegative && 'Owes '}
                            {formatCurrency(Math.abs(player.settlement))}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 text-center">
                        <SettlementStatusBadge player={player} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-600">Total in play:</span>
              <span className="ml-2 font-medium text-neutral-900">
                {formatCurrency(totalInPlay)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-600">Cashed out:</span>
              <span className="ml-2 font-medium text-neutral-900">
                {totalCashedOut} / {players.length}
              </span>
            </div>
          </div>

          {/* Who Pays Whom Section */}
          {(owedToBank.length > 0 || bankOwes.length > 0) && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                Who Pays Whom
              </h3>

              <div className="space-y-4">
                {/* Players who owe the bank */}
                {owedToBank.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Owed to Bank
                    </h4>
                    <div className="space-y-2">
                      {owedToBank.map((debt) => (
                        <DebtRow
                          key={debt.fromPlayerId}
                          debt={debt}
                          direction="to-bank"
                          isCurrentUser={debt.fromPlayerId === currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* What bank owes players */}
                {bankOwes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Bank Owes
                    </h4>
                    <div className="space-y-2">
                      {bankOwes.map((debt) => (
                        <DebtRow
                          key={debt.toPlayerId}
                          debt={debt}
                          direction="from-bank"
                          isCurrentUser={debt.toPlayerId === currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

interface SettlementStatusBadgeProps {
  player: PlayerSettlement
}

function SettlementStatusBadge({ player }: SettlementStatusBadgeProps) {
  if (player.hasCashedOut) {
    if (player.settlement === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Even
        </span>
      )
    } else if (player.settlement > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Receives
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Owes
        </span>
      )
    }
  }

  if (player.totalBuyIns > 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Playing
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
      Waiting
    </span>
  )
}

interface DebtRowProps {
  debt: Debt
  direction: 'to-bank' | 'from-bank'
  isCurrentUser: boolean
}

function DebtRow({ debt, direction, isCurrentUser }: DebtRowProps) {
  const isToBank = direction === 'to-bank'
  const playerName = isToBank ? debt.fromDisplayName : debt.toDisplayName

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-neutral-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-600">
            {playerName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {playerName}
            {isCurrentUser && <span className="text-neutral-500 font-normal"> (you)</span>}
          </p>
          <p className="text-xs text-neutral-500">
            {isToBank ? 'owes bank' : 'receives from bank'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Payment handles */}
        {debt.toPaymentHandles.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1">
            {debt.toPaymentHandles.slice(0, 2).map((handle, index) => (
              <PaymentHandleChip key={index} handle={handle} />
            ))}
            {debt.toPaymentHandles.length > 2 && (
              <span className="text-xs text-neutral-500 px-2 py-1">
                +{debt.toPaymentHandles.length - 2} more
              </span>
            )}
          </div>
        )}

        <span
          className={`text-lg font-semibold ${
            isToBank ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {formatCurrency(debt.amount)}
        </span>
      </div>
    </div>
  )
}

interface PaymentHandleChipProps {
  handle: PaymentHandle
}

function PaymentHandleChip({ handle }: PaymentHandleChipProps) {
  const getHandleStyle = () => {
    switch (handle.type) {
      case 'venmo':
        return 'bg-blue-50 text-blue-700'
      case 'zelle':
        return 'bg-purple-50 text-purple-700'
      case 'cash':
        return 'bg-green-50 text-green-700'
      default:
        return 'bg-neutral-50 text-neutral-700'
    }
  }

  const getHandleIcon = () => {
    switch (handle.type) {
      case 'venmo':
        return 'V'
      case 'zelle':
        return 'Z'
      case 'cash':
        return '$'
      default:
        return '?'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getHandleStyle()}`}
    >
      <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">
        {getHandleIcon()}
      </span>
      {handle.handle}
    </span>
  )
}
