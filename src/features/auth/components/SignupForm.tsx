import { useRef } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { CarFront, Loader2, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { FormAlert, LabeledField, PasswordInput } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { env } from '@/config/env'
import { SIGNUP_ROLES, signupSchema, type SignupRole, type SignupValues } from '../api/authSchema'
import { useAuthStore } from '../authStore'

const ROLE_OPTIONS: Record<SignupRole, { title: string; description: string; Icon: LucideIcon }> = {
  RIDER: { title: 'I need a ride', description: 'Find drivers going your way', Icon: Users },
  DRIVER: { title: 'I’m driving', description: 'Offer the empty seats in your car', Icon: CarFront },
}

const EMPTY_SIGNUP: SignupValues = { name: '', email: '', phone: '', password: '', role: 'RIDER' }

export function SignupForm() {
  const signup = useMutation({ mutationFn: useAuthStore((state) => state.signup) })
  const isSubmitting = signup.isPending
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: EMPTY_SIGNUP,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signupSchema },
    // The validator only checks; parse() returns the cleaned values (name, email, phone trimmed).
    onSubmit: ({ value }) => signup.mutate(signupSchema.parse(value)),
    // Errors are drawn on the next frame: focus the first wrong field then.
    onSubmitInvalid: () =>
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()),
  })

  return (
    <form
      ref={formRef}
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {signup.isError && <FormAlert>{signup.error.message}</FormAlert>}

      <form.Field name="role">
        {(field) => (
          <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
            <legend className="mb-2 text-sm font-medium">How will you use {env.appName}?</legend>
            <div className="grid grid-cols-2 gap-3">
              {SIGNUP_ROLES.map((role) => {
                const { title, description, Icon } = ROLE_OPTIONS[role]
                return (
                  <label
                    key={role}
                    className="flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-secondary has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={role}
                      checked={field.state.value === role}
                      onChange={() => field.handleChange(role)}
                      className="sr-only"
                    />
                    <Icon className="mb-1 size-5" aria-hidden />
                    <span className="font-medium">{title}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => (
          <LabeledField name={field.name} label="Full name" errors={field.state.meta.errors}>
            <Input
              id={field.name}
              autoComplete="name"
              placeholder="Asha Patel"
              className="h-10"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              disabled={isSubmitting}
              aria-invalid={!field.state.meta.isValid}
            />
          </LabeledField>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <LabeledField name={field.name} label="Email" errors={field.state.meta.errors}>
            <Input
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              disabled={isSubmitting}
              aria-invalid={!field.state.meta.isValid}
            />
          </LabeledField>
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <LabeledField name={field.name} label="Mobile number" errors={field.state.meta.errors}>
            <Input
              id={field.name}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9876543210"
              maxLength={10}
              className="h-10"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              disabled={isSubmitting}
              aria-invalid={!field.state.meta.isValid}
            />
          </LabeledField>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <LabeledField name={field.name} label="Password" errors={field.state.meta.errors}>
            <PasswordInput
              id={field.name}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              disabled={isSubmitting}
              aria-invalid={!field.state.meta.isValid}
            />
          </LabeledField>
        )}
      </form.Field>

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
