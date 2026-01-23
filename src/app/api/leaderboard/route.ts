import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface LeaderboardEntry {
  userId: string
  displayName: string
  totalNet: number
  gamesPlayed: number
}

interface LeaderboardData {
  winners: LeaderboardEntry[]
  losers: LeaderboardEntry[]
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

    // Get all users with their completed game data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
      },
    })

    // Calculate net profit/loss for each user
    const userStats: LeaderboardEntry[] = []

    for (const u of users) {
      // Get all completed games the user participated in
      const completedGames = await prisma.game.findMany({
        where: {
          status: 'completed',
          OR: [
            { hostId: u.id },
            { players: { some: { playerId: u.id } } },
          ],
        },
        include: {
          buyIns: {
            where: {
              playerId: u.id,
              approved: true,
            },
          },
          cashOuts: {
            where: {
              playerId: u.id,
            },
          },
        },
      })

      // Skip users with no completed games
      if (completedGames.length === 0) {
        continue
      }

      let totalNet = 0

      for (const game of completedGames) {
        const totalBuyIns = game.buyIns.reduce(
          (sum, buyIn) => sum + Number(buyIn.amount),
          0
        )
        const cashOutAmount = game.cashOuts[0] ? Number(game.cashOuts[0].amount) : 0
        totalNet += cashOutAmount - totalBuyIns
      }

      userStats.push({
        userId: u.id,
        displayName: u.displayName,
        totalNet: Math.round(totalNet * 100) / 100,
        gamesPlayed: completedGames.length,
      })
    }

    // Sort by totalNet descending for winners (highest profit first)
    const sortedByProfit = [...userStats].sort((a, b) => b.totalNet - a.totalNet)

    // Get top 3 winners (positive or highest net)
    const winners = sortedByProfit.slice(0, 3)

    // Sort by totalNet ascending for losers (biggest loss first)
    const sortedByLoss = [...userStats].sort((a, b) => a.totalNet - b.totalNet)

    // Get top 3 losers (most negative or lowest net)
    const losers = sortedByLoss.slice(0, 3)

    const leaderboard: LeaderboardData = {
      winners,
      losers,
    }

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
