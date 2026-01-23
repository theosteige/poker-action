import { prisma } from '@/lib/prisma'
import type { User } from '@/generated/prisma'

export type PaymentHandle = {
  type: 'venmo' | 'zelle' | 'cash'
  handle: string
}

export type CreateUserInput = {
  displayName: string
  passwordHash: string
  paymentHandles?: PaymentHandle[]
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      paymentHandles: input.paymentHandles ?? [],
    },
  })
}

/**
 * Get user by display name (for login)
 */
export async function getUserByDisplayName(displayName: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { displayName },
  })
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}

/**
 * Get user by ID without password hash (for public display)
 */
export async function getUserByIdSafe(id: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      paymentHandles: true,
      createdAt: true,
    },
  })
  return user
}

/**
 * Update user's payment handles
 */
export async function updateUserPaymentHandles(
  userId: string,
  paymentHandles: PaymentHandle[]
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { paymentHandles },
  })
}

/**
 * Check if display name is already taken
 */
export async function isDisplayNameTaken(displayName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { displayName },
    select: { id: true },
  })
  return user !== null
}
