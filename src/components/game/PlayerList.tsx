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
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Players</h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 font-tabular">
          {players.length} {players.length === 1 ? 'player' : 'players'}
        </span>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
          No players have joined yet.
        </p>
      ) : (
        <>
          {/* Desktop: Table header - hidden on mobile */}
          {hasAnyBuyIns && (
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Buy-in</div>
              <div className="col-span-2 text-right">Cash-out</div>
              <div className="col-span-2 text-right">Net</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-1">
            {/* Player rows */}
            {sortedPlayers.map((player) => {
              const isHost = player.playerId === hostId
              const isCurrentUser = player.playerId === currentUserId
              const net = formatNetAmount(player.netChips)

              // Determine status for display
              const statusBadge = player.hasCashedOut ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Settled
                </span>
              ) : player.totalBuyIns > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Playing
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {gameStatus === 'upcoming' ? 'Waiting' : 'No buy-in'}
                </span>
              )

              return (
                <div
                  key={player.playerId}
                  className={`rounded-md p-3 transition-colors duration-150 ${
                    isCurrentUser
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {/* Mobile Layout - Card style */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                            {player.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {player.displayName}
                            {isCurrentUser && (
                              <span className="text-neutral-500 dark:text-neutral-400 font-normal"> (you)</span>
                            )}
                          </p>
                          {isHost && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Bank
                            </span>
                          )}
                        </div>
                      </div>
                      {statusBadge}
                    </div>

                    {/* Stats row for mobile */}
                    {(player.totalBuyIns > 0 || player.hasCashedOut) && (
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Buy-in</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 font-tabular">
                            {player.totalBuyIns > 0 ? formatCurrency(player.totalBuyIns) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Cash-out</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 font-tabular">
                            {player.hasCashedOut ? formatCurrency(player.cashOut) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Net</p>
                          {player.hasCashedOut ? (
                            <p
                              className={`text-sm font-medium font-tabular ${
                                net.isPositive
                                  ? 'text-green-600 dark:text-green-400'
                                  : net.isNegative
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              {net.text}
                            </p>
                          ) : player.totalBuyIns > 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">In play</p>
                          ) : (
                            <p className="text-sm text-neutral-400 dark:text-neutral-500">-</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout - Grid row */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                    {/* Player name */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                          {player.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {player.displayName}
                          {isCurrentUser && (
                            <span className="text-neutral-500 dark:text-neutral-400 font-normal"> (you)</span>
                          )}
                        </p>
                        {isHost && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Bank
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buy-in total - right aligned with tabular numbers */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-tabular">
                        {player.totalBuyIns > 0
                          ? formatCurrency(player.totalBuyIns)
                          : '-'}
                      </span>
                    </div>

                    {/* Cash-out - right aligned with tabular numbers */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-tabular">
                        {player.hasCashedOut
                          ? formatCurrency(player.cashOut)
                          : '-'}
                      </span>
                    </div>

                    {/* Net +/- - right aligned with tabular numbers */}
                    <div className="col-span-2 flex items-center justify-end">
                      {player.hasCashedOut ? (
                        <span
                          className={`text-sm font-medium font-tabular ${
                            net.isPositive
                              ? 'text-green-600 dark:text-green-400'
                              : net.isNegative
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {net.text}
                        </span>
                      ) : player.totalBuyIns > 0 ? (
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                          In play
                        </span>
                      ) : (
                        <span className="text-sm text-neutral-400 dark:text-neutral-500">-</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-end">
                      {statusBadge}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Summary footer */}
      {hasAnyBuyIns && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Total in play:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100 font-tabular">
              {formatCurrency(players.reduce((sum, p) => sum + p.totalBuyIns, 0))}
            </span>
          </div>
          {gameStatus !== 'upcoming' && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-600 dark:text-neutral-400">Players cashed out:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100 font-tabular">
                {players.filter((p) => p.hasCashedOut).length} / {players.length}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
