import type { TimeStructure } from '../types';

export const TIME_STRUCTURES: TimeStructure[] = [
  { freeTime: 30, penaltyBB: 1, penaltyInterval: 10, label: '30s free, 1bb/10s' },
  { freeTime: 20, penaltyBB: 1, penaltyInterval: 10, label: '20s free, 1bb/10s' },
  { freeTime: 30, penaltyBB: 1, penaltyInterval: 5, label: '30s free, 1bb/5s' },
  { freeTime: 45, penaltyBB: 1, penaltyInterval: 15, label: '45s free, 1bb/15s' },
  { freeTime: 60, penaltyBB: 2, penaltyInterval: 15, label: '60s free, 2bb/15s' },
];

export function calculatePenalty(
  elapsedSeconds: number,
  timeStructure: TimeStructure
): number {
  if (elapsedSeconds <= timeStructure.freeTime) return 0;
  const penaltyTime = elapsedSeconds - timeStructure.freeTime;
  return (
    Math.ceil(penaltyTime / timeStructure.penaltyInterval) *
    timeStructure.penaltyBB
  );
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
