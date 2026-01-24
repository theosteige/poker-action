import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit, checkChatRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow first request', () => {
    const result = checkRateLimit('test-user-1', {
      maxRequests: 5,
      windowMs: 10000,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should track remaining requests correctly', () => {
    const options = { maxRequests: 5, windowMs: 10000 }
    const identifier = 'test-user-2'

    const result1 = checkRateLimit(identifier, options)
    expect(result1.remaining).toBe(4)

    const result2 = checkRateLimit(identifier, options)
    expect(result2.remaining).toBe(3)

    const result3 = checkRateLimit(identifier, options)
    expect(result3.remaining).toBe(2)

    const result4 = checkRateLimit(identifier, options)
    expect(result4.remaining).toBe(1)

    const result5 = checkRateLimit(identifier, options)
    expect(result5.remaining).toBe(0)
    expect(result5.success).toBe(true)
  })

  it('should block requests after max is reached', () => {
    const options = { maxRequests: 3, windowMs: 10000 }
    const identifier = 'test-user-3'

    checkRateLimit(identifier, options) // 1
    checkRateLimit(identifier, options) // 2
    checkRateLimit(identifier, options) // 3

    const result = checkRateLimit(identifier, options) // 4 - should be blocked

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after window expires', () => {
    const options = { maxRequests: 2, windowMs: 5000 }
    const identifier = 'test-user-4'

    checkRateLimit(identifier, options) // 1
    checkRateLimit(identifier, options) // 2
    const blockedResult = checkRateLimit(identifier, options) // 3 - blocked

    expect(blockedResult.success).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(6000)

    const newResult = checkRateLimit(identifier, options)

    expect(newResult.success).toBe(true)
    expect(newResult.remaining).toBe(1)
  })

  it('should track different identifiers separately', () => {
    const options = { maxRequests: 2, windowMs: 10000 }

    checkRateLimit('user-a', options) // user-a: 1
    checkRateLimit('user-a', options) // user-a: 2
    const blockedA = checkRateLimit('user-a', options) // user-a: blocked

    expect(blockedA.success).toBe(false)

    // user-b should still have quota
    const resultB = checkRateLimit('user-b', options)
    expect(resultB.success).toBe(true)
    expect(resultB.remaining).toBe(1)
  })

  it('should return resetAt timestamp', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const options = { maxRequests: 5, windowMs: 10000 }
    const result = checkRateLimit('test-user-5', options)

    expect(result.resetAt).toBe(now + 10000)
  })

  it('should maintain same resetAt within window', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const options = { maxRequests: 5, windowMs: 10000 }
    const identifier = 'test-user-6'

    const result1 = checkRateLimit(identifier, options)

    vi.advanceTimersByTime(2000)
    const result2 = checkRateLimit(identifier, options)

    // resetAt should be the same for both (based on first request)
    expect(result1.resetAt).toBe(result2.resetAt)
  })

  it('should handle single request limit', () => {
    const options = { maxRequests: 1, windowMs: 5000 }
    const identifier = 'test-user-7'

    const result1 = checkRateLimit(identifier, options)
    expect(result1.success).toBe(true)
    expect(result1.remaining).toBe(0)

    const result2 = checkRateLimit(identifier, options)
    expect(result2.success).toBe(false)
  })

  it('should handle large window times', () => {
    const options = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 1 hour
    const identifier = 'test-user-8'

    const result = checkRateLimit(identifier, options)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('should handle very short window times', () => {
    const options = { maxRequests: 3, windowMs: 100 } // 100ms
    const identifier = 'test-user-9'

    checkRateLimit(identifier, options)
    checkRateLimit(identifier, options)
    checkRateLimit(identifier, options)
    const blocked = checkRateLimit(identifier, options)

    expect(blocked.success).toBe(false)

    vi.advanceTimersByTime(150)

    const reset = checkRateLimit(identifier, options)
    expect(reset.success).toBe(true)
  })
})

describe('checkChatRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow up to 5 messages per 10 seconds', () => {
    const userId = 'chat-user-1'

    for (let i = 0; i < 5; i++) {
      const result = checkChatRateLimit(userId)
      expect(result.success).toBe(true)
    }

    const sixthResult = checkChatRateLimit(userId)
    expect(sixthResult.success).toBe(false)
  })

  it('should reset after 10 seconds', () => {
    const userId = 'chat-user-2'

    // Use all 5 messages
    for (let i = 0; i < 5; i++) {
      checkChatRateLimit(userId)
    }

    // Blocked
    expect(checkChatRateLimit(userId).success).toBe(false)

    // Wait 10 seconds
    vi.advanceTimersByTime(11000)

    // Should be allowed again
    expect(checkChatRateLimit(userId).success).toBe(true)
  })

  it('should track different users separately', () => {
    const user1 = 'chat-user-3'
    const user2 = 'chat-user-4'

    // Exhaust user1's limit
    for (let i = 0; i < 5; i++) {
      checkChatRateLimit(user1)
    }

    expect(checkChatRateLimit(user1).success).toBe(false)

    // user2 should still have full quota
    const user2Result = checkChatRateLimit(user2)
    expect(user2Result.success).toBe(true)
    expect(user2Result.remaining).toBe(4)
  })

  it('should use chat: prefix for identifier', () => {
    // This test verifies the internal behavior by checking that
    // two different users with different IDs are tracked separately
    const result1 = checkChatRateLimit('user-a')
    const result2 = checkChatRateLimit('user-b')

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
    expect(result1.remaining).toBe(4)
    expect(result2.remaining).toBe(4)
  })

  it('should correctly report remaining messages', () => {
    const userId = 'chat-user-5'

    expect(checkChatRateLimit(userId).remaining).toBe(4)
    expect(checkChatRateLimit(userId).remaining).toBe(3)
    expect(checkChatRateLimit(userId).remaining).toBe(2)
    expect(checkChatRateLimit(userId).remaining).toBe(1)
    expect(checkChatRateLimit(userId).remaining).toBe(0)
    expect(checkChatRateLimit(userId).remaining).toBe(0) // Still 0 when blocked
  })
})
