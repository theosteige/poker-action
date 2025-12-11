import type { Street } from '../types';
import { STREET_LABELS } from '../types';
import './ActionButtons.css';

interface ActionButtonsProps {
  isHandActive: boolean;
  isPaused: boolean;
  isWaitingForStreet: boolean;
  nextStreet: Street | null;
  onAction: () => void;
  onRaise: () => void;
  onFold: () => void;
  onBeginStreet: () => void;
  onPause: () => void;
  onNewHand: () => void;
  onEndHand: () => void;
  isFocusMode?: boolean;
}

export function ActionButtons({
  isHandActive,
  isPaused,
  isWaitingForStreet,
  nextStreet,
  onAction,
  onRaise,
  onFold,
  onBeginStreet,
  onPause,
  onNewHand,
  onEndHand,
  isFocusMode = false,
}: ActionButtonsProps) {
  const canAct = isHandActive && !isWaitingForStreet;

  return (
    <div className={`action-buttons ${isFocusMode ? 'focus-mode' : ''}`}>
      {isWaitingForStreet && nextStreet ? (
        <button
          className="btn btn-begin-street"
          onClick={onBeginStreet}
        >
          Begin {STREET_LABELS[nextStreet]}
        </button>
      ) : (
        <div className="btn-primary-row">
          <button
            className="btn btn-action"
            onClick={onAction}
            disabled={!canAct}
          >
            Check/Call
          </button>
          <button
            className="btn btn-raise"
            onClick={onRaise}
            disabled={!canAct}
          >
            Raise
          </button>
          <button
            className="btn btn-fold"
            onClick={onFold}
            disabled={!canAct}
          >
            Fold
          </button>
        </div>
      )}
      <div className="btn-row">
        <button
          className={`btn ${isPaused ? 'btn-action' : 'btn-secondary'}`}
          onClick={onPause}
          disabled={!isHandActive}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          className="btn btn-end-hand"
          onClick={onEndHand}
          disabled={!isHandActive}
        >
          End Hand
        </button>
        <button className="btn btn-secondary btn-new-hand" onClick={onNewHand}>
          New Hand
        </button>
      </div>
    </div>
  );
}
