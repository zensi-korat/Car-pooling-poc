import { Fragment, type ComponentType, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PAGE_SIZES } from '@/lib/pagination'

type PageHeaderProps = Readonly<{
  title: string
  description?: ReactNode
  children?: ReactNode
}>

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b px-6 py-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

type SectionCardProps = Readonly<{
  title: string
  Icon: ComponentType<{ className?: string }>
  aside?: ReactNode
  children: ReactNode
}>

export function SectionCard({ title, Icon, aside, children }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex items-center gap-3 border-b bg-muted/50 px-5 py-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h2 className="font-semibold">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

export function DetailRow({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-3.5 text-sm sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{children}</dd>
    </div>
  )
}

// A table cell with a bold first line and a small grey second line (name + email, make + plate…).
export function TwoLines({ main, sub }: Readonly<{ main: ReactNode; sub: ReactNode }>) {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{main}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  )
}

const SKELETON_ROWS = 5

type ListTableProps<T> = Readonly<{
  headings: readonly string[]
  items: T[] | undefined
  isUpdating?: boolean
  emptyMessage: string
  renderRow: (item: T) => ReactNode
  footer?: ReactNode
}>

// The frame every admin list shares: headings, then skeleton rows while loading,
// a message when empty, or one row per item. `renderRow` draws the item's <TableRow>.
export function ListTable<T extends { id: string }>({
  headings,
  items,
  isUpdating,
  emptyMessage,
  renderRow,
  footer,
}: ListTableProps<T>) {
  let rows: ReactNode
  if (!items || isUpdating) {
    rows = Array.from({ length: SKELETON_ROWS }, (_, row) => (
      <TableRow key={row}>
        {headings.map((heading) => (
          <TableCell key={heading} className="px-4 py-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
        ))}
      </TableRow>
    ))
  } else if (items.length === 0) {
    rows = (
      <TableRow>
        <TableCell colSpan={headings.length} className="h-24 text-center text-muted-foreground">
          {emptyMessage}
        </TableCell>
      </TableRow>
    )
  } else {
    rows = items.map((item) => <Fragment key={item.id}>{renderRow(item)}</Fragment>)
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table aria-busy={isUpdating}>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {headings.map((heading) => (
              <TableHead key={heading} className="px-4">
                {heading}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
      {footer}
    </div>
  )
}

type TablePaginationProps = Readonly<{
  page: number
  pageSize: number
  total: number
  disabled?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}>

export function TablePagination({
  page,
  pageSize,
  total,
  disabled,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground"
    >
      <p aria-live="polite">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page">Rows per page</Label>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger id="rows-per-page" size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <span>
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page >= totalPages}
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
