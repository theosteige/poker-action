import { describe, it, expect } from 'vitest'
import {
  paymentHandleTypeSchema,
  paymentHandleSchema,
  paymentHandlesArraySchema,
  updatePaymentHandlesSchema,
} from './payment-handles'

describe('paymentHandleTypeSchema', () => {
  it('should accept valid payment handle types', () => {
    const validTypes = ['venmo', 'zelle', 'cash']

    validTypes.forEach((type) => {
      const result = paymentHandleTypeSchema.safeParse(type)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid payment handle types', () => {
    const invalidTypes = ['paypal', 'bitcoin', 'credit', '', 'VENMO', 'Zelle']

    invalidTypes.forEach((type) => {
      const result = paymentHandleTypeSchema.safeParse(type)
      expect(result.success).toBe(false)
    })
  })

  it('should reject non-string values', () => {
    const invalidValues = [123, null, undefined, {}, []]

    invalidValues.forEach((value) => {
      const result = paymentHandleTypeSchema.safeParse(value)
      expect(result.success).toBe(false)
    })
  })
})

describe('paymentHandleSchema', () => {
  it('should accept valid payment handles', () => {
    const validHandles = [
      { type: 'venmo', handle: '@username' },
      { type: 'zelle', handle: 'user@email.com' },
      { type: 'cash', handle: 'Cash only' },
    ]

    validHandles.forEach((handle) => {
      const result = paymentHandleSchema.safeParse(handle)
      expect(result.success).toBe(true)
    })
  })

  it('should reject empty handle', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'venmo',
      handle: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required')
    }
  })

  it('should reject handle longer than 100 characters', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'venmo',
      handle: 'a'.repeat(101),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('100 characters')
    }
  })

  it('should accept handle with exactly 100 characters', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'venmo',
      handle: 'a'.repeat(100),
    })

    expect(result.success).toBe(true)
  })

  it('should reject invalid type', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'paypal',
      handle: '@username',
    })

    expect(result.success).toBe(false)
  })

  it('should reject missing type', () => {
    const result = paymentHandleSchema.safeParse({
      handle: '@username',
    })

    expect(result.success).toBe(false)
  })

  it('should reject missing handle', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'venmo',
    })

    expect(result.success).toBe(false)
  })

  it('should accept special characters in handle', () => {
    const result = paymentHandleSchema.safeParse({
      type: 'zelle',
      handle: 'user+test@email.com',
    })

    expect(result.success).toBe(true)
  })
})

describe('paymentHandlesArraySchema', () => {
  it('should accept valid array of payment handles', () => {
    const result = paymentHandlesArraySchema.safeParse([
      { type: 'venmo', handle: '@user1' },
      { type: 'zelle', handle: 'user@email.com' },
      { type: 'cash', handle: 'Cash' },
    ])

    expect(result.success).toBe(true)
  })

  it('should accept empty array', () => {
    const result = paymentHandlesArraySchema.safeParse([])

    expect(result.success).toBe(true)
  })

  it('should accept single payment handle', () => {
    const result = paymentHandlesArraySchema.safeParse([
      { type: 'venmo', handle: '@user1' },
    ])

    expect(result.success).toBe(true)
  })

  it('should accept exactly 10 payment handles', () => {
    const handles = Array(10)
      .fill(null)
      .map((_, i) => ({ type: 'venmo' as const, handle: `@user${i}` }))

    const result = paymentHandlesArraySchema.safeParse(handles)

    expect(result.success).toBe(true)
  })

  it('should reject more than 10 payment handles', () => {
    const handles = Array(11)
      .fill(null)
      .map((_, i) => ({ type: 'venmo' as const, handle: `@user${i}` }))

    const result = paymentHandlesArraySchema.safeParse(handles)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('10')
    }
  })

  it('should reject array with invalid payment handle', () => {
    const result = paymentHandlesArraySchema.safeParse([
      { type: 'venmo', handle: '@user1' },
      { type: 'invalid', handle: '@user2' },
    ])

    expect(result.success).toBe(false)
  })

  it('should reject non-array values', () => {
    const invalidValues = ['string', 123, {}, null]

    invalidValues.forEach((value) => {
      const result = paymentHandlesArraySchema.safeParse(value)
      expect(result.success).toBe(false)
    })
  })
})

describe('updatePaymentHandlesSchema', () => {
  it('should accept valid update object', () => {
    const result = updatePaymentHandlesSchema.safeParse({
      paymentHandles: [
        { type: 'venmo', handle: '@user1' },
        { type: 'zelle', handle: 'user@email.com' },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('should accept empty payment handles array', () => {
    const result = updatePaymentHandlesSchema.safeParse({
      paymentHandles: [],
    })

    expect(result.success).toBe(true)
  })

  it('should reject missing paymentHandles field', () => {
    const result = updatePaymentHandlesSchema.safeParse({})

    expect(result.success).toBe(false)
  })

  it('should reject null paymentHandles', () => {
    const result = updatePaymentHandlesSchema.safeParse({
      paymentHandles: null,
    })

    expect(result.success).toBe(false)
  })

  it('should reject more than 10 payment handles', () => {
    const handles = Array(11)
      .fill(null)
      .map((_, i) => ({ type: 'venmo' as const, handle: `@user${i}` }))

    const result = updatePaymentHandlesSchema.safeParse({
      paymentHandles: handles,
    })

    expect(result.success).toBe(false)
  })
})
