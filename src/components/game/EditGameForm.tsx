'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card } from '@/components/ui'
import { format } from 'date-fns'

const editGameSchema = z.object({
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be 200 characters or less'),
})

type EditGameFormData = z.infer<typeof editGameSchema>

interface EditGameFormProps {
  gameId: string
  currentScheduledTime: string
  currentLocation: string
  onSuccess: () => void
  onCancel: () => void
}

export function EditGameForm({
  gameId,
  currentScheduledTime,
  currentLocation,
  onSuccess,
  onCancel,
}: EditGameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format the date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditGameFormData>({
    resolver: zodResolver(editGameSchema),
    defaultValues: {
      scheduledTime: formatDateForInput(currentScheduledTime),
      location: currentLocation,
    },
  })

  const onSubmit = async (data: EditGameFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledTime: new Date(data.scheduledTime).toISOString(),
          location: data.location,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update game')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Edit Game Details
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Date & Time"
          type="datetime-local"
          {...register('scheduledTime')}
          error={errors.scheduledTime?.message}
        />

        <Input
          label="Location"
          type="text"
          placeholder="Enter game location"
          {...register('location')}
          error={errors.location?.message}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  )
}
