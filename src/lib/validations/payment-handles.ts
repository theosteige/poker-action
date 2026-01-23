import { z } from 'zod'

export const paymentHandleTypeSchema = z.enum(['venmo', 'zelle', 'cash'])

export const paymentHandleSchema = z.object({
  type: paymentHandleTypeSchema,
  handle: z
    .string()
    .min(1, 'Handle is required')
    .max(100, 'Handle must be at most 100 characters'),
})

export const paymentHandlesArraySchema = z
  .array(paymentHandleSchema)
  .max(10, 'You can have at most 10 payment handles')

export const updatePaymentHandlesSchema = z.object({
  paymentHandles: paymentHandlesArraySchema,
})

export type PaymentHandleType = z.infer<typeof paymentHandleTypeSchema>
export type PaymentHandle = z.infer<typeof paymentHandleSchema>
export type UpdatePaymentHandlesInput = z.infer<typeof updatePaymentHandlesSchema>
