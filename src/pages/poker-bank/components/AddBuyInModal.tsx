import { useState, useEffect } from 'react';
import type { Player } from '../types';

interface AddBuyInModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
  onAdd: (playerId: string, amount: number, isPaid: boolean) => void;
}

export function AddBuyInModal({ isOpen, player, onClose, onAdd }: AddBuyInModalProps) {
  const [buyIn, setBuyIn] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBuyIn('');
      setIsPaid(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(buyIn);
    if (!player || isNaN(amount) || amount <= 0) return;
    onAdd(player.id, amount, isPaid);
    onClose();
  };

  if (!isOpen || !player) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Buy-in for {player.name}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rebuyAmount">Buy-in Amount ($)</label>
            <input
              id="rebuyAmount"
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              placeholder="e.g., 100"
              min="0"
              step="0.01"
              autoFocus
            />
          </div>

          <div className="form-group form-group-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              />
              <span>Paid to bank</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!buyIn || parseFloat(buyIn) <= 0}
            >
              Add Buy-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
