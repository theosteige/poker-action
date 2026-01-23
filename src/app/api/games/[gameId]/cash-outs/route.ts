import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  createCashOut,
  hasPlayerCashedOut,
  isPlayerInGame,
  getPlayerCount,
  getCashOutCount,
  updateGameStatus,
} from '@/lib/db'

const cashOutSchema = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { gameId } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = cashOutSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { playerId, amount } = validationResult.data

    // Fetch the game to verify host and status
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        hostId: true,
        status: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only host can cash out players
    if (game.hostId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the bank (host) can cash out players' },
        { status: 403 }
      )
    }

    if (game.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cash out players in a completed game' },
        { status: 400 }
      )
    }

    // Check if player is in the game
    const playerInGame = await isPlayerInGame(gameId, playerId)
    if (!playerInGame) {
      return NextResponse.json(
        { error: 'Player is not in this game' },
        { status: 400 }
      )
    }

    // Check if player has already cashed out
    const alreadyCashedOut = await hasPlayerCashedOut(gameId, playerId)
    if (alreadyCashedOut) {
      return NextResponse.json(
        { error: 'Player has already cashed out' },
        { status: 400 }
      )
    }

    // Create the cash-out
    const cashOut = await createCashOut({
      gameId,
      playerId,
      amount,
    })

    // Check if all players have cashed out - if so, mark game as completed
    const totalPlayers = await getPlayerCount(gameId)
    const totalCashOuts = await getCashOutCount(gameId)

    let gameCompleted = false
    if (totalCashOuts >= totalPlayers) {
      await updateGameStatus(gameId, 'completed')
      gameCompleted = true
    } else if (game.status === 'upcoming') {
      // If game was upcoming and someone cashed out, mark as active
      await updateGameStatus(gameId, 'active')
    }

    return NextResponse.json({
      message: 'Player cashed out successfully',
      cashOut: {
        playerId: cashOut.playerId,
        amount: cashOut.amount.toString(),
        timestamp: cashOut.timestamp.toISOString(),
      },
      gameCompleted,
    })
  } catch (error) {
    console.error('Error creating cash-out:', error)
    return NextResponse.json(
      { error: 'Failed to cash out player' },
      { status: 500 }
    )
  }
}
