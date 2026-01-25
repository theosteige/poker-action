import { prisma } from '@/lib/prisma'
import type { JoinRequest } from '@/generated/prisma'

export type JoinRequestStatus = 'pending' | 'approved' | 'denied'

export type JoinRequestWithPlayer = JoinRequest & {
  player: {
    id: string
    displayName: string
  }
}

export type JoinRequestWithGame = JoinRequest & {
  game: {
    id: string
    location: string
    scheduledTime: Date
  }
}

/**
 * Create a new join request
 */
export async function createJoinRequest(
  gameId: string,
  playerId: string
): Promise<JoinRequest> {
  return prisma.joinRequest.create({
    data: {
      gameId,
      playerId,
      status: 'pending',
    },
  })
}

/**
 * Get all join requests for a game
 */
export async function getJoinRequestsForGame(
  gameId: string
): Promise<JoinRequestWithPlayer[]> {
  return prisma.joinRequest.findMany({
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
      requestedAt: 'desc',
    },
  })
}

/**
 * Get pending join requests for a game
 */
export async function getPendingJoinRequestsForGame(
  gameId: string
): Promise<JoinRequestWithPlayer[]> {
  return prisma.joinRequest.findMany({
    where: {
      gameId,
      status: 'pending',
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
      requestedAt: 'asc',
    },
  })
}

/**
 * Update join request status (approve or deny)
 */
export async function updateJoinRequestStatus(
  requestId: string,
  status: JoinRequestStatus
): Promise<JoinRequest> {
  return prisma.joinRequest.update({
    where: { id: requestId },
    data: {
      status,
      respondedAt: new Date(),
    },
  })
}

/**
 * Get join request by player and game
 */
export async function getJoinRequestByPlayerAndGame(
  playerId: string,
  gameId: string
): Promise<JoinRequest | null> {
  return prisma.joinRequest.findUnique({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
  })
}

/**
 * Get join request by ID
 */
export async function getJoinRequestById(
  requestId: string
): Promise<JoinRequestWithPlayer | null> {
  return prisma.joinRequest.findUnique({
    where: { id: requestId },
    include: {
      player: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  })
}

/**
 * Delete a join request
 */
export async function deleteJoinRequest(requestId: string): Promise<void> {
  await prisma.joinRequest.delete({
    where: { id: requestId },
  })
}

/**
 * Get all join requests for a user
 */
export async function getJoinRequestsByUserId(
  userId: string
): Promise<JoinRequestWithGame[]> {
  return prisma.joinRequest.findMany({
    where: { playerId: userId },
    include: {
      game: {
        select: {
          id: true,
          location: true,
          scheduledTime: true,
        },
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  })
}

/**
 * Check if user has a pending join request for a game
 */
export async function hasPendingJoinRequest(
  playerId: string,
  gameId: string
): Promise<boolean> {
  const request = await prisma.joinRequest.findUnique({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
  })
  return request?.status === 'pending'
}

/**
 * Get pending join request count for a game
 */
export async function getPendingJoinRequestCount(gameId: string): Promise<number> {
  return prisma.joinRequest.count({
    where: {
      gameId,
      status: 'pending',
    },
  })
}
