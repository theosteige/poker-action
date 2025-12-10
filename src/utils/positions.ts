import type { PlayerCount, Player, StraddleType } from '../types';
import { STRADDLE_SHIFT } from '../types';

export const POSITIONS: Record<PlayerCount, string[]> = {
  2: ['SB', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['CO', 'BTN', 'SB', 'BB'],
  5: ['HJ', 'CO', 'BTN', 'SB', 'BB'],
  6: ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  7: ['UTG', 'UTG+1', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  8: ['UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  9: ['UTG', 'UTG+1', 'MP', 'MP+1', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

export function createPlayers(playerCount: PlayerCount): Player[] {
  const positions = POSITIONS[playerCount];
  return positions.map((position, index) => ({
    position,
    index,
    folded: false,
  }));
}

export function findNextActivePlayer(
  players: Player[],
  currentIndex: number
): number {
  const activePlayers = players.filter((p) => !p.folded);
  if (activePlayers.length <= 1) {
    return -1;
  }

  let next = (currentIndex + 1) % players.length;
  while (players[next].folded) {
    next = (next + 1) % players.length;
  }
  return next;
}

/**
 * Get the first player to act post-flop (first active player after the button).
 * In our position arrays, SB is always second-to-last and BB is last.
 * Post-flop action starts with SB (or first active player in that direction).
 */
export function getFirstToActPostflop(players: Player[]): number {
  // SB is at index players.length - 2, BB is at players.length - 1
  // We want to find the first non-folded player starting from SB
  const sbIndex = players.length - 2;

  for (let i = 0; i < players.length; i++) {
    const index = (sbIndex + i) % players.length;
    if (!players[index].folded) {
      return index;
    }
  }

  return 0; // Fallback (shouldn't happen with 2+ active players)
}

/**
 * Get the first player to act preflop, accounting for straddles.
 * - No straddle: UTG (index 0) acts first
 * - Single straddle: UTG+1 (index 1) acts first (UTG straddled)
 * - Double straddle: UTG+2 (index 2) acts first
 * - Triple straddle: UTG+3 (index 3) acts first
 */
export function getFirstToActPreflop(
  players: Player[],
  straddle: StraddleType
): number {
  const shift = STRADDLE_SHIFT[straddle];

  // Start from the shifted position and find first non-folded player
  for (let i = 0; i < players.length; i++) {
    const index = (shift + i) % players.length;
    if (!players[index].folded) {
      return index;
    }
  }

  return 0; // Fallback
}

/**
 * Get the maximum straddle level allowed for a given player count.
 * Need at least 4 players for single, 5 for double, 6 for triple.
 */
export function getMaxStraddleLevel(playerCount: PlayerCount): StraddleType {
  if (playerCount >= 6) return 'triple';
  if (playerCount >= 5) return 'double';
  if (playerCount >= 4) return 'single';
  return 'none';
}
