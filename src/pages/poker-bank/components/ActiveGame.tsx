import { useState } from 'react';
import type { Game, Player } from '../types';
import { getTotalBuyIns, getPendingBuyIns, getPlayerBalance } from '../settlement';
import { AddPlayerModal } from './AddPlayerModal';
import { AddBuyInModal } from './AddBuyInModal';
import { CashOutModal } from './CashOutModal';

interface ActiveGameProps {
  game: Game;
  onBack: () => void;
  onAddPlayer: (name: string, buyIn: number, isPaid: boolean) => void;
  onAddBuyIn: (playerId: string, amount: number, isPaid: boolean) => void;
  onToggleBuyInPaid: (playerId: string, buyInId: string) => void;
  onMarkAllPaid: (playerId: string) => void;
  onCashOutPlayer: (playerId: string, amount: number) => void;
  onCashOutAll: (cashOuts: Record<string, number>) => void;
  onRemovePlayer: (playerId: string) => void;
  onViewLedger: () => void;
}

export function ActiveGame({
  game,
  onBack,
  onAddPlayer,
  onAddBuyIn,
  onToggleBuyInPaid,
  onMarkAllPaid,
  onCashOutPlayer,
  onCashOutAll,
  onRemovePlayer,
  onViewLedger,
}: ActiveGameProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddBuyIn, setShowAddBuyIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const bankPlayer = game.players.find((p) => p.isBank);
  const allCashedOut = game.players.every((p) => p.cashOut !== null);
  const someCashedOut = game.players.some((p) => p.cashOut !== null);
  const playersNotCashedOut = game.players.filter((p) => p.cashOut === null);

  const handleAddBuyIn = (player: Player) => {
    setSelectedPlayer(player);
    setShowAddBuyIn(true);
  };

  const handleCashOutSingle = (player: Player) => {
    setSelectedPlayer(player);
    setShowCashOut(true);
  };

  const handleCashOutAll = () => {
    setSelectedPlayer(null);
    setShowCashOut(true);
  };

  const toggleExpand = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  return (
    <div className="active-game">
      <div className="game-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Games
        </button>

        {someCashedOut && (
          <button className="btn btn-secondary" onClick={onViewLedger}>
            View Ledger
          </button>
        )}
      </div>

      {bankPlayer && (
        <div className="bank-info">
          <div className="bank-info-header">
            <span className="bank-label">Bank</span>
            <span className="bank-name">{bankPlayer.name}</span>
          </div>
          {(game.bankPaymentInfo.venmo || game.bankPaymentInfo.zelle) && (
            <div className="bank-payment-info">
              {game.bankPaymentInfo.venmo && (
                <span className="payment-method">
                  <strong>Venmo:</strong> {game.bankPaymentInfo.venmo}
                </span>
              )}
              {game.bankPaymentInfo.zelle && (
                <span className="payment-method">
                  <strong>Zelle:</strong> {game.bankPaymentInfo.zelle}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="players-section">
        <div className="section-header">
          <h3>Players ({game.players.length})</h3>
          <button className="btn btn-primary btn-small" onClick={() => setShowAddPlayer(true)}>
            + Add Player
          </button>
        </div>

        <div className="players-list">
          {game.players.map((player) => {
            const totalBuyIn = getTotalBuyIns(player);
            const pendingAmount = getPendingBuyIns(player);
            const isExpanded = expandedPlayer === player.id;
            const balance = player.cashOut !== null ? getPlayerBalance(player) : null;

            return (
              <div key={player.id} className={`player-card ${player.cashOut !== null ? 'cashed-out' : ''}`}>
                <div className="player-main" onClick={() => toggleExpand(player.id)}>
                  <div className="player-info">
                    <span className="player-name">
                      {player.name}
                      {player.isBank && <span className="bank-badge">Bank</span>}
                    </span>
                    <span className="player-stats">
                      ${totalBuyIn.toFixed(2)} in
                      {player.buyIns.length > 1 && ` (${player.buyIns.length} buy-ins)`}
                      {pendingAmount > 0 && (
                        <span className="pending-badge">${pendingAmount.toFixed(2)} pending</span>
                      )}
                    </span>
                  </div>

                  {player.cashOut !== null ? (
                    <div className="player-result">
                      <span className="cashout-amount">${player.cashOut.toFixed(2)} out</span>
                      <span className={`player-balance ${balance! >= 0 ? 'positive' : 'negative'}`}>
                        {balance! >= 0 ? '+' : ''}${balance!.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <svg
                      className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="20"
                      height="20"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>

                {isExpanded && player.cashOut === null && (
                  <div className="player-details">
                    <div className="buyins-list">
                      {player.buyIns.map((buyIn, idx) => (
                        <div key={buyIn.id} className="buyin-item">
                          <span className="buyin-label">
                            {idx === 0 ? 'Initial' : `Re-buy ${idx}`}
                          </span>
                          <span className="buyin-amount">${buyIn.amount.toFixed(2)}</span>
                          <button
                            className={`btn btn-small ${buyIn.isPaid ? 'btn-success' : 'btn-warning'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBuyInPaid(player.id, buyIn.id);
                            }}
                          >
                            {buyIn.isPaid ? 'Paid' : 'Pending'}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="player-actions">
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBuyIn(player);
                        }}
                      >
                        + Re-buy
                      </button>
                      {pendingAmount > 0 && (
                        <button
                          className="btn btn-success btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAllPaid(player.id);
                          }}
                        >
                          Mark All Paid
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCashOutSingle(player);
                        }}
                      >
                        Cash Out
                      </button>
                      {!player.isBank && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${player.name} from the game?`)) {
                              onRemovePlayer(player.id);
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {playersNotCashedOut.length > 1 && (
        <div className="game-actions">
          <button className="btn btn-primary btn-large" onClick={handleCashOutAll}>
            Cash Out All Players ({playersNotCashedOut.length})
          </button>
        </div>
      )}

      {someCashedOut && !allCashedOut && (
        <div className="game-status">
          <p>
            {game.players.filter((p) => p.cashOut !== null).length} of {game.players.length} players
            cashed out
          </p>
        </div>
      )}

      <AddPlayerModal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onAdd={onAddPlayer}
      />

      <AddBuyInModal
        isOpen={showAddBuyIn}
        player={selectedPlayer}
        onClose={() => {
          setShowAddBuyIn(false);
          setSelectedPlayer(null);
        }}
        onAdd={onAddBuyIn}
      />

      <CashOutModal
        isOpen={showCashOut}
        players={game.players}
        singlePlayer={selectedPlayer}
        onClose={() => {
          setShowCashOut(false);
          setSelectedPlayer(null);
        }}
        onCashOutSingle={onCashOutPlayer}
        onCashOutAll={onCashOutAll}
      />
    </div>
  );
}
