import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from './auth'

describe('registerSchema', () => {
  describe('displayName validation', () => {
    it('should accept valid display names', () => {
      const validNames = ['user123', 'Test_User', 'player-1', 'ABC', 'a_b-c']

      validNames.forEach((name) => {
        const result = registerSchema.safeParse({
          displayName: name,
          password: 'password123',
          confirmPassword: 'password123',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject display names shorter than 3 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'ab',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 3 characters')
      }
    })

    it('should reject display names longer than 20 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'a'.repeat(21),
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 20 characters')
      }
    })

    it('should reject display names with invalid characters', () => {
      const invalidNames = ['user@name', 'user name', 'user.name', 'user!', '用户名']

      invalidNames.forEach((name) => {
        const result = registerSchema.safeParse({
          displayName: name,
          password: 'password123',
          confirmPassword: 'password123',
        })
        expect(result.success).toBe(false)
      })
    })

    it('should accept display names with exactly 3 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'abc',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result.success).toBe(true)
    })

    it('should accept display names with exactly 20 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'a'.repeat(20),
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('password validation', () => {
    it('should accept valid passwords', () => {
      const validPasswords = ['123456', 'password', 'P@ssw0rd!', 'a'.repeat(100)]

      validPasswords.forEach((password) => {
        const result = registerSchema.safeParse({
          displayName: 'testuser',
          password: password,
          confirmPassword: password,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject passwords shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: '12345',
        confirmPassword: '12345',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6 characters')
      }
    })

    it('should reject passwords longer than 100 characters', () => {
      const longPassword = 'a'.repeat(101)
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: longPassword,
        confirmPassword: longPassword,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 100 characters')
      }
    })

    it('should accept password with exactly 6 characters', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: '123456',
        confirmPassword: '123456',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('confirmPassword validation', () => {
    it('should pass when passwords match', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(result.success).toBe(true)
    })

    it('should fail when passwords do not match', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: 'password123',
        confirmPassword: 'different123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Passwords do not match')
      }
    })

    it('should fail when confirmPassword is empty', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
        password: 'password123',
        confirmPassword: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should reject empty object', () => {
      const result = registerSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('should reject null values', () => {
      const result = registerSchema.safeParse({
        displayName: null,
        password: null,
        confirmPassword: null,
      })

      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = registerSchema.safeParse({
        displayName: 'testuser',
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('loginSchema', () => {
  describe('displayName validation', () => {
    it('should accept any non-empty display name', () => {
      const result = loginSchema.safeParse({
        displayName: 'a',
        password: 'p',
      })

      expect(result.success).toBe(true)
    })

    it('should reject empty display name', () => {
      const result = loginSchema.safeParse({
        displayName: '',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })
  })

  describe('password validation', () => {
    it('should accept any non-empty password', () => {
      const result = loginSchema.safeParse({
        displayName: 'testuser',
        password: 'p',
      })

      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        displayName: 'testuser',
        password: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })
  })

  describe('edge cases', () => {
    it('should reject empty object', () => {
      const result = loginSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('should accept valid credentials', () => {
      const result = loginSchema.safeParse({
        displayName: 'testuser',
        password: 'password123',
      })

      expect(result.success).toBe(true)
    })
  })
})
