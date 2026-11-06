import { useState, type SubmitEvent } from 'react'
import { Loader2, ShieldCheck, UserRound } from 'lucide-react'
import { FormAlert, TextField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { StatusBadge, VerifiedBadge } from '@/components/badges'
import { DetailRow, PageHeader, SectionCard } from '@/components/page'
import { useAuth, useCurrentUser } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/services/api'

export function ProfilePage() {
  const user = useCurrentUser()
  const { updateName } = useAuth()

  const [name, setName] = useState(user.name)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const trimmed = name.trim()
  const nameError = trimmed ? undefined : 'Name is required'
  const hasChanged = trimmed !== user.name

  async function handleSave(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (nameError || !hasChanged) return

    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateName(trimmed)
      setName(updated.name)
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="My Profile" description="Manage your personal details." />

      <div className="flex max-w-3xl flex-col gap-6 p-6">
        <SectionCard title="Personal details" Icon={UserRound}>
          <form onSubmit={handleSave} noValidate className="flex max-w-sm flex-col gap-5 p-5">
            {error && <FormAlert>{error}</FormAlert>}
            {saved && (
              <p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Your name was updated.
              </p>
            )}

            <TextField
              label="Full name"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSaved(false)
              }}
              error={nameError}
              disabled={isSaving}
            />

            <Button type="submit" className="h-10 self-start px-5" disabled={isSaving || !!nameError || !hasChanged}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" /> Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Account" Icon={ShieldCheck} aside={<StatusBadge>Can't be changed</StatusBadge>}>
          <dl className="divide-y">
            <DetailRow label="Email">{user.email}</DetailRow>
            <DetailRow label="Phone">
              <span className="flex items-center gap-2">
                <span className="truncate">{user.phone}</span>
                <VerifiedBadge verified={user.phoneVerified} />
              </span>
            </DetailRow>
            <DetailRow label="Role">{user.roles.join(', ')}</DetailRow>
          </dl>
        </SectionCard>
      </div>
    </>
  )
}
