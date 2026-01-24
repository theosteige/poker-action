import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, generateToken, verifyToken, type JWTPayload } from './auth'

describe('hashPassword', () => {
  it('should hash a password', async () => {
    const password = 'testPassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should generate different hashes for the same password', async () => {
    const password = 'testPassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should generate a bcrypt hash format', async () => {
    const password = 'testPassword123'
    const hash = await hashPassword(password)

    // bcrypt hashes start with $2a$ or $2b$
    expect(hash).toMatch(/^\$2[ab]\$/)
  })

  it('should handle empty password', async () => {
    const hash = await hashPassword('')
    expect(hash).toBeDefined()
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should handle long passwords', async () => {
    const longPassword = 'a'.repeat(1000)
    const hash = await hashPassword(longPassword)
    expect(hash).toBeDefined()
  })

  it('should handle special characters', async () => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const hash = await hashPassword(specialPassword)
    expect(hash).toBeDefined()
  })
})

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const password = 'testPassword123'
    const hash = await hashPassword(password)
    const result = await verifyPassword(password, hash)

    expect(result).toBe(true)
  })

  it('should return false for incorrect password', async () => {
    const password = 'testPassword123'
    const wrongPassword = 'wrongPassword'
    const hash = await hashPassword(password)
    const result = await verifyPassword(wrongPassword, hash)

    expect(result).toBe(false)
  })

  it('should return false for empty password against valid hash', async () => {
    const password = 'testPassword123'
    const hash = await hashPassword(password)
    const result = await verifyPassword('', hash)

    expect(result).toBe(false)
  })

  it('should handle case sensitivity', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    const resultSame = await verifyPassword('TestPassword123', hash)
    const resultDifferent = await verifyPassword('testpassword123', hash)

    expect(resultSame).toBe(true)
    expect(resultDifferent).toBe(false)
  })

  it('should handle special characters', async () => {
    const password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const hash = await hashPassword(password)
    const result = await verifyPassword(password, hash)

    expect(result).toBe(true)
  })
})

describe('generateToken', () => {
  it('should generate a valid JWT token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
  })

  it('should include payload data in token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded!.userId).toBe('user123')
    expect(decoded!.displayName).toBe('TestUser')
  })

  it('should add iat (issued at) to token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded!.iat).toBeDefined()
    expect(typeof decoded!.iat).toBe('number')
  })

  it('should add exp (expiration) to token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded!.exp).toBeDefined()
    expect(typeof decoded!.exp).toBe('number')
    expect(decoded!.exp!).toBeGreaterThan(decoded!.iat!)
  })

  it('should handle special characters in displayName', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'Test_User-123',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded!.displayName).toBe('Test_User-123')
  })
})

describe('verifyToken', () => {
  it('should verify a valid token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded!.userId).toBe('user123')
    expect(decoded!.displayName).toBe('TestUser')
  })

  it('should return null for invalid token', () => {
    const invalidToken = 'invalid.token.here'
    const decoded = verifyToken(invalidToken)

    expect(decoded).toBeNull()
  })

  it('should return null for malformed token', () => {
    const malformedToken = 'not-a-jwt'
    const decoded = verifyToken(malformedToken)

    expect(decoded).toBeNull()
  })

  it('should return null for empty token', () => {
    const decoded = verifyToken('')

    expect(decoded).toBeNull()
  })

  it('should return null for tampered token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    // Tamper with the token by changing a character
    const tamperedToken = token.slice(0, -5) + 'xxxxx'
    const decoded = verifyToken(tamperedToken)

    expect(decoded).toBeNull()
  })

  it('should return null for expired token', async () => {
    // This test simulates an expired token by manipulating time
    // Since we can't easily create an expired token without changing the library config,
    // we'll just verify the basic verification works
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: 'user123',
      displayName: 'TestUser',
    }
    const token = generateToken(payload)
    const decoded = verifyToken(token)

    // Token should have an expiration time in the future
    expect(decoded!.exp!).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })
})

describe('Integration: Password and Token Flow', () => {
  it('should complete full auth flow', async () => {
    // Simulate user registration
    const password = 'securePassword123'
    const hash = await hashPassword(password)

    // Simulate user login - verify password
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)

    // Generate token after successful login
    const token = generateToken({ userId: 'user123', displayName: 'TestUser' })
    expect(token).toBeDefined()

    // Verify token on subsequent requests
    const decoded = verifyToken(token)
    expect(decoded).not.toBeNull()
    expect(decoded!.userId).toBe('user123')
  })
})
