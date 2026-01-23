import { prisma } from '@/lib/prisma'
import { Prisma, type Game } from '@/generated/prisma'

export type GameStatus = 'upcoming' | 'active' | 'completed'

export type CreateGameInput = {
  hostId: string
  scheduledTime: Date
  location: string
  bigBlindAmount: number | Prisma.Decimal
}

export type GameWithHost = Game & {
  host: {
    id: string
    displayName: string
  }
}

export type GameWithPlayers = Game & {
  host: {
    id: string
    displayName: string
  }
  players: {
    player: {
      id: string
      displayName: string
    }
    joinedAt: Date
  }[]
}

/**
 * Create a new game
 */
export async function createGame(input: CreateGameInput): Promise<Game> {
  return prisma.game.create({
    data: {
      hostId: input.hostId,
      scheduledTime: input.scheduledTime,
      location: input.location,
      bigBlindAmount: input.bigBlindAmount,
    },
  })
}

/**
 * Get game by invite code
 */
export async function getGameByInviteCode(inviteCode: string): Promise<GameWithHost | null> {
  return prisma.game.findUnique({
    where: { inviteCode },
    include: {
      host: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  })
}

/**
 * Get game by ID
 */
export async function getGameById(id: string): Promise<Game | null> {
  return prisma.game.findUnique({
    where: { id },
  })
}

/**
 * Get game by ID with host and players
 */
export async function getGameByIdWithPlayers(id: string): Promise<GameWithPlayers | null> {
  return prisma.game.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          displayName: true,
        },
      },
      players: {
        include: {
          player: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      },
    },
  })
}

/**
 * Get all games for a user (both hosted and joined)
 */
export async function getGamesByUserId(userId: string): Promise<GameWithHost[]> {
  return prisma.game.findMany({
    where: {
      OR: [
        { hostId: userId },
        { players: { some: { playerId: userId } } },
      ],
    },
    include: {
      host: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      scheduledTime: 'desc',
    },
  })
}

/**
 * Get upcoming games for a user
 */
export async function getUpcomingGamesByUserId(userId: string): Promise<GameWithHost[]> {
  return prisma.game.findMany({
    where: {
      OR: [
        { hostId: userId },
        { players: { some: { playerId: userId } } },
      ],
      status: 'upcoming',
    },
    include: {
      host: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      scheduledTime: 'asc',
    },
  })
}

/**
 * Update game status
 */
export async function updateGameStatus(gameId: string, status: GameStatus): Promise<Game> {
  return prisma.game.update({
    where: { id: gameId },
    data: { status },
  })
}

/**
 * Check if user is the host of a game
 */
export async function isUserGameHost(gameId: string, userId: string): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { hostId: true },
  })
  return game?.hostId === userId
}
