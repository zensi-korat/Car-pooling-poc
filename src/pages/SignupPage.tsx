import { useState } from 'react'
import { Link } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'
import { SignupForm } from '@/features/auth/components/SignupForm'
import type { SignupValues } from '@/features/auth/api/authSchema'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/services/api'

export function SignupPage() {
  const { signup } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(values: SignupValues) {
    setIsSubmitting(true)
    setError(null)
    try {
      await signup(values)
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
        <div className="flex w-full max-w-md flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Join {env.appName} to share rides with people going your way.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} serverError={error} />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
