import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGamesByUserId, createGame } from '@/lib/db/games'
import { addPlayerToGame } from '@/lib/db/game-players'
import { createGameSchema } from '@/lib/validations/game'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const games = await getGamesByUserId(user.userId)

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = createGameSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    const { scheduledTime, location, bigBlindAmount } = validationResult.data

    const game = await createGame({
      hostId: user.userId,
      scheduledTime: new Date(scheduledTime),
      location,
      bigBlindAmount,
    })

    // Add the host as a player in the game
    await addPlayerToGame(game.id, user.userId)

    // Generate the full invite URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/games/join/${game.inviteCode}`

    return NextResponse.json(
      {
        game: {
          ...game,
          inviteUrl,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}
