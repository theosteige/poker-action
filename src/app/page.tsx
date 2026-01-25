'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'

export default function Home() {
  const { user, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <span className="text-6xl">♠</span>
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
        Union Poker
      </h1>

      <p className="mb-8 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
        Manage your poker games with ease. Track buy-ins, settle debts automatically, and keep score with friends.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/register">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">
            Sign In
          </Button>
        </Link>
      </div>

      <div className="mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
        <FeatureCard
          icon="♦"
          title="Track Games"
          description="Create game rooms, invite friends, and track all buy-ins and cash-outs in real-time."
        />
        <FeatureCard
          icon="♥"
          title="Auto Settlement"
          description="Let the system calculate who owes whom after every game. No more confusion."
        />
        <FeatureCard
          icon="♣"
          title="Leaderboard"
          description="See who's winning big and who needs to step up their game."
        />
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="mb-3 block text-3xl">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </div>
  )
}
