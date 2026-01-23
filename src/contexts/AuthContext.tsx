'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuth, AuthUser, AuthState, AuthActions } from '@/hooks/useAuth'

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
  initialUser?: AuthUser | null
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const auth = useAuth(initialUser)

  useEffect(() => {
    if (!initialUser) {
      auth.checkAuth()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
