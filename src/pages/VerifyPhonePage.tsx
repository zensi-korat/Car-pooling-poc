import { useEffect, useState, type SubmitEvent } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { FormAlert, TextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resendCode } from '@/features/auth/api/authApi'
import { useAuth, useCurrentUser } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/services/api'

const CODE_PATTERN = /^\d{6}$/

export function VerifyPhonePage() {
  const user = useCurrentUser()
  const { verifyPhone } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isResending, setIsResending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const codeError = submitted && !CODE_PATTERN.test(code) ? 'Enter the 6-digit code from the SMS' : undefined

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  async function handleVerify(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!CODE_PATTERN.test(code)) return

    setIsVerifying(true)
    setError(null)
    try {
      await verifyPhone(code)
      void navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsVerifying(false)
    }
  }

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
            <form onSubmit={handleVerify} noValidate className="flex flex-col gap-5">
              {error && <FormAlert>{error}</FormAlert>}
              {notice && (
                <p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {notice}
                </p>
              )}

              <TextField
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                error={codeError}
                disabled={isVerifying}
                className="text-center text-lg tracking-[0.5em]"
              />

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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
