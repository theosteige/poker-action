import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createGameSchema } from './game'

describe('createGameSchema', () => {
  beforeEach(() => {
    // Set a fixed date for testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('scheduledTime validation', () => {
    it('should accept a valid future date', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(true)
    })

    it('should reject a past date', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-23T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('future')
      }
    })

    it('should reject current time', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-24T12:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: 'not-a-date',
        location: 'Room 101',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid date format')
      }
    })

    it('should reject empty scheduledTime', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '',
        location: 'Room 101',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
    })

    it('should accept various valid date formats', () => {
      const validDates = [
        '2026-02-01T20:00:00Z',
        '2026-12-31T23:59:59.999Z',
        '2027-01-01',
      ]

      validDates.forEach((date) => {
        const result = createGameSchema.safeParse({
          scheduledTime: date,
          location: 'Room 101',
          bigBlindAmount: 1,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('location validation', () => {
    it('should accept valid location', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101, Building A',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(true)
    })

    it('should reject empty location', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: '',
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('should reject location longer than 200 characters', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'a'.repeat(201),
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200 characters')
      }
    })

    it('should accept location with exactly 200 characters', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'a'.repeat(200),
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(true)
    })

    it('should accept location with special characters', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: "John's Place, 123 Main St. #4B",
        bigBlindAmount: 1,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('bigBlindAmount validation', () => {
    it('should accept valid positive numbers', () => {
      const validAmounts = [0.5, 1, 5, 10, 100, 1000, 10000]

      validAmounts.forEach((amount) => {
        const result = createGameSchema.safeParse({
          scheduledTime: '2026-01-25T18:00:00.000Z',
          location: 'Room 101',
          bigBlindAmount: amount,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject zero', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 0,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('should reject negative numbers', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: -1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('should reject amounts greater than 10000', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 10001,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10,000')
      }
    })

    it('should accept exactly 10000', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 10000,
      })

      expect(result.success).toBe(true)
    })

    it('should accept decimal amounts', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: 0.25,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should reject empty object', () => {
      const result = createGameSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('should reject null values', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: null,
        location: null,
        bigBlindAmount: null,
      })

      expect(result.success).toBe(false)
    })

    it('should reject string for bigBlindAmount', () => {
      const result = createGameSchema.safeParse({
        scheduledTime: '2026-01-25T18:00:00.000Z',
        location: 'Room 101',
        bigBlindAmount: '10',
      })

      expect(result.success).toBe(false)
    })
  })
})
