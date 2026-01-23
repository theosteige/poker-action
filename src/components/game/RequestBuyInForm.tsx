'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card } from '@/components/ui'

const requestBuyInSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num > 0
      },
      { message: 'Amount must be a positive number' }
    )
    .refine(
      (val) => {
        const num = parseFloat(val)
        return num <= 10000
      },
      { message: 'Amount cannot exceed $10,000' }
    ),
})

type RequestBuyInInput = z.infer<typeof requestBuyInSchema>

interface RequestBuyInFormProps {
  gameId: string
  onSuccess?: () => void
  bigBlindAmount: string
}

export function RequestBuyInForm({
  gameId,
  onSuccess,
  bigBlindAmount,
}: RequestBuyInFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestBuyInInput>({
    resolver: zodResolver(requestBuyInSchema),
    defaultValues: {
      amount: '',
    },
  })

  const suggestedAmounts = [
    parseFloat(bigBlindAmount) * 100, // 100 BB
    parseFloat(bigBlindAmount) * 200, // 200 BB
    parseFloat(bigBlindAmount) * 50, // 50 BB
  ].filter((amount) => amount > 0 && amount <= 10000)

  const onSubmit = async (data: RequestBuyInInput) => {
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/games/${gameId}/buy-ins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          isRequest: true, // This is a player request
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request buy-in')
      }

      setSuccess(true)
      reset()
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request buy-in')
    }
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Request Buy-In
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">Request Buy-In</h3>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setError(null)
            setSuccess(false)
            reset()
          }}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-600">Request sent!</p>
          <p className="text-xs text-neutral-500 mt-1">
            Waiting for bank approval
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              placeholder="Enter buy-in amount"
              error={errors.amount?.message}
              {...register('amount')}
            />
          </div>

          {/* Suggested amounts */}
          {suggestedAmounts.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Quick amounts:</p>
              <div className="flex gap-2">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() =>
                      reset({ amount: amount.toFixed(2) })
                    }
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    ${amount.toFixed(0)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            Your request will be sent to the bank for approval. The bank will mark
            whether you&apos;ve paid once they receive your money.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsOpen(false)
                setError(null)
                reset()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
