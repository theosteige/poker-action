import type { Penalties } from '../types';
import './PenaltyModal.css';

interface PenaltyModalProps {
  isOpen: boolean;
  penalties: Penalties;
  onClose: () => void;
}

export function PenaltyModal({ isOpen, penalties, onClose }: PenaltyModalProps) {
  if (!isOpen) return null;

  const penaltyEntries = Object.entries(penalties);
  const hasPenalties = penaltyEntries.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Hand Complete</h2>
        <div className="penalty-content">
          {hasPenalties ? (
            <div className="penalty-list">
              {penaltyEntries.map(([position, bb]) => (
                <div key={position} className="penalty-item">
                  <span>{position}</span>
                  <span className="penalty-amount">{bb}bb</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-penalties">No penalties this hand!</p>
          )}
        </div>
        <button className="btn btn-action" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
