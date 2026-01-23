// Simple in-memory rate limiter
// Note: In production with multiple instances, use Redis or similar

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}, CLEANUP_INTERVAL)

interface RateLimitOptions {
  maxRequests: number // Maximum number of requests
  windowMs: number // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { maxRequests, windowMs } = options
  const now = Date.now()
  const key = identifier

  const existing = rateLimitStore.get(key)

  // If no existing entry or window has expired, create new entry
  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt,
    }
  }

  // Increment count
  const newCount = existing.count + 1
  rateLimitStore.set(key, { count: newCount, resetAt: existing.resetAt })

  // Check if over limit
  if (newCount > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    }
  }

  return {
    success: true,
    remaining: maxRequests - newCount,
    resetAt: existing.resetAt,
  }
}

// Chat-specific rate limit: 5 messages per 10 seconds
export function checkChatRateLimit(userId: string): RateLimitResult {
  return checkRateLimit(`chat:${userId}`, {
    maxRequests: 5,
    windowMs: 10 * 1000, // 10 seconds
  })
}
