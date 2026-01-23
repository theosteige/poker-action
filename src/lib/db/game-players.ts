import { prisma } from '@/lib/prisma'
import type { GamePlayer } from '@/generated/prisma'

export type GamePlayerWithUser = GamePlayer & {
  player: {
    id: string
    displayName: string
    paymentHandles: unknown
  }
}

/**
 * Add a player to a game
 */
export async function addPlayerToGame(gameId: string, playerId: string): Promise<GamePlayer> {
  return prisma.gamePlayer.create({
    data: {
      gameId,
      playerId,
    },
  })
}

/**
 * Get all players in a game
 */
export async function getPlayersInGame(gameId: string): Promise<GamePlayerWithUser[]> {
  return prisma.gamePlayer.findMany({
    where: { gameId },
    include: {
      player: {
        select: {
          id: true,
          displayName: true,
          paymentHandles: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  })
}

/**
 * Check if a player is in a game
 */
export async function isPlayerInGame(gameId: string, playerId: string): Promise<boolean> {
  const gamePlayer = await prisma.gamePlayer.findUnique({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
    select: { gameId: true },
  })
  return gamePlayer !== null
}

/**
 * Get count of players in a game
 */
export async function getPlayerCount(gameId: string): Promise<number> {
  return prisma.gamePlayer.count({
    where: { gameId },
  })
}

/**
 * Remove a player from a game
 */
export async function removePlayerFromGame(gameId: string, playerId: string): Promise<void> {
  await prisma.gamePlayer.delete({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
  })
}
