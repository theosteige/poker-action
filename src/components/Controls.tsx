import type { PlayerCount, TimeStructure, StraddleType } from '../types';
import { STRADDLE_LABELS } from '../types';
import { TIME_STRUCTURES } from '../utils/timeStructures';
import { getMaxStraddleLevel } from '../utils/positions';
import './Controls.css';

interface ControlsProps {
  playerCount: PlayerCount;
  timeStructure: TimeStructure;
  straddle: StraddleType;
  isHandActive: boolean;
  customTimeStructure: TimeStructure | null;
  onPlayerCountChange: (count: PlayerCount) => void;
  onTimeStructureChange: (structure: TimeStructure) => void;
  onStraddleChange: (straddle: StraddleType) => void;
  onOpenCustomModal: () => void;
}

const STRADDLE_OPTIONS: StraddleType[] = ['none', 'single', 'double', 'triple'];

export function Controls({
  playerCount,
  timeStructure,
  straddle,
  isHandActive,
  customTimeStructure,
  onPlayerCountChange,
  onTimeStructureChange,
  onStraddleChange,
  onOpenCustomModal,
}: ControlsProps) {
  const maxStraddle = getMaxStraddleLevel(playerCount);

  const isStraddleAllowed = (s: StraddleType): boolean => {
    const order: StraddleType[] = ['none', 'single', 'double', 'triple'];
    return order.indexOf(s) <= order.indexOf(maxStraddle);
  };
  // Check if current structure is a preset or custom
  const presetIndex = TIME_STRUCTURES.findIndex(
    (ts) =>
      ts.freeTime === timeStructure.freeTime &&
      ts.penaltyBB === timeStructure.penaltyBB &&
      ts.penaltyInterval === timeStructure.penaltyInterval
  );
  const isCustomSelected = presetIndex === -1;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      onOpenCustomModal();
    } else {
      onTimeStructureChange(TIME_STRUCTURES[Number(value)]);
    }
  };

  return (
    <div className="controls">
      <div className="control-group">
        <label>Players in Hand</label>
        <select
          value={playerCount}
          onChange={(e) => onPlayerCountChange(Number(e.target.value) as PlayerCount)}
          disabled={isHandActive}
        >
          {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {n} Players
            </option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label>Time Bank Structure</label>
        <select
          value={isCustomSelected ? 'custom' : presetIndex}
          onChange={handleChange}
          disabled={isHandActive}
        >
          {TIME_STRUCTURES.map((ts, i) => (
            <option key={i} value={i}>
              {ts.label}
            </option>
          ))}
          <option value="custom">
            {customTimeStructure && isCustomSelected
              ? customTimeStructure.label
              : 'Custom...'}
          </option>
        </select>
      </div>
      <div className="control-group straddle-control">
        <label>Straddle</label>
        <div className="straddle-toggle">
          {STRADDLE_OPTIONS.map((s) => {
            const allowed = isStraddleAllowed(s);
            return (
              <button
                key={s}
                className={`straddle-toggle-btn ${straddle === s ? 'active' : ''} ${!allowed ? 'disabled' : ''}`}
                onClick={() => allowed && onStraddleChange(s)}
                disabled={!allowed || isHandActive}
              >
                {STRADDLE_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
