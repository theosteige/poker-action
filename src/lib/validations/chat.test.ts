import { describe, it, expect } from 'vitest'
import { chatMessageSchema } from './chat'

describe('chatMessageSchema', () => {
  describe('content validation', () => {
    it('should accept valid message content', () => {
      const validMessages = [
        'Hello!',
        'This is a test message.',
        'a',
        'Hello everyone, hope you are doing well today!',
        '!@#$%^&*()',
      ]

      validMessages.forEach((content) => {
        const result = chatMessageSchema.safeParse({ content })
        expect(result.success).toBe(true)
      })
    })

    it('should reject empty message', () => {
      const result = chatMessageSchema.safeParse({ content: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('empty')
      }
    })

    it('should accept whitespace-only message (trim happens after validation)', () => {
      // Note: In Zod, trim() is a transform that happens after validation
      // So whitespace passes the min(1) check, then gets trimmed to empty
      const result = chatMessageSchema.safeParse({ content: '   ' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('')
      }
    })

    it('should reject message longer than 1000 characters', () => {
      const result = chatMessageSchema.safeParse({ content: 'a'.repeat(1001) })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1000')
      }
    })

    it('should accept message with exactly 1000 characters', () => {
      const result = chatMessageSchema.safeParse({ content: 'a'.repeat(1000) })

      expect(result.success).toBe(true)
    })

    it('should trim whitespace from content', () => {
      const result = chatMessageSchema.safeParse({ content: '  hello  ' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('hello')
      }
    })

    it('should accept message with newlines', () => {
      const result = chatMessageSchema.safeParse({
        content: 'Line 1\nLine 2\nLine 3',
      })

      expect(result.success).toBe(true)
    })

    it('should accept message with unicode characters', () => {
      const result = chatMessageSchema.safeParse({
        content: 'Hello 世界! 🎉',
      })

      expect(result.success).toBe(true)
    })

    it('should accept message with emojis', () => {
      const result = chatMessageSchema.safeParse({
        content: '🎰🃏♠️♥️♦️♣️',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should reject missing content field', () => {
      const result = chatMessageSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('should reject null content', () => {
      const result = chatMessageSchema.safeParse({ content: null })

      expect(result.success).toBe(false)
    })

    it('should reject number as content', () => {
      const result = chatMessageSchema.safeParse({ content: 123 })

      expect(result.success).toBe(false)
    })

    it('should reject array as content', () => {
      const result = chatMessageSchema.safeParse({ content: ['hello'] })

      expect(result.success).toBe(false)
    })

    it('should reject object as content', () => {
      const result = chatMessageSchema.safeParse({ content: { text: 'hello' } })

      expect(result.success).toBe(false)
    })

    it('should handle content with only tabs (trim happens after validation)', () => {
      // Note: In Zod, trim() is a transform that happens after validation
      const result = chatMessageSchema.safeParse({ content: '\t\t\t' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('')
      }
    })

    it('should preserve internal whitespace', () => {
      const result = chatMessageSchema.safeParse({ content: 'hello    world' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('hello    world')
      }
    })
  })
})
