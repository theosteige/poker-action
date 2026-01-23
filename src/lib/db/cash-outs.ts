import { prisma } from '@/lib/prisma'
import { Prisma, type CashOut } from '@/generated/prisma'

export type CashOutWithPlayer = CashOut & {
  player: {
    id: string
    displayName: string
  }
}

export type CreateCashOutInput = {
  gameId: string
  playerId: string
  amount: number | Prisma.Decimal
}

/**
 * Create a cash-out for a player (host only)
 */
export async function createCashOut(input: CreateCashOutInput): Promise<CashOut> {
  return prisma.cashOut.create({
    data: {
      gameId: input.gameId,
      playerId: input.playerId,
      amount: input.amount,
    },
  })
}

/**
 * Get all cash-outs for a game
 */
export async function getCashOutsForGame(gameId: string): Promise<CashOutWithPlayer[]> {
  return prisma.cashOut.findMany({
    where: { gameId },
    include: {
      player: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  })
}

/**
 * Check if a player has cashed out
 */
export async function hasPlayerCashedOut(gameId: string, playerId: string): Promise<boolean> {
  const cashOut = await prisma.cashOut.findUnique({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
    select: { gameId: true },
  })
  return cashOut !== null
}

/**
 * Get a player's cash-out for a game
 */
export async function getPlayerCashOut(gameId: string, playerId: string): Promise<CashOut | null> {
  return prisma.cashOut.findUnique({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
  })
}

/**
 * Update a cash-out amount
 */
export async function updateCashOut(
  gameId: string,
  playerId: string,
  amount: number | Prisma.Decimal
): Promise<CashOut> {
  return prisma.cashOut.update({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
    data: { amount },
  })
}

/**
 * Delete a cash-out (allow host to undo)
 */
export async function deleteCashOut(gameId: string, playerId: string): Promise<void> {
  await prisma.cashOut.delete({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
  })
}

/**
 * Get count of players who have cashed out in a game
 */
export async function getCashOutCount(gameId: string): Promise<number> {
  return prisma.cashOut.count({
    where: { gameId },
  })
}
