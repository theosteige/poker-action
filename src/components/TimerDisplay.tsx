import type { TimeStructure } from '../types';
import { formatTime, calculatePenalty } from '../utils/timeStructures';
import './TimerDisplay.css';

interface TimerDisplayProps {
  currentPlayer: string | null;
  elapsedSeconds: number;
  timeStructure: TimeStructure;
  isHandActive: boolean;
}

export function TimerDisplay({
  currentPlayer,
  elapsedSeconds,
  timeStructure,
  isHandActive,
}: TimerDisplayProps) {
  const penalty = calculatePenalty(elapsedSeconds, timeStructure);
  const timeRemaining = timeStructure.freeTime - elapsedSeconds;
  const isWarning = timeRemaining <= 10 && timeRemaining > 0;
  const isPenalty = elapsedSeconds > timeStructure.freeTime;

  const timerClass = `timer ${isWarning ? 'warning' : ''} ${isPenalty ? 'penalty' : ''}`;

  let indicatorText = '';
  if (isPenalty) {
    indicatorText = `Penalty: ${penalty}bb`;
  } else if (isWarning) {
    indicatorText = `${timeRemaining}s remaining`;
  }

  return (
    <div className="timer-display">
      <div className="current-player">
        {isHandActive && currentPlayer
          ? `Action on: ${currentPlayer}`
          : 'Press New Hand to Start'}
      </div>
      <div className={timerClass}>{formatTime(elapsedSeconds)}</div>
      <div className="penalty-indicator">{indicatorText}</div>
    </div>
  );
}
