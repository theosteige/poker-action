import type { Player, Settlement } from './types';

interface Balance {
  playerId: string;
  playerName: string;
  amount: number;
}

export function calculateSettlements(players: Player[]): Settlement[] {
  // Calculate net balance for each player (cashOut - totalBuyIns)
  const balances: Balance[] = players.map((player) => {
    const totalBuyIns = player.buyIns.reduce((sum, b) => sum + b.amount, 0);
    const cashOut = player.cashOut ?? 0;
    return {
      playerId: player.id,
      playerName: player.name,
      amount: cashOut - totalBuyIns,
    };
  });

  // Separate into creditors (positive) and debtors (negative)
  const creditors = balances
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.amount < 0)
    .map((b) => ({ ...b, amount: Math.abs(b.amount) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  // Greedy algorithm: match largest creditor with largest debtor
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0) {
      settlements.push({
        from: debtor.playerId,
        fromName: debtor.playerName,
        to: creditor.playerId,
        toName: creditor.playerName,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount === 0) i++;
    if (debtor.amount === 0) j++;
  }

  return settlements;
}

export function getPlayerBalance(player: Player): number {
  const totalBuyIns = player.buyIns.reduce((sum, b) => sum + b.amount, 0);
  const cashOut = player.cashOut ?? 0;
  return cashOut - totalBuyIns;
}

export function getTotalBuyIns(player: Player): number {
  return player.buyIns.reduce((sum, b) => sum + b.amount, 0);
}

export function getPendingBuyIns(player: Player): number {
  return player.buyIns.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
}
