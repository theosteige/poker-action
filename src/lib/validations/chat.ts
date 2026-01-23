import { z } from 'zod'

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>
