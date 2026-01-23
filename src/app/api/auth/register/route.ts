import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { createUser, isDisplayNameTaken } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]
      return NextResponse.json(
        { error: firstIssue?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { displayName, password } = validation.data

    const nameTaken = await isDisplayNameTaken(displayName)
    if (nameTaken) {
      return NextResponse.json(
        { error: 'Display name is already taken' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const user = await createUser({
      displayName,
      passwordHash,
      paymentHandles: [],
    })

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
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
