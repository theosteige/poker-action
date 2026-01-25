import { z } from 'zod'

export const createGameSchema = z.object({
  scheduledTime: z
    .string()
    .min(1, 'Scheduled time is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: 'Invalid date format' }
    )
    .refine(
      (val) => {
        const date = new Date(val)
        return date > new Date()
      },
      { message: 'Scheduled time must be in the future' }
    ),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be 200 characters or less'),
  bigBlindAmount: z
    .number()
    .positive('Big blind must be a positive number')
    .max(10000, 'Big blind must be 10,000 or less'),
})

export type CreateGameInput = z.infer<typeof createGameSchema>

export const updateGameSchema = z.object({
  scheduledTime: z
    .string()
    .min(1, 'Scheduled time is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: 'Invalid date format' }
    )
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be 200 characters or less')
    .optional(),
})

export type UpdateGameInput = z.infer<typeof updateGameSchema>
