import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateGameSettlement, type PlayerGameData, type PaymentHandle } from '@/lib/settlement'
import { Prisma } from '@/generated/prisma'

const DEFAULT_PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10)))
    const skip = (page - 1) * pageSize

    // Get total count of completed games for the user
    const totalCount = await prisma.game.count({
      where: {
        status: 'completed',
        OR: [
          { hostId: user.userId },
          { players: { some: { playerId: user.userId } } },
        ],
      },
    })

    // Get completed games with full ledger data
    const games = await prisma.game.findMany({
      where: {
        status: 'completed',
        OR: [
          { hostId: user.userId },
          { players: { some: { playerId: user.userId } } },
        ],
      },
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
          },
        },
        players: {
          include: {
            player: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        buyIns: {
          where: {
            approved: true,
          },
        },
        cashOuts: true,
      },
      orderBy: {
        scheduledTime: 'desc',
      },
      skip,
      take: pageSize,
    })

    // Transform games with settlement data
    const gamesWithSettlement = games.map((game) => {
      // Build PlayerGameData for settlement calculation
      const playerGameDataMap = new Map<string, PlayerGameData>()

      // Initialize all players
      for (const gp of game.players) {
        playerGameDataMap.set(gp.player.id, {
          playerId: gp.player.id,
          displayName: gp.player.displayName,
          paymentHandles: [] as PaymentHandle[],
          buyIns: [],
          cashOut: null,
        })
      }

      // Add buy-ins to each player
      for (const bi of game.buyIns) {
        const playerData = playerGameDataMap.get(bi.playerId)
        if (playerData) {
          playerData.buyIns.push({
            amount: bi.amount,
            paidToBank: bi.paidToBank,
            approved: bi.approved,
          })
        }
      }

      // Add cash-outs to each player
      for (const co of game.cashOuts) {
        const playerData = playerGameDataMap.get(co.playerId)
        if (playerData) {
          playerData.cashOut = { amount: co.amount }
        }
      }

      const playerGameData = Array.from(playerGameDataMap.values())

      // Calculate settlement
      const settlement = calculateGameSettlement(playerGameData, game.hostId)

      // Find current user's net result
      const userSettlement = settlement.players.find((p) => p.playerId === user.userId)
      const userNet = userSettlement ? userSettlement.netChips : 0

      return {
        id: game.id,
        scheduledTime: game.scheduledTime.toISOString(),
        location: game.location,
        bigBlindAmount: (game.bigBlindAmount as Prisma.Decimal).toString(),
        status: game.status,
        host: {
          id: game.host.id,
          displayName: game.host.displayName,
        },
        playerCount: game.players.length,
        userNet,
        isHost: game.hostId === user.userId,
      }
    })

    return NextResponse.json({
      games: gamesWithSettlement,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: page * pageSize < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching game history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game history' },
      { status: 500 }
    )
  }
}
