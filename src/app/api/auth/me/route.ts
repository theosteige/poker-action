import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserByIdSafe } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserByIdSafe(tokenPayload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
