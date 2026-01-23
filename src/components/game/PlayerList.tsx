'use client'

import { Card } from '@/components/ui'
import { formatCurrency, formatNetAmount, type PlayerSettlement } from '@/lib/settlement'

interface PlayerListProps {
  players: PlayerSettlement[]
  hostId: string
  currentUserId: string
  gameStatus: 'upcoming' | 'active' | 'completed'
}

export function PlayerList({
  players,
  hostId,
  currentUserId,
  gameStatus,
}: PlayerListProps) {
  // Sort players: host first, then by net chips descending
  const sortedPlayers = [...players].sort((a, b) => {
    // Host always first
    if (a.playerId === hostId) return -1
    if (b.playerId === hostId) return 1
    // Then by net chips (winners at top)
    return b.netChips - a.netChips
  })

  const hasAnyBuyIns = players.some((p) => p.totalBuyIns > 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Players</h2>
        <span className="text-sm text-neutral-500">
          {players.length} {players.length === 1 ? 'player' : 'players'}
        </span>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-4">
          No players have joined yet.
        </p>
      ) : (
        <div className="space-y-1">
          {/* Header row */}
          {hasAnyBuyIns && (
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Buy-in</div>
              <div className="col-span-2 text-right">Cash-out</div>
              <div className="col-span-2 text-right">Net</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
          )}

          {/* Player rows */}
          {sortedPlayers.map((player) => {
            const isHost = player.playerId === hostId
            const isCurrentUser = player.playerId === currentUserId
            const net = formatNetAmount(player.netChips)

            return (
              <div
                key={player.playerId}
                className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-neutral-50 hover:bg-neutral-100'
                } transition-colors`}
              >
                {/* Player name */}
                <div className="col-span-4 flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-neutral-600">
                      {player.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
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

                {/* Buy-in total */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-sm text-neutral-700">
                    {player.totalBuyIns > 0
                      ? formatCurrency(player.totalBuyIns)
                      : '-'}
                  </span>
                </div>

                {/* Cash-out */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-sm text-neutral-700">
                    {player.hasCashedOut
                      ? formatCurrency(player.cashOut)
                      : '-'}
                  </span>
                </div>

                {/* Net +/- */}
                <div className="col-span-2 flex items-center justify-end">
                  {player.hasCashedOut ? (
                    <span
                      className={`text-sm font-medium ${
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
                    <span className="text-sm text-neutral-500 italic">
                      In play
                    </span>
                  ) : (
                    <span className="text-sm text-neutral-400">-</span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-end">
                  {player.hasCashedOut ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Settled
                    </span>
                  ) : player.totalBuyIns > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Playing
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                      {gameStatus === 'upcoming' ? 'Waiting' : 'No buy-in'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary footer */}
      {hasAnyBuyIns && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Total in play:</span>
            <span className="font-medium text-neutral-900">
              {formatCurrency(players.reduce((sum, p) => sum + p.totalBuyIns, 0))}
            </span>
          </div>
          {gameStatus !== 'upcoming' && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-600">Players cashed out:</span>
              <span className="font-medium text-neutral-900">
                {players.filter((p) => p.hasCashedOut).length} / {players.length}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
