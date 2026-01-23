import { Prisma } from '@/generated/prisma'

type Decimal = Prisma.Decimal

/**
 * Payment handle for settling debts
 */
export interface PaymentHandle {
  type: 'venmo' | 'zelle' | 'cash'
  handle: string
}

/**
 * Input data for a player's game participation
 */
export interface PlayerGameData {
  playerId: string
  displayName: string
  paymentHandles: PaymentHandle[]
  buyIns: {
    amount: Decimal | number
    paidToBank: boolean
    approved: boolean
  }[]
  cashOut: {
    amount: Decimal | number
  } | null
}

/**
 * Settlement result for a single player
 */
export interface PlayerSettlement {
  playerId: string
  displayName: string
  paymentHandles: PaymentHandle[]
  totalBuyIns: number
  unpaidBuyIns: number
  cashOut: number
  netChips: number // +/- in chips (cashOut - totalBuyIns)
  settlement: number // What bank owes (positive) or is owed (negative)
  hasCashedOut: boolean
}

/**
 * A single debt between two parties
 */
export interface Debt {
  fromPlayerId: string
  fromDisplayName: string
  toPlayerId: string
  toDisplayName: string
  toPaymentHandles: PaymentHandle[]
  amount: number
}

/**
 * Complete settlement result for a game
 */
export interface GameSettlement {
  players: PlayerSettlement[]
  debts: Debt[]
  isComplete: boolean // All players have cashed out
  totalInPlay: number // Sum of all buy-ins
}

/**
 * Converts a Decimal or number to a plain number
 */
function toNumber(value: Decimal | number): number {
  if (typeof value === 'number') {
    return value
  }
  return value.toNumber()
}

/**
 * Calculate the settlement for a single player
 *
 * Settlement Logic (from PRD):
 * - totalBuyIns = sum of all approved buy-in amounts
 * - unpaidBuyIns = sum of buy-ins where paidToBank = false
 * - netChips = cashOut - totalBuyIns (their +/- in chips)
 * - settlement = cashOut - unpaidBuyIns (what bank owes or is owed)
 *
 * If settlement > 0: bank owes player this amount
 * If settlement < 0: player owes bank abs(settlement)
 */
export function calculatePlayerSettlement(player: PlayerGameData): PlayerSettlement {
  // Calculate total approved buy-ins
  const totalBuyIns = player.buyIns
    .filter((buyIn) => buyIn.approved)
    .reduce((sum, buyIn) => sum + toNumber(buyIn.amount), 0)

  // Calculate unpaid buy-ins (approved but not paid to bank)
  const unpaidBuyIns = player.buyIns
    .filter((buyIn) => buyIn.approved && !buyIn.paidToBank)
    .reduce((sum, buyIn) => sum + toNumber(buyIn.amount), 0)

  // Get cash-out amount (0 if not cashed out)
  const cashOut = player.cashOut ? toNumber(player.cashOut.amount) : 0
  const hasCashedOut = player.cashOut !== null

  // Calculate net chips (their +/- in the game)
  const netChips = cashOut - totalBuyIns

  // Calculate settlement (what bank owes or is owed)
  // settlement = cashOut - unpaidBuyIns
  // If positive: bank owes player
  // If negative: player owes bank
  const settlement = cashOut - unpaidBuyIns

  return {
    playerId: player.playerId,
    displayName: player.displayName,
    paymentHandles: player.paymentHandles,
    totalBuyIns,
    unpaidBuyIns,
    cashOut,
    netChips,
    settlement,
    hasCashedOut,
  }
}

/**
 * Calculate the complete settlement for a game
 *
 * This computes each player's +/- and determines who owes whom.
 * The bank (host) is responsible for settling with all players.
 */
export function calculateGameSettlement(
  players: PlayerGameData[],
  hostId: string
): GameSettlement {
  // Calculate settlement for each player
  const playerSettlements = players.map(calculatePlayerSettlement)

  // Find the host
  const host = playerSettlements.find((p) => p.playerId === hostId)
  const hostDisplayName = host?.displayName ?? 'Bank'
  const hostPaymentHandles = host?.paymentHandles ?? []

  // Calculate debts (simplified: all debts go through the bank)
  const debts: Debt[] = []

  for (const player of playerSettlements) {
    // Skip the host (bank settles with themselves implicitly)
    if (player.playerId === hostId) {
      continue
    }

    if (player.settlement > 0) {
      // Bank owes player
      debts.push({
        fromPlayerId: hostId,
        fromDisplayName: hostDisplayName,
        toPlayerId: player.playerId,
        toDisplayName: player.displayName,
        toPaymentHandles: player.paymentHandles,
        amount: player.settlement,
      })
    } else if (player.settlement < 0) {
      // Player owes bank
      debts.push({
        fromPlayerId: player.playerId,
        fromDisplayName: player.displayName,
        toPlayerId: hostId,
        toDisplayName: hostDisplayName,
        toPaymentHandles: hostPaymentHandles,
        amount: Math.abs(player.settlement),
      })
    }
    // If settlement === 0, no debt either way
  }

  // Check if game is complete (all players have cashed out)
  const isComplete = playerSettlements.every((p) => p.hasCashedOut)

  // Calculate total chips in play
  const totalInPlay = playerSettlements.reduce((sum, p) => sum + p.totalBuyIns, 0)

  return {
    players: playerSettlements,
    debts,
    isComplete,
    totalInPlay,
  }
}

/**
 * Format a currency amount for display
 */
export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount < 0 ? `-${formatted}` : formatted
}

/**
 * Format a net amount with color indicator
 * Returns { text: string, isPositive: boolean, isNegative: boolean, isZero: boolean }
 */
export function formatNetAmount(amount: number): {
  text: string
  isPositive: boolean
  isNegative: boolean
  isZero: boolean
} {
  const formatted = formatCurrency(Math.abs(amount))

  if (amount > 0) {
    return { text: `+${formatted}`, isPositive: true, isNegative: false, isZero: false }
  } else if (amount < 0) {
    return { text: `-${formatted}`, isPositive: false, isNegative: true, isZero: false }
  } else {
    return { text: formatted, isPositive: false, isNegative: false, isZero: true }
  }
}
