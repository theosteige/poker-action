import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { approveBuyIn, denyBuyIn, markBuyInAsPaid } from '@/lib/db'

const actionSchema = z.object({
  action: z.enum(['approve', 'deny', 'togglePaid']),
  paidToBank: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; buyInId: string }> }
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

    const { gameId, buyInId } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = actionSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { action, paidToBank } = validationResult.data

    // Fetch the game to verify host
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

    // Only host can manage buy-ins
    if (game.hostId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the bank (host) can manage buy-ins' },
        { status: 403 }
      )
    }

    if (game.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot modify buy-ins in a completed game' },
        { status: 400 }
      )
    }

    // Verify the buy-in exists and belongs to this game
    const buyIn = await prisma.buyIn.findUnique({
      where: { id: buyInId },
      select: {
        id: true,
        gameId: true,
        approved: true,
        paidToBank: true,
      },
    })

    if (!buyIn) {
      return NextResponse.json({ error: 'Buy-in not found' }, { status: 404 })
    }

    if (buyIn.gameId !== gameId) {
      return NextResponse.json(
        { error: 'Buy-in does not belong to this game' },
        { status: 400 }
      )
    }

    // Perform the action
    switch (action) {
      case 'approve': {
        if (buyIn.approved) {
          return NextResponse.json(
            { error: 'Buy-in is already approved' },
            { status: 400 }
          )
        }
        const updated = await approveBuyIn(buyInId)
        return NextResponse.json({
          message: 'Buy-in approved',
          buyIn: {
            id: updated.id,
            approved: updated.approved,
            paidToBank: updated.paidToBank,
          },
        })
      }

      case 'deny': {
        if (buyIn.approved) {
          return NextResponse.json(
            { error: 'Cannot deny an already approved buy-in' },
            { status: 400 }
          )
        }
        await denyBuyIn(buyInId)
        return NextResponse.json({ message: 'Buy-in request denied' })
      }

      case 'togglePaid': {
        if (!buyIn.approved) {
          return NextResponse.json(
            { error: 'Cannot modify paid status of unapproved buy-in' },
            { status: 400 }
          )
        }
        const newPaidStatus = paidToBank !== undefined ? paidToBank : !buyIn.paidToBank
        const updated = await markBuyInAsPaid(buyInId, newPaidStatus)
        return NextResponse.json({
          message: `Buy-in marked as ${newPaidStatus ? 'paid' : 'unpaid'}`,
          buyIn: {
            id: updated.id,
            approved: updated.approved,
            paidToBank: updated.paidToBank,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating buy-in:', error)
    return NextResponse.json(
      { error: 'Failed to update buy-in' },
      { status: 500 }
    )
  }
}
