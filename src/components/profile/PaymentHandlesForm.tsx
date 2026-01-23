'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'
import type { PaymentHandle, PaymentHandleType } from '@/lib/validations/payment-handles'

interface PaymentHandlesFormProps {
  initialHandles: PaymentHandle[]
  onSave: (handles: PaymentHandle[]) => Promise<void>
}

const HANDLE_TYPE_LABELS: Record<PaymentHandleType, string> = {
  venmo: 'Venmo',
  zelle: 'Zelle',
  cash: 'Cash Only',
}

const HANDLE_TYPE_PLACEHOLDERS: Record<PaymentHandleType, string> = {
  venmo: '@username',
  zelle: 'phone or email',
  cash: 'Any notes (optional)',
}

export function PaymentHandlesForm({ initialHandles, onSave }: PaymentHandlesFormProps) {
  const [handles, setHandles] = useState<PaymentHandle[]>(initialHandles)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const addHandle = () => {
    if (handles.length >= 10) {
      setError('You can have at most 10 payment handles')
      return
    }
    setHandles([...handles, { type: 'venmo', handle: '' }])
    setError(null)
    setSuccess(false)
  }

  const removeHandle = (index: number) => {
    setHandles(handles.filter((_, i) => i !== index))
    setError(null)
    setSuccess(false)
  }

  const updateHandle = (index: number, field: keyof PaymentHandle, value: string) => {
    setHandles(
      handles.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      )
    )
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const validHandles = handles.filter((h) => h.handle.trim() !== '' || h.type === 'cash')

    try {
      await onSave(validHandles)
      setHandles(validHandles)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment handles')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Payment Handles</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add your payment methods so others can settle up with you after games.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">Payment handles saved successfully!</p>
          </div>
        )}

        {handles.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No payment handles added yet. Add one below.
          </p>
        ) : (
          <div className="space-y-3">
            {handles.map((handle, index) => (
              <div key={index} className="flex gap-2 items-start">
                <select
                  value={handle.type}
                  onChange={(e) =>
                    updateHandle(index, 'type', e.target.value as PaymentHandleType)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(Object.keys(HANDLE_TYPE_LABELS) as PaymentHandleType[]).map((type) => (
                    <option key={type} value={type}>
                      {HANDLE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>

                <div className="flex-1">
                  <Input
                    value={handle.handle}
                    onChange={(e) => updateHandle(index, 'handle', e.target.value)}
                    placeholder={HANDLE_TYPE_PLACEHOLDERS[handle.type]}
                  />
                </div>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeHandle(index)}
                  className="shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={addHandle}>
            Add Payment Handle
          </Button>

          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  )
}
