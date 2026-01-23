import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getGamesByUserId } from '@/lib/db/games'

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
