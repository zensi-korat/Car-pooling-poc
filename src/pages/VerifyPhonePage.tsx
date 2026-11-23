import { useEffect, useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Loader2, ShieldCheck } from 'lucide-react'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resendCode } from '@/features/auth/api/authApi'
import { verifyPhoneFormSchema } from '@/features/auth/api/authSchema'
import { useAuthStore, useCurrentUser } from '@/features/auth/authStore'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { useLogout } from '@/features/auth/hooks/useLogout'

export function VerifyPhonePage() {
  const user = useCurrentUser()
  const verify = useMutation({ mutationFn: useAuthStore((state) => state.verifyPhone) })
  const resend = useMutation({ mutationFn: resendCode })
  const logout = useLogout()
  const isVerifying = verify.isPending
  const error = verify.error ?? resend.error
  const notice = resend.data?.message

  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const form = useForm({
    defaultValues: { code: '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: verifyPhoneFormSchema },
    onSubmit: ({ value }) => verify.mutate(value.code),
  })

  function handleResend() {
    verify.reset()
    resend.mutate(undefined, { onSuccess: (result) => setSecondsLeft(result.resendAfterSeconds) })
  }

  return (
    <AuthLayout
      title="Verify your phone"
      description={`We sent a 6-digit code to ••••••${user.phone.slice(-4)}. Enter it below to start using the app.`}
      footer={
        <>
          Wrong account?{' '}
          <Button type="button" variant="link" className="h-auto p-0" onClick={() => void logout()}>
            Log out
          </Button>
        </>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        {error && <FormAlert>{error.message}</FormAlert>}
        {notice && (
          <p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {notice}
          </p>
        )}

        <form.Field name="code">
          {(field) => (
            <LabeledField name={field.name} label="Verification code" errors={field.state.meta.errors}>
              <Input
                id={field.name}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                className="h-10 text-center text-lg tracking-[0.5em]"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ''))}
                onBlur={field.handleBlur}
                disabled={isVerifying}
                aria-invalid={!field.state.meta.isValid}
              />
            </LabeledField>
          )}
        </form.Field>

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isVerifying}>
          {isVerifying ? (
            <>
              <Loader2 className="animate-spin" /> Verifying…
            </>
          ) : (
            <>
              Verify <ShieldCheck />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Didn’t get it?
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={handleResend}
            disabled={resend.isPending || secondsLeft > 0}
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
