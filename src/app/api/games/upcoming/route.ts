import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params for filtering/sorting
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'date' // 'date' or 'host'
    const hostFilter = searchParams.get('host') // filter by host name (partial match)

    // Build the where clause
    const where: {
      status: string
      host?: { displayName: { contains: string; mode: 'insensitive' } }
    } = {
      status: 'upcoming',
    }

    if (hostFilter) {
      where.host = {
        displayName: {
          contains: hostFilter,
          mode: 'insensitive',
        },
      }
    }

    // Fetch all upcoming games with host info and player count
    const games = await prisma.game.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
          },
        },
        players: {
          select: {
            playerId: true,
          },
        },
        joinRequests: {
          where: {
            playerId: user.userId,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy:
        sortBy === 'host'
          ? { host: { displayName: 'asc' } }
          : { scheduledTime: 'asc' },
    })

    // Transform the data to include player count and user's join status
    const gamesWithStatus = games.map((game) => {
      const isHost = game.hostId === user.userId
      const isPlayer = game.players.some((p) => p.playerId === user.userId)
      const joinRequest = game.joinRequests[0] || null

      return {
        id: game.id,
        scheduledTime: game.scheduledTime,
        location: game.location,
        bigBlindAmount: game.bigBlindAmount,
        status: game.status,
        inviteCode: game.inviteCode,
        createdAt: game.createdAt,
        host: game.host,
        playerCount: game.players.length,
        // User's relationship to this game
        isHost,
        isPlayer,
        joinRequestStatus: joinRequest?.status || null,
        joinRequestId: joinRequest?.id || null,
      }
    })

    return NextResponse.json({ games: gamesWithStatus })
  } catch (error) {
    console.error('Error fetching upcoming games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming games' },
      { status: 500 }
    )
  }
}
