import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onAction: () => void;
  onRaise: () => void;
  onFold: () => void;
  onNewHand: () => void;
  onPause: () => void;
  onBeginStreet: () => void;
  onEndHand: () => void;
  onStraddleCycle: () => void;
  isHandActive: boolean;
  isWaitingForStreet: boolean;
  isModalOpen: boolean;
}

export function useKeyboardShortcuts({
  onAction,
  onRaise,
  onFold,
  onNewHand,
  onPause,
  onBeginStreet,
  onEndHand,
  onStraddleCycle,
  isHandActive,
  isWaitingForStreet,
  isModalOpen,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if a modal is open or user is typing in an input
      if (isModalOpen) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      const key = event.key.toLowerCase();
      const canAct = isHandActive && !isWaitingForStreet;

      switch (key) {
        // C = Check/Call
        case 'c':
          if (canAct) {
            event.preventDefault();
            onAction();
          }
          break;

        // R = Raise
        case 'r':
          if (canAct) {
            event.preventDefault();
            onRaise();
          }
          break;

        // F = Fold
        case 'f':
          if (canAct) {
            event.preventDefault();
            onFold();
          }
          break;

        // N = New Hand
        case 'n':
          event.preventDefault();
          onNewHand();
          break;

        // P or Space = Pause/Resume
        case 'p':
        case ' ':
          if (isHandActive) {
            event.preventDefault();
            onPause();
          }
          break;

        // B or Enter = Begin Street (when waiting)
        case 'b':
        case 'enter':
          if (isWaitingForStreet) {
            event.preventDefault();
            onBeginStreet();
          }
          break;

        // E = End Hand
        case 'e':
          if (isHandActive) {
            event.preventDefault();
            onEndHand();
          }
          break;

        // S = Cycle Straddle (none -> single -> double -> triple -> none)
        case 's':
          if (!isHandActive) {
            event.preventDefault();
            onStraddleCycle();
          }
          break;

        default:
          break;
      }
    },
    [
      onAction,
      onRaise,
      onFold,
      onNewHand,
      onPause,
      onBeginStreet,
      onEndHand,
      onStraddleCycle,
      isHandActive,
      isWaitingForStreet,
      isModalOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Keyboard shortcut reference
export const KEYBOARD_SHORTCUTS = {
  'C': 'Check/Call',
  'R': 'Raise',
  'F': 'Fold',
  'N': 'New Hand',
  'P / Space': 'Pause/Resume',
  'B / Enter': 'Begin Street',
  'E': 'End Hand',
  'S': 'Cycle Straddle',
} as const;
