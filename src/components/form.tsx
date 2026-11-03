// Reusable form building blocks, used by login (and later signup, verify phone…).
// Usage: import { FormAlert, PasswordField, TextField } from '@/components/form'

import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Props shared by TextField and PasswordField: every prop a normal <Input>
// accepts (type, value, onChange, disabled, ref…), plus ours.
type FieldProps = ComponentProps<typeof Input> & {
  id?: string // optional: if you don't pass one, a unique id is generated (useId)
  label: string
  error?: string
}

// ─── useFieldA11y (a small custom hook, only used in this file) ─────────────
// Both fields need the same id + accessibility wiring, so it's written once here.
function useFieldA11y(idFromProps: string | undefined, error: string | undefined) {
  // useId(): an id that is unique on the page and the same on every render.
  // Two login forms on one page would no longer fight over id="email".
  const generatedId = useId()
  const id = idFromProps ?? generatedId
  const errorId = `${id}-error`

  return {
    id,
    errorId,
    // Spread onto the <Input>: red border + screen readers know it's wrong and read the message.
    inputA11y: {
      id,
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined,
    },
  }
}

// ─── FormField ──────────────────────────────────────────────────────────────
// The shell every field shares: label on top, the input, the error message below.
type FormFieldProps = {
  id: string // the input's id: clicking the label focuses that input
  errorId: string // the id the input's aria-describedby points to
  label: string
  error?: string
  children: ReactNode // the input itself (TextField / PasswordField put theirs here)
}

export function FormField({ id, errorId, label, error, children }: Readonly<FormFieldProps>) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── TextField ──────────────────────────────────────────────────────────────
// A labelled input with its error message. Usage:
// <TextField label="Email" type="email" value={…} onChange={…} error={errors.email} />
export function TextField({ id: idProp, label, error, className, ...inputProps }: Readonly<FieldProps>) {
  const { id, errorId, inputA11y } = useFieldA11y(idProp, error)

  return (
    <FormField id={id} errorId={errorId} label={label} error={error}>
      <Input
        {...inputProps} // ← "rest props": type, value, onChange, ref… go straight to the Input
        {...inputA11y} // after the rest, so the id/aria wiring can't be overwritten by accident
        className={cn('h-10', className)} // cn = OUR classes + the caller's, merged
      />
    </FormField>
  )
}

// ─── PasswordField ──────────────────────────────────────────────────────────
// A password input with a show/hide button. The show/hide state lives HERE,
// so forms using it don't have to manage it.
// Omit<…, 'type'>: the field controls `type` itself (password ↔ text), so callers can't pass it.
export function PasswordField({
  id: idProp,
  label,
  error,
  className,
  ...inputProps
}: Readonly<Omit<FieldProps, 'type'>>) {
  const { id, errorId, inputA11y } = useFieldA11y(idProp, error)
  const [visible, setVisible] = useState(false)

  return (
    <FormField id={id} errorId={errorId} label={label} error={error}>
      {/* relative = the eye button below is positioned inside this box */}
      <div className="relative">
        <Input
          {...inputProps}
          {...inputA11y}
          type={visible ? 'text' : 'password'}
          // Merged, not replaced: pr-10 must stay or the text runs under the eye button.
          className={cn('h-10 pr-10', className)}
        />
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
    </FormField>
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
