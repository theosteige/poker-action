'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema, LoginInput } from '@/lib/validations/auth'
import { useAuthContext } from '@/contexts/AuthContext'
import { Input, Button, Card } from '@/components/ui'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    clearError()
    const success = await login(data)
    if (success) {
      router.push('/dashboard')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-1">Sign in to your Union Poker account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Input
          label="Display Name"
          placeholder="Enter your display name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </Card>
  )
}
