import { useState, useMemo } from 'react';
import type { TimeStructure } from '../types';
import './CustomTimeStructureModal.css';

interface CustomTimeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (structure: TimeStructure) => void;
}

export function CustomTimeStructureModal({
  isOpen,
  onClose,
  onSave,
}: CustomTimeStructureModalProps) {
  const [freeTime, setFreeTime] = useState(30);
  const [penaltyBB, setPenaltyBB] = useState(1);
  const [penaltyInterval, setPenaltyInterval] = useState(10);

  // Generate data points for the graph (0 to 120 seconds)
  const graphData = useMemo(() => {
    const points: { time: number; penalty: number }[] = [];
    for (let t = 0; t <= 120; t += 5) {
      let penalty = 0;
      if (t > freeTime) {
        penalty = Math.ceil((t - freeTime) / penaltyInterval) * penaltyBB;
      }
      points.push({ time: t, penalty });
    }
    return points;
  }, [freeTime, penaltyBB, penaltyInterval]);

  const maxPenalty = Math.max(...graphData.map((p) => p.penalty), 1);

  const handleSave = () => {
    const structure: TimeStructure = {
      freeTime,
      penaltyBB,
      penaltyInterval,
      label: `${freeTime}s free, ${penaltyBB}bb/${penaltyInterval}s (custom)`,
    };
    onSave(structure);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Custom Time Structure</h2>

        <div className="input-group">
          <label>
            Free Time (seconds)
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={freeTime}
              onChange={(e) => setFreeTime(Number(e.target.value))}
            />
            <span className="value">{freeTime}s</span>
          </label>
        </div>

        <div className="input-group">
          <label>
            Penalty Amount (BB)
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={penaltyBB}
              onChange={(e) => setPenaltyBB(Number(e.target.value))}
            />
            <span className="value">{penaltyBB}bb</span>
          </label>
        </div>

        <div className="input-group">
          <label>
            Penalty Interval (seconds)
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={penaltyInterval}
              onChange={(e) => setPenaltyInterval(Number(e.target.value))}
            />
            <span className="value">every {penaltyInterval}s</span>
          </label>
        </div>

        <div className="graph-container">
          <div className="graph-title">Penalty Over Time</div>
          <div className="graph">
            <div className="y-axis">
              <span>{maxPenalty}bb</span>
              <span>{Math.floor(maxPenalty / 2)}bb</span>
              <span>0bb</span>
            </div>
            <div className="graph-area">
              <svg viewBox="0 0 240 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="240" y2="50" className="grid-line" />
                <line x1="0" y1="25" x2="240" y2="25" className="grid-line" />
                <line x1="0" y1="75" x2="240" y2="75" className="grid-line" />

                {/* Free time zone */}
                <rect
                  x="0"
                  y="0"
                  width={(freeTime / 120) * 240}
                  height="100"
                  className="free-zone"
                />

                {/* Penalty line */}
                <polyline
                  points={graphData
                    .map((p) => {
                      const x = (p.time / 120) * 240;
                      const y = 100 - (p.penalty / maxPenalty) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  className="penalty-line"
                />

                {/* Data points */}
                {graphData
                  .filter((p) => p.penalty > 0)
                  .map((p, i) => {
                    const x = (p.time / 120) * 240;
                    const y = 100 - (p.penalty / maxPenalty) * 100;
                    return <circle key={i} cx={x} cy={y} r="3" className="data-point" />;
                  })}
              </svg>
              <div className="x-axis">
                <span>0s</span>
                <span>30s</span>
                <span>60s</span>
                <span>90s</span>
                <span>120s</span>
              </div>
            </div>
          </div>
          <div className="graph-legend">
            <span className="legend-free">Free time</span>
            <span className="legend-penalty">Penalty zone</span>
          </div>
        </div>

        <div className="summary">
          After <strong>{freeTime}s</strong>, player pays <strong>{penaltyBB}bb</strong> every{' '}
          <strong>{penaltyInterval}s</strong>
        </div>

        <div className="modal-buttons">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-action" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
