// Form building blocks for TanStack Form fields.
// Usage: <form.Field name="email">{(field) => <LabeledField …><Input id={field.name} … /></LabeledField>}</form.Field>

import { useState, type ComponentProps, type ReactNode } from 'react'
import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── PasswordInput ──────────────────────────────────────────────────────────
// An <Input> with a show/hide button, for use inside LabeledField. It controls `type` itself.
export function PasswordInput({ className, ...inputProps }: Readonly<Omit<ComponentProps<typeof Input>, 'type'>>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...inputProps} type={visible ? 'text' : 'password'} className={cn('h-10 pr-10', className)} />
      <Button
        type="button" // ⚠ without this, any button inside a <form> SUBMITS the form
        variant="ghost"
        size="icon"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1 right-1 text-muted-foreground"
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}

// ─── FormAlert ──────────────────────────────────────────────────────────────
// The red box for a whole-form error, e.g. the server's "Invalid email or password".
// role="alert": screen readers announce it as soon as it appears.
export function FormAlert({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// ─── LabeledField ───────────────────────────────────────────────────────────
// Label + control + hint + first error, for TanStack Form fields (shadcn's Field pieces).
// The control inside needs id={field.name} and aria-invalid={!field.state.meta.isValid}.
type LabeledFieldProps = Readonly<{
  name: string // the control's id: clicking the label focuses it
  label: string
  description?: string
  errors: ReadonlyArray<{ message?: string } | undefined>
  children: ReactNode
}>

export function LabeledField({ name, label, description, errors, children }: LabeledFieldProps) {
  // Zod can report several problems for one field; we show only the first.
  const shown = errors.filter(Boolean).slice(0, 1)

  return (
    <Field data-invalid={shown.length > 0}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={shown} />
    </Field>
  )
}
