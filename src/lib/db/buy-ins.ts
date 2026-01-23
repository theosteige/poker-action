import { prisma } from '@/lib/prisma'
import { Prisma, type BuyIn } from '@/generated/prisma'

const { Decimal } = Prisma

export type BuyInWithPlayer = BuyIn & {
  player: {
    id: string
    displayName: string
  }
}

export type CreateBuyInInput = {
  gameId: string
  playerId: string
  amount: number | Prisma.Decimal
  paidToBank?: boolean
  requestedByPlayer?: boolean
  approved?: boolean
}

/**
 * Create a buy-in (by host or as a request by player)
 */
export async function createBuyIn(input: CreateBuyInInput): Promise<BuyIn> {
  return prisma.buyIn.create({
    data: {
      gameId: input.gameId,
      playerId: input.playerId,
      amount: input.amount,
      paidToBank: input.paidToBank ?? false,
      requestedByPlayer: input.requestedByPlayer ?? false,
      approved: input.approved ?? true,
    },
  })
}

/**
 * Get all buy-ins for a game
 */
export async function getBuyInsForGame(gameId: string): Promise<BuyInWithPlayer[]> {
  return prisma.buyIn.findMany({
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
 * Get approved buy-ins for a game
 */
export async function getApprovedBuyInsForGame(gameId: string): Promise<BuyInWithPlayer[]> {
  return prisma.buyIn.findMany({
    where: {
      gameId,
      approved: true,
    },
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
 * Get pending buy-in requests for a game (host view)
 */
export async function getPendingBuyInRequests(gameId: string): Promise<BuyInWithPlayer[]> {
  return prisma.buyIn.findMany({
    where: {
      gameId,
      requestedByPlayer: true,
      approved: false,
    },
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
 * Approve a buy-in request
 */
export async function approveBuyIn(buyInId: string): Promise<BuyIn> {
  return prisma.buyIn.update({
    where: { id: buyInId },
    data: { approved: true },
  })
}

/**
 * Deny (delete) a buy-in request
 */
export async function denyBuyIn(buyInId: string): Promise<void> {
  await prisma.buyIn.delete({
    where: { id: buyInId },
  })
}

/**
 * Mark a buy-in as paid to bank
 */
export async function markBuyInAsPaid(buyInId: string, paid: boolean = true): Promise<BuyIn> {
  return prisma.buyIn.update({
    where: { id: buyInId },
    data: { paidToBank: paid },
  })
}

/**
 * Get buy-ins for a specific player in a game
 */
export async function getPlayerBuyIns(gameId: string, playerId: string): Promise<BuyIn[]> {
  return prisma.buyIn.findMany({
    where: {
      gameId,
      playerId,
      approved: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  })
}

/**
 * Get total buy-in amount for a player in a game
 */
export async function getTotalBuyInAmount(gameId: string, playerId: string): Promise<Prisma.Decimal> {
  const result = await prisma.buyIn.aggregate({
    where: {
      gameId,
      playerId,
      approved: true,
    },
    _sum: {
      amount: true,
    },
  })
  return result._sum.amount ?? new Decimal(0)
}

/**
 * Get total unpaid buy-in amount for a player in a game
 */
export async function getUnpaidBuyInAmount(gameId: string, playerId: string): Promise<Prisma.Decimal> {
  const result = await prisma.buyIn.aggregate({
    where: {
      gameId,
      playerId,
      approved: true,
      paidToBank: false,
    },
    _sum: {
      amount: true,
    },
  })
  return result._sum.amount ?? new Decimal(0)
}
