import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateUserPaymentHandles, getUserByIdSafe } from '@/lib/db/users'
import { updatePaymentHandlesSchema } from '@/lib/validations/payment-handles'

export async function PUT(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = updatePaymentHandlesSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    const { paymentHandles } = parsed.data

    await updateUserPaymentHandles(tokenPayload.userId, paymentHandles)

    const user = await getUserByIdSafe(tokenPayload.userId)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update payment handles error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

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

    return NextResponse.json({ paymentHandles: user.paymentHandles || [] })
  } catch (error) {
    console.error('Get payment handles error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
