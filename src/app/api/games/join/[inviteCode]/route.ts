import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGameByInviteCode } from '@/lib/db/games'
import { addPlayerToGame, isPlayerInGame, getPlayerCount } from '@/lib/db/game-players'

interface RouteParams {
  params: Promise<{ inviteCode: string }>
}

/**
 * GET /api/games/join/[inviteCode]
 * Returns game info if valid invite code
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { inviteCode } = await params

    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    const game = await getGameByInviteCode(inviteCode)

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Check if user is already in the game
    const alreadyJoined = await isPlayerInGame(game.id, user.userId)

    // Get player count
    const playerCount = await getPlayerCount(game.id)

    return NextResponse.json({
      game: {
        id: game.id,
        scheduledTime: game.scheduledTime,
        location: game.location,
        bigBlindAmount: game.bigBlindAmount.toString(),
        status: game.status,
        host: game.host,
        playerCount,
      },
      alreadyJoined,
      isHost: game.hostId === user.userId,
    })
  } catch (error) {
    console.error('Error fetching game by invite code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/games/join/[inviteCode]
 * Adds current user to the game
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { inviteCode } = await params

    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    const game = await getGameByInviteCode(inviteCode)

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Check if game is completed
    if (game.status === 'completed') {
      return NextResponse.json(
        { error: 'This game has already been completed' },
        { status: 400 }
      )
    }

    // Check if user is already in the game
    const alreadyJoined = await isPlayerInGame(game.id, user.userId)

    if (alreadyJoined) {
      return NextResponse.json({
        message: 'Already joined',
        gameId: game.id,
        alreadyJoined: true,
      })
    }

    // Add player to game
    await addPlayerToGame(game.id, user.userId)

    return NextResponse.json({
      message: 'Successfully joined game',
      gameId: game.id,
      alreadyJoined: false,
    })
  } catch (error) {
    console.error('Error joining game:', error)
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    )
  }
}
