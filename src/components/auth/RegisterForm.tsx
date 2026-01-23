'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema, RegisterInput } from '@/lib/validations/auth'
import { useAuthContext } from '@/contexts/AuthContext'
import { Input, Button, Card } from '@/components/ui'

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, clearError } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    clearError()
    const success = await registerUser(data)
    if (success) {
      router.push('/dashboard')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-1">Join Poker Hub and start playing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Input
          label="Display Name"
          placeholder="Choose a display name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />

        <div className="text-xs text-gray-500 -mt-2">
          3-20 characters, letters, numbers, underscores, and hyphens only
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  )
}
