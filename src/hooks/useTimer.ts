import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  isRunning: boolean;
  isPaused: boolean;
  onTick?: (seconds: number) => void;
}

export function useTimer({ isRunning, isPaused, onTick }: UseTimerOptions) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          onTick?.(next);
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, onTick]);

  return { elapsedSeconds, reset };
}
