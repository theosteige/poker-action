import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { getTotalBuyIns } from '../settlement';

interface CashOutModalProps {
  isOpen: boolean;
  players: Player[];
  singlePlayer: Player | null;
  onClose: () => void;
  onCashOutSingle: (playerId: string, amount: number) => void;
  onCashOutAll: (cashOuts: Record<string, number>) => void;
}

export function CashOutModal({
  isOpen,
  players,
  singlePlayer,
  onClose,
  onCashOutSingle,
  onCashOutAll,
}: CashOutModalProps) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const playersToShow = singlePlayer ? [singlePlayer] : players.filter((p) => p.cashOut === null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      playersToShow.forEach((p) => {
        initial[p.id] = '';
      });
      setAmounts(initial);
    }
  }, [isOpen, singlePlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (singlePlayer) {
      const amount = parseFloat(amounts[singlePlayer.id] || '0');
      if (isNaN(amount) || amount < 0) return;
      onCashOutSingle(singlePlayer.id, amount);
    } else {
      const cashOuts: Record<string, number> = {};
      let valid = true;
      playersToShow.forEach((p) => {
        const amount = parseFloat(amounts[p.id] || '0');
        if (isNaN(amount) || amount < 0) {
          valid = false;
        } else {
          cashOuts[p.id] = amount;
        }
      });
      if (!valid) return;
      onCashOutAll(cashOuts);
    }
    onClose();
  };

  const updateAmount = (playerId: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [playerId]: value }));
  };

  const allFilled = playersToShow.every((p) => {
    const val = amounts[p.id];
    return val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) >= 0;
  });

  // Calculate totals for validation (only when cashing out all players)
  const isFullCashOut = !singlePlayer;
  const totalBuyInsAll = isFullCashOut
    ? players.reduce((sum, p) => sum + getTotalBuyIns(p), 0)
    : 0;
  const alreadyCashedOut = isFullCashOut
    ? players.filter((p) => p.cashOut !== null).reduce((sum, p) => sum + (p.cashOut ?? 0), 0)
    : 0;
  const currentCashOuts = playersToShow.reduce((sum, p) => {
    const val = parseFloat(amounts[p.id] || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const totalCashOutsAll = alreadyCashedOut + currentCashOuts;
  const discrepancy = totalCashOutsAll - totalBuyInsAll;
  const hasDiscrepancy = isFullCashOut && allFilled && Math.abs(discrepancy) > 0.01;

  if (!isOpen || playersToShow.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-cashout" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{singlePlayer ? `Cash Out ${singlePlayer.name}` : 'Cash Out All Players'}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="form-description">Enter final chip stack amounts:</p>

          <div className="cashout-list">
            {playersToShow.map((player) => {
              const totalBuyIn = getTotalBuyIns(player);
              const cashOutAmount = parseFloat(amounts[player.id] || '0') || 0;
              const profit = cashOutAmount - totalBuyIn;

              return (
                <div key={player.id} className="cashout-row">
                  <div className="cashout-player-info">
                    <span className="cashout-player-name">
                      {player.name}
                      {player.isBank && <span className="bank-badge">Bank</span>}
                    </span>
                    <span className="cashout-player-buyin">
                      Total buy-in: ${totalBuyIn.toFixed(2)}
                    </span>
                  </div>
                  <div className="cashout-input-group">
                    <input
                      type="number"
                      value={amounts[player.id] || ''}
                      onChange={(e) => updateAmount(player.id, e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    {amounts[player.id] && !isNaN(parseFloat(amounts[player.id])) && (
                      <span className={`cashout-profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isFullCashOut && allFilled && (
            <div className={`cashout-totals ${hasDiscrepancy ? 'has-discrepancy' : ''}`}>
              <div className="totals-row">
                <span>Total Buy-ins:</span>
                <span>${totalBuyInsAll.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Total Cash-outs:</span>
                <span>${totalCashOutsAll.toFixed(2)}</span>
              </div>
              {hasDiscrepancy && (
                <div className="discrepancy-warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>
                    Discrepancy of <strong>${Math.abs(discrepancy).toFixed(2)}</strong>
                    {discrepancy > 0 ? ' (more out than in)' : ' (less out than in)'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!allFilled}>
              {singlePlayer ? 'Cash Out' : 'Cash Out All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
