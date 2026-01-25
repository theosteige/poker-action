import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  calculateGameSettlement,
  type PlayerGameData,
  type PaymentHandle,
} from '@/lib/settlement'
import { updateGameSchema } from '@/lib/validations/game'

export const dynamic = 'force-dynamic'

export async function GET(
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

    // Fetch the game with all related data
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
            paymentHandles: true,
          },
        },
        players: {
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
        },
        buyIns: {
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
        },
        cashOuts: {
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
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if user is a player in this game
    const isPlayer = game.players.some((gp) => gp.playerId === payload.userId)
    const isHost = game.hostId === payload.userId

    if (!isPlayer && !isHost) {
      return NextResponse.json(
        { error: 'You are not a player in this game' },
        { status: 403 }
      )
    }

    // Build player game data for settlement calculation
    const playerGameData: PlayerGameData[] = game.players.map((gp) => {
      const playerBuyIns = game.buyIns.filter(
        (bi) => bi.playerId === gp.playerId
      )
      const playerCashOut = game.cashOuts.find(
        (co) => co.playerId === gp.playerId
      )

      return {
        playerId: gp.playerId,
        displayName: gp.player.displayName,
        paymentHandles: (gp.player.paymentHandles as unknown as PaymentHandle[]) ?? [],
        buyIns: playerBuyIns.map((bi) => ({
          amount: bi.amount,
          paidToBank: bi.paidToBank,
          approved: bi.approved,
        })),
        cashOut: playerCashOut ? { amount: playerCashOut.amount } : null,
      }
    })

    // Calculate settlement
    const settlement = calculateGameSettlement(playerGameData, game.hostId)

    // Format response
    const response = {
      game: {
        id: game.id,
        scheduledTime: game.scheduledTime.toISOString(),
        location: game.location,
        bigBlindAmount: game.bigBlindAmount.toString(),
        status: game.status,
        inviteCode: game.inviteCode,
        createdAt: game.createdAt.toISOString(),
        host: {
          id: game.host.id,
          displayName: game.host.displayName,
          paymentHandles: (game.host.paymentHandles as unknown as PaymentHandle[]) ?? [],
        },
      },
      players: game.players.map((gp) => ({
        id: gp.playerId,
        displayName: gp.player.displayName,
        paymentHandles: (gp.player.paymentHandles as unknown as PaymentHandle[]) ?? [],
        joinedAt: gp.joinedAt.toISOString(),
        isHost: gp.playerId === game.hostId,
      })),
      buyIns: game.buyIns.map((bi) => ({
        id: bi.id,
        playerId: bi.playerId,
        playerDisplayName: bi.player.displayName,
        amount: bi.amount.toString(),
        paidToBank: bi.paidToBank,
        requestedByPlayer: bi.requestedByPlayer,
        approved: bi.approved,
        timestamp: bi.timestamp.toISOString(),
      })),
      cashOuts: game.cashOuts.map((co) => ({
        playerId: co.playerId,
        playerDisplayName: co.player.displayName,
        amount: co.amount.toString(),
        timestamp: co.timestamp.toISOString(),
      })),
      settlement: {
        players: settlement.players.map((ps) => ({
          playerId: ps.playerId,
          displayName: ps.displayName,
          paymentHandles: ps.paymentHandles,
          totalBuyIns: ps.totalBuyIns,
          unpaidBuyIns: ps.unpaidBuyIns,
          cashOut: ps.cashOut,
          netChips: ps.netChips,
          settlement: ps.settlement,
          hasCashedOut: ps.hasCashedOut,
        })),
        debts: settlement.debts,
        isComplete: settlement.isComplete,
        totalInPlay: settlement.totalInPlay,
      },
      currentUser: {
        id: payload.userId,
        isHost,
        isPlayer,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Fetch the game to check permissions and status
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, hostId: true, status: true },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only host can delete game
    if (game.hostId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the host can delete this game' },
        { status: 403 }
      )
    }

    // Can only delete upcoming games
    if (game.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Only upcoming games can be deleted. Active or completed games cannot be deleted.' },
        { status: 400 }
      )
    }

    // Delete the game (cascade will handle GamePlayer, BuyIn, CashOut records)
    await prisma.game.delete({
      where: { id: gameId },
    })

    return NextResponse.json({ success: true, message: 'Game deleted successfully' })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Fetch the game to check permissions
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, hostId: true },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only host can edit game details
    if (game.hostId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the host can edit game details' },
        { status: 403 }
      )
    }

    // Parse and validate the request body
    const body = await request.json()
    const validationResult = updateGameSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { scheduledTime, location } = validationResult.data

    // Build update data object with only provided fields
    const updateData: { scheduledTime?: Date; location?: string } = {}

    if (scheduledTime !== undefined) {
      updateData.scheduledTime = new Date(scheduledTime)
    }

    if (location !== undefined) {
      updateData.location = location
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update the game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
      select: {
        id: true,
        scheduledTime: true,
        location: true,
        bigBlindAmount: true,
        status: true,
        inviteCode: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      game: {
        id: updatedGame.id,
        scheduledTime: updatedGame.scheduledTime.toISOString(),
        location: updatedGame.location,
        bigBlindAmount: updatedGame.bigBlindAmount.toString(),
        status: updatedGame.status,
        inviteCode: updatedGame.inviteCode,
        createdAt: updatedGame.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    )
  }
}
