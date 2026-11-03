import { useRef, useState, type SubmitEvent } from 'react'
import { CarFront, Loader2, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { FormAlert, PasswordField, TextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { isValid, validateSignup } from '../lib/validation'
import { SIGNUP_ROLES, type SignupRole, type SignupValues } from '../types'

type SignupFormProps = {
  onSubmit: (values: SignupValues) => void
  isSubmitting?: boolean
  serverError?: string | null
}

const ROLE_OPTIONS: Record<SignupRole, { title: string; description: string; Icon: LucideIcon }> = {
  RIDER: { title: 'I need a ride', description: 'Find drivers going your way', Icon: Users },
  DRIVER: { title: 'I’m driving', description: 'Offer the empty seats in your car', Icon: CarFront },
}

const EMPTY: SignupValues = { name: '', email: '', phone: '', password: '', role: 'RIDER' }

const FIELD_ORDER = ['name', 'email', 'phone', 'password'] as const

const clean = (values: SignupValues): SignupValues => ({
  ...values,
  name: values.name.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
})

export function SignupForm({ onSubmit, isSubmitting = false, serverError }: Readonly<SignupFormProps>) {
  const [values, setValues] = useState<SignupValues>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const errors = submitted ? validateSignup(clean(values)) : {}

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof SignupValues>(field: K, value: SignupValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)

    const cleaned = clean(values)
    const found = validateSignup(cleaned)
    if (isValid(found)) {
      onSubmit(cleaned)
      return
    }

    const refs = { name: nameRef, email: emailRef, phone: phoneRef, password: passwordRef }
    const firstInvalid = FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) refs[firstInvalid].current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && <FormAlert>{serverError}</FormAlert>}

      <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
        <legend className="mb-2 text-sm font-medium">How will you use {env.appName}?</legend>
        <div className="grid grid-cols-2 gap-3">
          {SIGNUP_ROLES.map((role) => {
            const { title, description, Icon } = ROLE_OPTIONS[role]
            return (
              <label
                key={role}
                className="flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50"
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={values.role === role}
                  onChange={() => update('role', role)}
                  className="sr-only"
                />
                <Icon className="mb-1 size-5" aria-hidden />
                <span className="font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </label>
            )
          })}
        </div>
        {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
      </fieldset>

      <TextField
        ref={nameRef}
        label="Full name"
        autoComplete="name"
        placeholder="Asha Patel"
        value={values.name}
        onChange={(e) => update('name', e.target.value)}
        error={errors.name}
        disabled={isSubmitting}
      />

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

      <TextField
        ref={phoneRef}
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="9876543210"
        maxLength={10}
        value={values.phone}
        onChange={(e) => update('phone', e.target.value)}
        error={errors.phone}
        disabled={isSubmitting}
      />

      <PasswordField
        ref={passwordRef}
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={values.password}
        onChange={(e) => update('password', e.target.value)}
        error={errors.password}
        disabled={isSubmitting}
      />

      <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Creating account…
          </>
        ) : (
          <>
            Create account <UserPlus />
          </>
        )}
      </Button>
    </form>
  )
}
