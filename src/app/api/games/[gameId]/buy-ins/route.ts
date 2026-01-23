import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createBuyIn, isPlayerInGame } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const buyInSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(10000, 'Amount cannot exceed $10,000'),
  isRequest: z.boolean().optional().default(false),
  playerId: z.string().optional(), // Only for host adding buy-ins for other players
  paidToBank: z.boolean().optional().default(false),
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
    const validationResult = buyInSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { amount, isRequest, playerId, paidToBank } = validationResult.data

    // Fetch the game to check status and host
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

    if (game.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot add buy-ins to a completed game' },
        { status: 400 }
      )
    }

    const isHost = game.hostId === payload.userId

    // Determine target player
    let targetPlayerId = payload.userId

    if (playerId) {
      // Only host can add buy-ins for other players
      if (!isHost) {
        return NextResponse.json(
          { error: 'Only the bank can add buy-ins for other players' },
          { status: 403 }
        )
      }
      targetPlayerId = playerId
    }

    // Check if target player is in the game
    const playerInGame = await isPlayerInGame(gameId, targetPlayerId)
    if (!playerInGame) {
      return NextResponse.json(
        { error: 'Player is not in this game' },
        { status: 400 }
      )
    }

    // Create the buy-in
    if (isRequest && !isHost) {
      // Player is requesting a buy-in (needs approval)
      const buyIn = await createBuyIn({
        gameId,
        playerId: targetPlayerId,
        amount,
        paidToBank: false,
        requestedByPlayer: true,
        approved: false,
      })

      return NextResponse.json({
        message: 'Buy-in request submitted',
        buyIn: {
          id: buyIn.id,
          amount: buyIn.amount.toString(),
          paidToBank: buyIn.paidToBank,
          requestedByPlayer: buyIn.requestedByPlayer,
          approved: buyIn.approved,
        },
      })
    } else if (isHost) {
      // Host is directly adding a buy-in (auto-approved)
      const buyIn = await createBuyIn({
        gameId,
        playerId: targetPlayerId,
        amount,
        paidToBank,
        requestedByPlayer: false,
        approved: true,
      })

      return NextResponse.json({
        message: 'Buy-in added',
        buyIn: {
          id: buyIn.id,
          amount: buyIn.amount.toString(),
          paidToBank: buyIn.paidToBank,
          requestedByPlayer: buyIn.requestedByPlayer,
          approved: buyIn.approved,
        },
      })
    } else {
      // Non-host trying to add direct buy-in
      return NextResponse.json(
        { error: 'Only the bank can directly add buy-ins. Use isRequest: true to request a buy-in.' },
        { status: 403 }
      )
    }
  } catch (error) {
    console.error('Error creating buy-in:', error)
    return NextResponse.json(
      { error: 'Failed to create buy-in' },
      { status: 500 }
    )
  }
}
