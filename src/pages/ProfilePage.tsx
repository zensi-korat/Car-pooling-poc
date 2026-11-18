import { useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2, ShieldCheck, UserRound } from 'lucide-react'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge, VerifiedBadge } from '@/components/badges'
import { DetailRow, PageHeader, SectionCard } from '@/components/page'
import { profileFormSchema } from '@/features/auth/api/authSchema'
import { useAuthStore, useCurrentUser } from '@/features/auth/authStore'
import { getErrorMessage } from '@/services/api'

export function ProfilePage() {
  const user = useCurrentUser()
  const updateName = useAuthStore((state) => state.updateName)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const form = useForm({
    defaultValues: { name: user.name },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setIsSaving(true)
      setError(null)
      setSaved(false)
      try {
        const updated = await updateName(profileFormSchema.parse(value).name)
        formApi.reset({ name: updated.name })
        setSaved(true)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <>
      <PageHeader title="My Profile" description="Manage your personal details." />

      <div className="flex max-w-3xl flex-col gap-6 p-6">
        <SectionCard title="Personal details" Icon={UserRound}>
          <form
            noValidate
            className="flex max-w-sm flex-col gap-5 p-5"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            {error && <FormAlert>{error}</FormAlert>}
            {saved && (
              <p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Your name was updated.
              </p>
            )}

            <form.Field name="name">
              {(field) => (
                <LabeledField name={field.name} label="Full name" errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    autoComplete="name"
                    maxLength={100}
                    className="h-10"
                    value={field.state.value}
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                      setSaved(false)
                    }}
                    onBlur={field.handleBlur}
                    disabled={isSaving}
                    aria-invalid={!field.state.meta.isValid}
                  />
                </LabeledField>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.name.trim() !== user.name}>
              {(hasChanged) => (
                <Button type="submit" className="h-10 self-start px-5" disabled={isSaving || !hasChanged}>
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" /> Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              )}
            </form.Subscribe>
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
