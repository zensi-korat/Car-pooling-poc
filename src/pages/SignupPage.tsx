import { Link } from 'react-router'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { SignupForm } from '@/features/auth/components/SignupForm'

export function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description={`Join ${env.appName} to share rides with people going your way.`}
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
