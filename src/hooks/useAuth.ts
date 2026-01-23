'use client'

import { useState, useCallback } from 'react'
import type { RegisterInput, LoginInput } from '@/lib/validations/auth'

export interface AuthUser {
  id: string
  displayName: string
  paymentHandles: unknown[]
  createdAt: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (data: LoginInput) => Promise<boolean>
  register: (data: RegisterInput) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export function useAuth(initialUser: AuthUser | null = null): AuthState & AuthActions {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (data: LoginInput): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Login failed')
        return false
      }

      setUser(result.user)
      return true
    } catch {
      setError('An error occurred during login')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterInput): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
        return false
      }

      setUser(result.user)
      return true
    } catch {
      setError('An error occurred during registration')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch {
      setError('An error occurred during logout')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  }
}
