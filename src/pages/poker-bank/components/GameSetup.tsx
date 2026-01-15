import { useState } from 'react';
import type { Game, BankPaymentInfo } from '../types';

interface GameSetupProps {
  games: Game[];
  onCreateGame: (bankName: string, paymentInfo: BankPaymentInfo, initialBuyIn: number) => void;
  onSelectGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
}

export function GameSetup({ games, onCreateGame, onSelectGame, onDeleteGame }: GameSetupProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bankName, setBankName] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [venmo, setVenmo] = useState('');
  const [zelle, setZelle] = useState('');

  const activeGames = games.filter((g) => !g.isSettled);
  const settledGames = games.filter((g) => g.isSettled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buyInAmount = parseFloat(buyIn);
    if (!bankName.trim() || isNaN(buyInAmount) || buyInAmount <= 0) return;
    onCreateGame(bankName.trim(), { venmo: venmo.trim(), zelle: zelle.trim() }, buyInAmount);
    setBankName('');
    setBuyIn('');
    setVenmo('');
    setZelle('');
    setShowCreateForm(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="game-setup">
      {!showCreateForm ? (
        <>
          <button className="btn btn-primary btn-large" onClick={() => setShowCreateForm(true)}>
            Create New Game
          </button>

          {activeGames.length > 0 && (
            <div className="games-section">
              <h3>Active Games</h3>
              <div className="games-list">
                {activeGames.map((game) => {
                  const bankPlayer = game.players.find((p) => p.isBank);
                  return (
                    <div key={game.id} className="game-card" onClick={() => onSelectGame(game.id)}>
                      <div className="game-card-info">
                        <span className="game-card-date">{formatDate(game.createdAt)}</span>
                        <span className="game-card-players">
                          {game.players.length} player{game.players.length !== 1 ? 's' : ''}
                        </span>
                        {bankPlayer && (
                          <span className="game-card-bank">Bank: {bankPlayer.name}</span>
                        )}
                      </div>
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this game?')) {
                            onDeleteGame(game.id);
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {settledGames.length > 0 && (
            <div className="games-section">
              <h3>Past Games</h3>
              <div className="games-list">
                {settledGames.map((game) => {
                  const bankPlayer = game.players.find((p) => p.isBank);
                  return (
                    <div key={game.id} className="game-card game-card-settled" onClick={() => onSelectGame(game.id)}>
                      <div className="game-card-info">
                        <span className="game-card-date">{formatDate(game.createdAt)}</span>
                        <span className="game-card-players">
                          {game.players.length} player{game.players.length !== 1 ? 's' : ''}
                        </span>
                        {bankPlayer && (
                          <span className="game-card-bank">Bank: {bankPlayer.name}</span>
                        )}
                        <span className="game-card-status">Settled</span>
                      </div>
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this game?')) {
                            onDeleteGame(game.id);
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <form className="create-game-form" onSubmit={handleSubmit}>
          <h3>Create New Game</h3>
          <p className="form-description">
            Enter the name of the player who will be the bank and their payment info.
          </p>

          <div className="form-group">
            <label htmlFor="bankName">Bank Player Name</label>
            <input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., John"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="bankBuyIn">Initial Buy-in ($)</label>
            <input
              id="bankBuyIn"
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              placeholder="e.g., 100"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="venmo">Venmo (optional)</label>
            <input
              id="venmo"
              type="text"
              value={venmo}
              onChange={(e) => setVenmo(e.target.value)}
              placeholder="e.g., @john-doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="zelle">Zelle (optional)</label>
            <input
              id="zelle"
              type="text"
              value={zelle}
              onChange={(e) => setZelle(e.target.value)}
              placeholder="e.g., john@email.com"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!bankName.trim() || !buyIn || parseFloat(buyIn) <= 0}
            >
              Create Game
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
