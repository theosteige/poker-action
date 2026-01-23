import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { getUserByDisplayName } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]
      return NextResponse.json(
        { error: firstIssue?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { displayName, password } = validation.data

    const user = await getUserByDisplayName(displayName)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid display name or password' },
        { status: 401 }
      )
    }

    const validPassword = await verifyPassword(password, user.passwordHash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid display name or password' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user.id,
      displayName: user.displayName,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        paymentHandles: user.paymentHandles,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
