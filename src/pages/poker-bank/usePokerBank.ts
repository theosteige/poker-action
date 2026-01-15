import { useState, useEffect, useCallback } from 'react';
import type { Game, Player, BuyIn, BankPaymentInfo } from './types';

const STORAGE_KEY = 'poker-bank-games';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function loadGames(): Game[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function usePokerBank() {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  // Load games from localStorage on mount
  useEffect(() => {
    setGames(loadGames());
  }, []);

  // Save games to localStorage whenever they change
  useEffect(() => {
    if (games.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveGames(games);
    }
  }, [games]);

  const currentGame = games.find((g) => g.id === currentGameId) ?? null;

  const createGame = useCallback((bankPlayerName: string, paymentInfo: BankPaymentInfo, initialBuyIn: number) => {
    const bankPlayer: Player = {
      id: generateId(),
      name: bankPlayerName,
      buyIns: [
        {
          id: generateId(),
          amount: initialBuyIn,
          isPaid: true, // Bank's own buy-in is always "paid"
          timestamp: Date.now(),
        },
      ],
      cashOut: null,
      isBank: true,
    };

    const newGame: Game = {
      id: generateId(),
      createdAt: Date.now(),
      players: [bankPlayer],
      bankPaymentInfo: paymentInfo,
      isSettled: false,
    };

    setGames((prev) => [...prev, newGame]);
    setCurrentGameId(newGame.id);
    return newGame;
  }, []);

  const selectGame = useCallback((gameId: string) => {
    setCurrentGameId(gameId);
  }, []);

  const deleteGame = useCallback((gameId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    if (currentGameId === gameId) {
      setCurrentGameId(null);
    }
  }, [currentGameId]);

  const clearCurrentGame = useCallback(() => {
    setCurrentGameId(null);
  }, []);

  const addPlayer = useCallback(
    (name: string, initialBuyIn: number, isPaid: boolean) => {
      if (!currentGameId) return;

      const newPlayer: Player = {
        id: generateId(),
        name,
        buyIns: [
          {
            id: generateId(),
            amount: initialBuyIn,
            isPaid,
            timestamp: Date.now(),
          },
        ],
        cashOut: null,
        isBank: false,
      };

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId ? { ...g, players: [...g.players, newPlayer] } : g
        )
      );
    },
    [currentGameId]
  );

  const addBuyIn = useCallback(
    (playerId: string, amount: number, isPaid: boolean) => {
      if (!currentGameId) return;

      const newBuyIn: BuyIn = {
        id: generateId(),
        amount,
        isPaid,
        timestamp: Date.now(),
      };

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? {
                ...g,
                players: g.players.map((p) =>
                  p.id === playerId ? { ...p, buyIns: [...p.buyIns, newBuyIn] } : p
                ),
              }
            : g
        )
      );
    },
    [currentGameId]
  );

  const toggleBuyInPaid = useCallback(
    (playerId: string, buyInId: string) => {
      if (!currentGameId) return;

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? {
                ...g,
                players: g.players.map((p) =>
                  p.id === playerId
                    ? {
                        ...p,
                        buyIns: p.buyIns.map((b) =>
                          b.id === buyInId ? { ...b, isPaid: !b.isPaid } : b
                        ),
                      }
                    : p
                ),
              }
            : g
        )
      );
    },
    [currentGameId]
  );

  const markAllBuyInsPaid = useCallback(
    (playerId: string) => {
      if (!currentGameId) return;

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? {
                ...g,
                players: g.players.map((p) =>
                  p.id === playerId
                    ? {
                        ...p,
                        buyIns: p.buyIns.map((b) => ({ ...b, isPaid: true })),
                      }
                    : p
                ),
              }
            : g
        )
      );
    },
    [currentGameId]
  );

  const cashOutPlayer = useCallback(
    (playerId: string, amount: number) => {
      if (!currentGameId) return;

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? {
                ...g,
                players: g.players.map((p) =>
                  p.id === playerId ? { ...p, cashOut: amount } : p
                ),
              }
            : g
        )
      );
    },
    [currentGameId]
  );

  const cashOutAllPlayers = useCallback(
    (cashOuts: Record<string, number>) => {
      if (!currentGameId) return;

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? {
                ...g,
                players: g.players.map((p) => ({
                  ...p,
                  cashOut: cashOuts[p.id] ?? p.cashOut,
                })),
              }
            : g
        )
      );
    },
    [currentGameId]
  );

  const settleGame = useCallback(() => {
    if (!currentGameId) return;

    setGames((prev) =>
      prev.map((g) => (g.id === currentGameId ? { ...g, isSettled: true } : g))
    );
  }, [currentGameId]);

  const reopenGame = useCallback(() => {
    if (!currentGameId) return;

    setGames((prev) =>
      prev.map((g) => (g.id === currentGameId ? { ...g, isSettled: false } : g))
    );
  }, [currentGameId]);

  const removePlayer = useCallback(
    (playerId: string) => {
      if (!currentGameId) return;

      setGames((prev) =>
        prev.map((g) =>
          g.id === currentGameId
            ? { ...g, players: g.players.filter((p) => p.id !== playerId) }
            : g
        )
      );
    },
    [currentGameId]
  );

  const getActiveGames = useCallback(() => {
    return games.filter((g) => !g.isSettled);
  }, [games]);

  const getSettledGames = useCallback(() => {
    return games.filter((g) => g.isSettled);
  }, [games]);

  return {
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
    getActiveGames,
    getSettledGames,
  };
}
