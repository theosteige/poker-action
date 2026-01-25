'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGameSchema, CreateGameInput } from '@/lib/validations/game'
import { Input, Button, Card } from '@/components/ui'

interface GameCreatedData {
  id: string
  inviteCode: string
  inviteUrl: string
  location: string
  scheduledTime: string
  bigBlindAmount: string
}

interface CreateGameFormProps {
  onGameCreated: (game: GameCreatedData) => void
}

export function CreateGameForm({ onGameCreated }: CreateGameFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGameInput>({
    resolver: zodResolver(createGameSchema),
  })

  const onSubmit = async (data: CreateGameInput) => {
    setError(null)
    setIsLoading(true)

    try {
      // Convert datetime-local string to proper ISO timestamp
      // datetime-local gives us "YYYY-MM-DDTHH:mm" in local time
      // We need to convert it to a full ISO string with timezone
      const localDate = new Date(data.scheduledTime)
      const isoScheduledTime = localDate.toISOString()

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          scheduledTime: isoScheduledTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          setError(result.errors.map((e: { message: string }) => e.message).join(', '))
        } else {
          setError(result.error || 'Failed to create game')
        }
        return
      }

      onGameCreated(result.game)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Get the minimum datetime (current time)
  const getMinDateTime = () => {
    return new Date().toISOString().slice(0, 16)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create a Game</h1>
        <p className="text-gray-600 mt-1">Set up a new poker game and invite your friends</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Input
          label="When"
          type="datetime-local"
          min={getMinDateTime()}
          error={errors.scheduledTime?.message}
          {...register('scheduledTime')}
        />

        <Input
          label="Location"
          placeholder="e.g., John's apartment, Room 302"
          error={errors.location?.message}
          {...register('location')}
        />

        <div className="w-full">
          <label
            htmlFor="bigBlindAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Big Blind Amount ($)
          </label>
          <input
            id="bigBlindAmount"
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            placeholder="e.g., 0.50"
            className={`
              w-full px-3 py-2
              border rounded-lg
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.bigBlindAmount ? 'border-red-500' : 'border-gray-300'}
            `}
            {...register('bigBlindAmount', {
              setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
            })}
          />
          {errors.bigBlindAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.bigBlindAmount.message}</p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Create Game
        </Button>
      </form>
    </Card>
  )
}
