import { useRef, useState, type SubmitEvent } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { FormAlert, PasswordField, TextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { isValid } from '@/lib/validation'
import { validateLogin } from '../lib/validation'
import type { LoginValues } from '../api/authSchema'

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
  isSubmitting?: boolean
  serverError?: string | null
}

const clean = (values: LoginValues): LoginValues => ({ ...values, email: values.email.trim() })

const FIELD_ORDER = ['email', 'password'] as const

export function LoginForm({ onSubmit, isSubmitting = false, serverError }: Readonly<LoginFormProps>) {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const errors = submitted ? validateLogin(clean(values)) : {}

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function update(field: keyof LoginValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)

    const cleaned = clean(values)
    const found = validateLogin(cleaned)
    if (isValid(found)) {
      onSubmit(cleaned)
      return
    }

    const refs = { email: emailRef, password: passwordRef }
    const firstInvalid = FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) refs[firstInvalid].current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && <FormAlert>{serverError}</FormAlert>}

      <TextField
        ref={emailRef}
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => update('email', e.target.value)}
        error={errors.email}
        disabled={isSubmitting}
      />

      <PasswordField
        ref={passwordRef}
        label="Password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={values.password}
        onChange={(e) => update('password', e.target.value)}
        error={errors.password}
        disabled={isSubmitting}
      />

      <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Logging in…
          </>
        ) : (
          <>
            Log in <LogIn />
          </>
        )}
      </Button>
    </form>
  )
}
