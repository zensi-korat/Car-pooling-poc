import type { z } from 'zod'

// Zod lists every failed rule; a field shows only its first one ("required" before "valid email").
export function fieldErrors<T extends object>(schema: z.ZodType<T>, values: T): Partial<Record<keyof T, string>> {
  const result = schema.safeParse(values)
  const errors: Partial<Record<keyof T, string>> = {}
  if (result.success) return errors
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof T
    errors[field] ??= issue.message
  }
  return errors
}

// {} → true. Works for any form's errors object.
export function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.keys(errors).length === 0
}
