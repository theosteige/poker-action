import { prisma } from '@/lib/prisma'
import type { ChatMessage } from '@/generated/prisma'

export type ChatMessageWithUser = ChatMessage & {
  user: {
    id: string
    displayName: string
  }
}

export type CreateMessageInput = {
  userId: string
  content: string
}

export type PaginatedMessages = {
  messages: ChatMessageWithUser[]
  hasMore: boolean
  nextCursor: string | null
}

/**
 * Create a new chat message
 */
export async function createMessage(input: CreateMessageInput): Promise<ChatMessageWithUser> {
  return prisma.chatMessage.create({
    data: {
      userId: input.userId,
      content: input.content,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  })
}

/**
 * Get recent messages (paginated, newest first)
 */
export async function getRecentMessages(
  limit: number = 100,
  cursor?: string
): Promise<PaginatedMessages> {
  const messages = await prisma.chatMessage.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const hasMore = messages.length > limit
  const resultMessages = hasMore ? messages.slice(0, -1) : messages
  const nextCursor = hasMore ? resultMessages[resultMessages.length - 1]?.id ?? null : null

  return {
    messages: resultMessages,
    hasMore,
    nextCursor,
  }
}

/**
 * Get messages in chronological order (for display)
 */
export async function getMessagesChronological(limit: number = 100): Promise<ChatMessageWithUser[]> {
  const messages = await prisma.chatMessage.findMany({
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Reverse to get chronological order (oldest first)
  return messages.reverse()
}

/**
 * Get messages since a specific timestamp (for real-time updates)
 */
export async function getMessagesSince(timestamp: Date): Promise<ChatMessageWithUser[]> {
  return prisma.chatMessage.findMany({
    where: {
      createdAt: {
        gt: timestamp,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

/**
 * Delete a message (for moderation if needed)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  await prisma.chatMessage.delete({
    where: { id: messageId },
  })
}

/**
 * Get message count (for stats)
 */
export async function getMessageCount(): Promise<number> {
  return prisma.chatMessage.count()
}

/**
 * Get message count for a specific user
 */
export async function getUserMessageCount(userId: string): Promise<number> {
  return prisma.chatMessage.count({
    where: { userId },
  })
}
