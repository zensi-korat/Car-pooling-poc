import { useState } from 'react'
import { Link } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'
import { LoginForm } from '@/features/auth/components/LoginForm'
import type { LoginValues } from '@/features/auth/types'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/services/api'

export function LoginPage() {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(values: LoginValues) {
    setIsSubmitting(true)
    setError(null)
    try {
      await login(values)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Log in to find a ride or offer one.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} serverError={error} />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New to {env.appName}?{' '}
            <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
