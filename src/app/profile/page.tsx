'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { PaymentHandlesForm } from '@/components/profile'
import { Card, Button } from '@/components/ui'
import Link from 'next/link'
import type { PaymentHandle } from '@/lib/validations/payment-handles'

export default function ProfilePage() {
  const { user, isLoading: authLoading, logout } = useAuthContext()
  const [paymentHandles, setPaymentHandles] = useState<PaymentHandle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPaymentHandles() {
      try {
        const response = await fetch('/api/users/payment-handles')
        if (response.ok) {
          const data = await response.json()
          setPaymentHandles(data.paymentHandles || [])
        }
      } catch (error) {
        console.error('Failed to fetch payment handles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPaymentHandles()
    } else if (!authLoading) {
      setIsLoading(false)
    }
  }, [user, authLoading])

  const handleSavePaymentHandles = async (handles: PaymentHandle[]) => {
    const response = await fetch('/api/users/payment-handles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentHandles: handles }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to save payment handles')
    }

    const data = await response.json()
    setPaymentHandles(data.user?.paymentHandles || handles)
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Display Name</span>
              <p className="text-gray-900 font-medium">{user.displayName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Member Since</span>
              <p className="text-gray-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </Card>

        <PaymentHandlesForm
          initialHandles={paymentHandles}
          onSave={handleSavePaymentHandles}
        />

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
          <Button variant="danger" onClick={handleLogout}>
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  )
}
