import { PrismaClient } from '@/generated/prisma'

// Prevent multiple Prisma instances in development
// Next.js hot reloads can create multiple instances

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
