import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGameById } from '@/lib/db/games'
import { addPlayerToGame } from '@/lib/db/game-players'
import {
  getJoinRequestById,
  updateJoinRequestStatus,
} from '@/lib/db/join-requests'

interface RouteParams {
  params: Promise<{ gameId: string; requestId: string }>
}

/**
 * PATCH /api/games/[gameId]/join-requests/[requestId]
 * Approve or deny a join request (host only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId, requestId } = await params

    // Get the game
    const game = await getGameById(gameId)

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only host can approve/deny join requests
    if (game.hostId !== user.userId) {
      return NextResponse.json(
        { error: 'Only the host can approve or deny join requests' },
        { status: 403 }
      )
    }

    // Get the join request
    const joinRequest = await getJoinRequestById(requestId)

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      )
    }

    // Verify the request belongs to this game
    if (joinRequest.gameId !== gameId) {
      return NextResponse.json(
        { error: 'Join request does not belong to this game' },
        { status: 400 }
      )
    }

    // Verify the request is still pending
    if (joinRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { action } = body as { action: 'approve' | 'deny' }

    if (action !== 'approve' && action !== 'deny') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "deny"' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Update join request status to approved
      await updateJoinRequestStatus(requestId, 'approved')

      // Add player to the game
      await addPlayerToGame(gameId, joinRequest.playerId)

      return NextResponse.json({
        success: true,
        message: `${joinRequest.player.displayName} has been added to the game`,
        action: 'approved',
      })
    } else {
      // Update join request status to denied
      await updateJoinRequestStatus(requestId, 'denied')

      return NextResponse.json({
        success: true,
        message: `Join request from ${joinRequest.player.displayName} has been denied`,
        action: 'denied',
      })
    }
  } catch (error) {
    console.error('Error processing join request:', error)
    return NextResponse.json(
      { error: 'Failed to process join request' },
      { status: 500 }
    )
  }
}
