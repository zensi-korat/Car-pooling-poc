import { useRef } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Loader2, LogIn } from 'lucide-react'
import { FormAlert, LabeledField, PasswordInput } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginValues } from '../api/authSchema'
import { useAuthStore } from '../authStore'

const EMPTY_LOGIN: LoginValues = { email: '', password: '' }

export function LoginForm() {
  const login = useMutation({ mutationFn: useAuthStore((state) => state.login) })
  const isSubmitting = login.isPending
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: EMPTY_LOGIN,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    // The validator only checks; parse() returns the cleaned values (email trimmed).
    onSubmit: ({ value }) => login.mutate(loginSchema.parse(value)),
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
      {login.isError && <FormAlert>{login.error.message}</FormAlert>}

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

      <form.Field name="password">
        {(field) => (
          <LabeledField name={field.name} label="Password" errors={field.state.meta.errors}>
            <PasswordInput
              id={field.name}
              autoComplete="current-password"
              placeholder="••••••••"
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
