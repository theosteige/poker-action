import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PlayerStats {
  totalNet: number
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  averageBuyIn: number
}

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all completed games the user participated in
    const completedGames = await prisma.game.findMany({
      where: {
        status: 'completed',
        OR: [
          { hostId: user.userId },
          { players: { some: { playerId: user.userId } } },
        ],
      },
      include: {
        buyIns: {
          where: {
            playerId: user.userId,
            approved: true,
          },
        },
        cashOuts: {
          where: {
            playerId: user.userId,
          },
        },
      },
    })

    let totalNet = 0
    let totalBuyInAmount = 0
    let gamesWon = 0
    let gamesLost = 0

    for (const game of completedGames) {
      const buyIns = game.buyIns
      const cashOut = game.cashOuts[0]

      const totalBuyIns = buyIns.reduce(
        (sum, buyIn) => sum + Number(buyIn.amount),
        0
      )
      const cashOutAmount = cashOut ? Number(cashOut.amount) : 0

      const netForGame = cashOutAmount - totalBuyIns
      totalNet += netForGame
      totalBuyInAmount += totalBuyIns

      if (netForGame > 0) {
        gamesWon++
      } else if (netForGame < 0) {
        gamesLost++
      }
    }

    const gamesPlayed = completedGames.length
    const averageBuyIn = gamesPlayed > 0 ? totalBuyInAmount / gamesPlayed : 0

    const stats: PlayerStats = {
      totalNet: Math.round(totalNet * 100) / 100,
      gamesPlayed,
      gamesWon,
      gamesLost,
      averageBuyIn: Math.round(averageBuyIn * 100) / 100,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
