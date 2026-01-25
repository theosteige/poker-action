import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGameById } from '@/lib/db/games'
import { isPlayerInGame } from '@/lib/db/game-players'
import {
  createJoinRequest,
  getJoinRequestByPlayerAndGame,
  getPendingJoinRequestsForGame,
  deleteJoinRequest,
} from '@/lib/db/join-requests'

interface RouteParams {
  params: Promise<{ gameId: string }>
}

/**
 * GET /api/games/[gameId]/join-requests
 * Get pending join requests for a game (host only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId } = await params

    // Get the game
    const game = await getGameById(gameId)

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only host can view join requests
    if (game.hostId !== user.userId) {
      return NextResponse.json(
        { error: 'Only the host can view join requests' },
        { status: 403 }
      )
    }

    // Get pending join requests
    const requests = await getPendingJoinRequestsForGame(gameId)

    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        id: r.id,
        gameId: r.gameId,
        playerId: r.playerId,
        playerName: r.player.displayName,
        status: r.status,
        requestedAt: r.requestedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching join requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/games/[gameId]/join-requests
 * Create a join request for a game (player requests to join)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId } = await params

    // Get the game
    const game = await getGameById(gameId)

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if user is the host (hosts don't need to request)
    if (game.hostId === user.userId) {
      return NextResponse.json(
        { error: 'You are the host of this game' },
        { status: 400 }
      )
    }

    // Check if game is upcoming (can only request to join upcoming games)
    if (game.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Can only request to join upcoming games' },
        { status: 400 }
      )
    }

    // Check if user is already in the game
    const isInGame = await isPlayerInGame(gameId, user.userId)
    if (isInGame) {
      return NextResponse.json(
        { error: 'You are already in this game' },
        { status: 400 }
      )
    }

    // Check if user already has a join request for this game
    const existingRequest = await getJoinRequestByPlayerAndGame(user.userId, gameId)

    if (existingRequest) {
      // If the request was denied, delete it and allow re-requesting
      if (existingRequest.status === 'denied') {
        await deleteJoinRequest(existingRequest.id)
      } else if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending request for this game' },
          { status: 400 }
        )
      } else if (existingRequest.status === 'approved') {
        // This shouldn't happen if they're added to the game on approval
        return NextResponse.json(
          { error: 'Your request has already been approved' },
          { status: 400 }
        )
      }
    }

    // Create the join request
    const joinRequest = await createJoinRequest(gameId, user.userId)

    return NextResponse.json({
      success: true,
      joinRequest: {
        id: joinRequest.id,
        gameId: joinRequest.gameId,
        playerId: joinRequest.playerId,
        status: joinRequest.status,
        requestedAt: joinRequest.requestedAt,
      },
    })
  } catch (error) {
    console.error('Error creating join request:', error)
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    )
  }
}
