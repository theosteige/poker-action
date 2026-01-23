import { z } from 'zod'

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(20, 'Display name must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Display name can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
