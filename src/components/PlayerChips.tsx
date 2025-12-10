import type { Player, Penalties } from '../types';
import './PlayerChips.css';

interface PlayerChipsProps {
  players: Player[];
  currentPlayerIndex: number;
  penalties: Penalties;
  isHandActive: boolean;
  onSelectPlayer: (index: number) => void;
}

export function PlayerChips({
  players,
  currentPlayerIndex,
  penalties,
  isHandActive,
  onSelectPlayer,
}: PlayerChipsProps) {
  return (
    <div className="players-row">
      {players.map((player, i) => {
        const isActive = i === currentPlayerIndex && isHandActive;
        const hasPenalty = penalties[player.position] > 0;

        let className = 'player-chip';
        if (isActive) className += ' active';
        if (player.folded) className += ' folded';
        if (hasPenalty) className += ' has-penalty';

        return (
          <div
            key={player.position}
            className={className}
            onClick={() => !player.folded && onSelectPlayer(i)}
          >
            {player.position}
          </div>
        );
      })}
    </div>
  );
}
