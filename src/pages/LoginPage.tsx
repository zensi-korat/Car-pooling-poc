import { Link } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
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
              <LoginForm />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New to {env.appName}?{' '}
            <Link to={ROUTES.signup} className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
