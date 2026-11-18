import { useEffect, useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2, ShieldCheck } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { resendCode } from '@/features/auth/api/authApi'
import { verifyPhoneFormSchema } from '@/features/auth/api/authSchema'
import { useAuthStore, useCurrentUser } from '@/features/auth/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getErrorMessage } from '@/services/api'

export function VerifyPhonePage() {
  const user = useCurrentUser()
  const verifyPhone = useAuthStore((state) => state.verifyPhone)
  const logout = useLogout()

  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isResending, setIsResending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
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
    onSubmit: async ({ value }) => {
      setIsVerifying(true)
      setError(null)
      try {
        await verifyPhone(value.code)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsVerifying(false)
      }
    },
  })

  async function handleResend() {
    setIsResending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await resendCode()
      setNotice(result.message)
      setSecondsLeft(result.resendAfterSeconds)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Verify your phone</CardTitle>
            <CardDescription>
              We sent a 6-digit code to ••••••{user.phone.slice(-4)}. Enter it below to start using the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              className="flex flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              {error && <FormAlert>{error}</FormAlert>}
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
                  disabled={isResending || secondsLeft > 0}
                >
                  {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
                </Button>
              </div>
            </form>

            <p className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
              Wrong account?{' '}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => void logout()}>
                Log out
              </Button>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
