import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePokerBank } from './poker-bank/usePokerBank';
import { GameSetup, ActiveGame, Ledger } from './poker-bank/components';
import type { GameView } from './poker-bank/types';
import './PokerBank.css';

function PokerBank() {
  const [view, setView] = useState<GameView>('setup');
  const prevCashedOutCountRef = useRef<number>(0);
  const {
    games,
    currentGame,
    createGame,
    selectGame,
    deleteGame,
    clearCurrentGame,
    addPlayer,
    addBuyIn,
    toggleBuyInPaid,
    markAllBuyInsPaid,
    cashOutPlayer,
    cashOutAllPlayers,
    settleGame,
    reopenGame,
    removePlayer,
    removeBuyIn,
  } = usePokerBank();

  const handleCreateGame = (bankName: string, paymentInfo: { venmo: string; zelle: string }, initialBuyIn: number) => {
    createGame(bankName, paymentInfo, initialBuyIn);
    setView('active');
  };

  const handleSelectGame = (gameId: string) => {
    selectGame(gameId);
    const game = games.find((g) => g.id === gameId);
    if (game) {
      const allCashedOut = game.players.every((p) => p.cashOut !== null);
      setView(allCashedOut ? 'ledger' : 'active');
    }
  };

  const handleBack = () => {
    if (view === 'ledger') {
      setView('active');
    } else {
      clearCurrentGame();
      setView('setup');
    }
  };

  const handleViewLedger = () => {
    setView('ledger');
  };

  // Auto-show ledger when the last player cashes out (transition to all cashed out)
  useEffect(() => {
    if (currentGame && view === 'active') {
      const cashedOutCount = currentGame.players.filter((p) => p.cashOut !== null).length;
      const totalPlayers = currentGame.players.length;
      const allCashedOut = totalPlayers > 0 && cashedOutCount === totalPlayers;

      // Only auto-switch if we just transitioned to all cashed out
      // (previous count was less than total, now it equals total)
      if (allCashedOut && prevCashedOutCountRef.current < totalPlayers) {
        setView('ledger');
      }

      prevCashedOutCountRef.current = cashedOutCount;
    }
  }, [currentGame, view]);

  // Reset the ref when switching games
  useEffect(() => {
    if (currentGame) {
      prevCashedOutCountRef.current = currentGame.players.filter((p) => p.cashOut !== null).length;
    } else {
      prevCashedOutCountRef.current = 0;
    }
  }, [currentGame?.id]);

  return (
    <div className="poker-bank-container">
      <div className="poker-bank-header">
        <Link to="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Tools
        </Link>
        <h1>Live Poker Bank</h1>
      </div>

      {view === 'setup' && !currentGame && (
        <GameSetup
          games={games}
          onCreateGame={handleCreateGame}
          onSelectGame={handleSelectGame}
          onDeleteGame={deleteGame}
        />
      )}

      {view === 'active' && currentGame && (
        <ActiveGame
          game={currentGame}
          onBack={handleBack}
          onAddPlayer={addPlayer}
          onAddBuyIn={addBuyIn}
          onToggleBuyInPaid={toggleBuyInPaid}
          onMarkAllPaid={markAllBuyInsPaid}
          onCashOutPlayer={cashOutPlayer}
          onCashOutAll={cashOutAllPlayers}
          onRemovePlayer={removePlayer}
          onRemoveBuyIn={removeBuyIn}
          onViewLedger={handleViewLedger}
        />
      )}

      {view === 'ledger' && currentGame && (
        <Ledger
          game={currentGame}
          onBack={handleBack}
          onSettle={settleGame}
          onReopen={reopenGame}
        />
      )}
    </div>
  );
}

export default PokerBank;
