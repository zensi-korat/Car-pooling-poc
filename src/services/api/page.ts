import { z } from 'zod'

// Every paginated list answers { items, total, page, pageSize }.
// pageSchema(userSchema) checks the wrapper AND every row.
export function pageSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(), // rows matching the filters, across ALL pages
    page: z.number(),
    pageSize: z.number(),
  })
}

// Page<User> is still the plain type, for props and hooks.
export type Page<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}
