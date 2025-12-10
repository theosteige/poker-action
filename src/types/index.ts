export interface Player {
  position: string;
  index: number;
  folded: boolean;
}

export interface TimeStructure {
  freeTime: number;
  penaltyBB: number;
  penaltyInterval: number;
  label: string;
}

export interface Penalties {
  [position: string]: number;
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

export const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isHandActive: boolean;
  isPaused: boolean;
  penalties: Penalties;
  currentStreet: Street;
}

export type PlayerCount = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type StraddleType = 'none' | 'single' | 'double' | 'triple';

export const STRADDLE_LABELS: Record<StraddleType, string> = {
  none: 'No Straddle',
  single: 'Single Straddle',
  double: 'Double Straddle',
  triple: 'Triple Straddle',
};

// How many positions the straddle shifts first-to-act (from UTG)
export const STRADDLE_SHIFT: Record<StraddleType, number> = {
  none: 0,
  single: 1,   // UTG straddles, action starts UTG+1
  double: 2,   // UTG+1 straddles, action starts UTG+2
  triple: 3,   // UTG+2 straddles, action starts UTG+3
};
