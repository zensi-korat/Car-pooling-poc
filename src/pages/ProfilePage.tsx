import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Loader2, ShieldCheck, UserRound } from 'lucide-react'
import { FormAlert, LabeledField } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge, VerifiedBadge } from '@/components/badges'
import { DetailRow, PageHeader, SectionCard } from '@/components/page'
import { profileFormSchema } from '@/features/auth/api/authSchema'
import { useAuthStore, useCurrentUser } from '@/features/auth/authStore'

export function ProfilePage() {
  const user = useCurrentUser()
  const updateName = useMutation({ mutationFn: useAuthStore((state) => state.updateName) })
  const isSaving = updateName.isPending

  const form = useForm({
    defaultValues: { name: user.name },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileFormSchema },
    onSubmit: ({ value, formApi }) =>
      updateName.mutate(profileFormSchema.parse(value).name, {
        onSuccess: (updated) => formApi.reset({ name: updated.name }),
      }),
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
            {updateName.isError && <FormAlert>{updateName.error.message}</FormAlert>}
            {updateName.isSuccess && (
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
                      updateName.reset()
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
