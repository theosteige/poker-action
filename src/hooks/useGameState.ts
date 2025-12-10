import { useState, useCallback, useRef } from 'react';
import type { Player, Penalties, PlayerCount, TimeStructure, Street, StraddleType } from '../types';
import { STREET_ORDER } from '../types';
import { createPlayers, findNextActivePlayer, getFirstToActPostflop, getFirstToActPreflop } from '../utils/positions';
import { calculatePenalty } from '../utils/timeStructures';

export type ActionResult = 'continue' | 'street_complete' | 'hand_over';

interface UseGameStateReturn {
  players: Player[];
  currentPlayerIndex: number;
  isHandActive: boolean;
  isPaused: boolean;
  penalties: Penalties;
  currentStreet: Street;
  isWaitingForStreet: boolean;
  nextStreet: Street | null;
  currentStraddle: StraddleType;
  startNewHand: (playerCount: PlayerCount, straddle: StraddleType) => void;
  handleAction: (elapsedSeconds: number, timeStructure: TimeStructure) => ActionResult;
  handleRaise: (elapsedSeconds: number, timeStructure: TimeStructure) => void;
  handleFold: (elapsedSeconds: number, timeStructure: TimeStructure) => ActionResult;
  beginStreet: (street: Street) => void;
  togglePause: () => void;
  selectPlayer: (index: number) => void;
  endHand: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isHandActive, setIsHandActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [penalties, setPenalties] = useState<Penalties>({});
  const [currentStreet, setCurrentStreet] = useState<Street>('preflop');
  const [isWaitingForStreet, setIsWaitingForStreet] = useState(false);
  const [nextStreet, setNextStreet] = useState<Street | null>(null);
  const [currentStraddle, setCurrentStraddle] = useState<StraddleType>('none');

  // Track which players have acted this betting round (resets on raise)
  const hasActedThisRoundRef = useRef<Set<number>>(new Set());

  const recordPenalty = useCallback(
    (elapsedSeconds: number, timeStructure: TimeStructure) => {
      const penalty = calculatePenalty(elapsedSeconds, timeStructure);
      if (penalty > 0 && players[currentPlayerIndex]) {
        const position = players[currentPlayerIndex].position;
        setPenalties((prev) => ({
          ...prev,
          [position]: (prev[position] || 0) + penalty,
        }));
      }
    },
    [players, currentPlayerIndex]
  );

  const startNewHand = useCallback((playerCount: PlayerCount, straddle: StraddleType) => {
    const newPlayers = createPlayers(playerCount);
    setPlayers(newPlayers);
    setCurrentStraddle(straddle);

    // Get first to act based on straddle
    const firstToAct = getFirstToActPreflop(newPlayers, straddle);
    setCurrentPlayerIndex(firstToAct);

    setIsHandActive(true);
    setIsPaused(false);
    setPenalties({});
    setCurrentStreet('preflop');
    setIsWaitingForStreet(false);
    setNextStreet(null);
    hasActedThisRoundRef.current = new Set();
  }, []);

  const beginStreet = useCallback((street: Street) => {
    setCurrentStreet(street);
    setIsWaitingForStreet(false);
    setNextStreet(null);

    // Post-flop, action starts with first active player after button (SB position)
    const firstToAct = getFirstToActPostflop(players);
    setCurrentPlayerIndex(firstToAct);
    hasActedThisRoundRef.current = new Set();
  }, [players]);

  const handleAction = useCallback(
    (elapsedSeconds: number, timeStructure: TimeStructure): ActionResult => {
      if (!isHandActive || isWaitingForStreet) return 'continue';

      recordPenalty(elapsedSeconds, timeStructure);

      // Mark current player as having acted
      hasActedThisRoundRef.current.add(currentPlayerIndex);

      const nextPlayer = findNextActivePlayer(players, currentPlayerIndex);

      // Only 1 player left = hand over
      const activePlayers = players.filter((p) => !p.folded);
      if (activePlayers.length <= 1) {
        return 'hand_over';
      }

      // Check if betting round is complete (next player has already acted this round)
      if (hasActedThisRoundRef.current.has(nextPlayer)) {
        // Street is complete
        if (currentStreet === 'river') {
          return 'hand_over';
        }
        // Set up waiting state for next street
        const currentIndex = STREET_ORDER.indexOf(currentStreet);
        const upcoming = STREET_ORDER[currentIndex + 1];
        setIsWaitingForStreet(true);
        setNextStreet(upcoming);
        return 'street_complete';
      }

      setCurrentPlayerIndex(nextPlayer);
      return 'continue';
    },
    [isHandActive, isWaitingForStreet, players, currentPlayerIndex, currentStreet, recordPenalty]
  );

  const handleRaise = useCallback(
    (elapsedSeconds: number, timeStructure: TimeStructure) => {
      if (!isHandActive || isWaitingForStreet) return;

      recordPenalty(elapsedSeconds, timeStructure);

      // On a raise, reset acted set - only the raiser has acted
      hasActedThisRoundRef.current = new Set([currentPlayerIndex]);

      // Move to next player
      const nextPlayer = findNextActivePlayer(players, currentPlayerIndex);
      setCurrentPlayerIndex(nextPlayer);
    },
    [isHandActive, isWaitingForStreet, players, currentPlayerIndex, recordPenalty]
  );

  const handleFold = useCallback(
    (elapsedSeconds: number, timeStructure: TimeStructure): ActionResult => {
      if (!isHandActive || isWaitingForStreet) return 'continue';

      recordPenalty(elapsedSeconds, timeStructure);

      // Mark as acted before folding
      hasActedThisRoundRef.current.add(currentPlayerIndex);

      const updatedPlayers = players.map((p, i) =>
        i === currentPlayerIndex ? { ...p, folded: true } : p
      );
      setPlayers(updatedPlayers);

      const activePlayers = updatedPlayers.filter((p) => !p.folded);
      if (activePlayers.length <= 1) {
        return 'hand_over';
      }

      const nextPlayer = findNextActivePlayer(updatedPlayers, currentPlayerIndex);

      // Check if betting round is complete
      if (hasActedThisRoundRef.current.has(nextPlayer)) {
        if (currentStreet === 'river') {
          return 'hand_over';
        }
        // Set up waiting state for next street
        const currentIndex = STREET_ORDER.indexOf(currentStreet);
        const upcoming = STREET_ORDER[currentIndex + 1];
        setIsWaitingForStreet(true);
        setNextStreet(upcoming);
        return 'street_complete';
      }

      setCurrentPlayerIndex(nextPlayer);
      return 'continue';
    },
    [isHandActive, isWaitingForStreet, players, currentPlayerIndex, currentStreet, recordPenalty]
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const selectPlayer = useCallback(
    (index: number) => {
      if (players[index] && !players[index].folded && isHandActive && !isWaitingForStreet) {
        setCurrentPlayerIndex(index);
      }
    },
    [players, isHandActive, isWaitingForStreet]
  );

  const endHand = useCallback(() => {
    setIsHandActive(false);
    setIsWaitingForStreet(false);
    setNextStreet(null);
  }, []);

  return {
    players,
    currentPlayerIndex,
    isHandActive,
    isPaused,
    penalties,
    currentStreet,
    isWaitingForStreet,
    nextStreet,
    currentStraddle,
    startNewHand,
    handleAction,
    handleRaise,
    handleFold,
    beginStreet,
    togglePause,
    selectPlayer,
    endHand,
  };
}
