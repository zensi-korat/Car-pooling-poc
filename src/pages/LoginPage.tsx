import { Link } from 'react-router'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to find a ride or offer one."
      footer={
        <>
          New to {env.appName}?{' '}
          <Link to={ROUTES.signup} className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
