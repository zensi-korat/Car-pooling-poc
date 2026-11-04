import type { ReactNode } from 'react'
import { BadgeCheck, Clock } from 'lucide-react'
import { RoleBadge, StatusBadge } from '@/components/page'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { User } from '@/features/auth/types'
import { cn } from '@/lib/utils'

const HEADINGS = ['Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined']
const SKELETON_ROWS = 5

const joinedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

type UsersTableProps = Readonly<{
  users: User[] | undefined
  isUpdating?: boolean
  footer?: ReactNode
}>

export function UsersTable({ users, isUpdating, footer }: UsersTableProps) {
  let rows: ReactNode
  if (!users) rows = <SkeletonRows />
  else if (users.length === 0) rows = <MessageRow>No users found.</MessageRow>
  else rows = users.map((user) => <UserRow key={user.id} user={user} />)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table aria-busy={isUpdating} className={cn('transition-opacity', isUpdating && 'opacity-60')}>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {HEADINGS.map((heading) => (
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

function UserRow({ user }: Readonly<{ user: User }>) {
  return (
    <TableRow>
      <TableCell className="px-4 font-medium">{user.name}</TableCell>
      <TableCell className="px-4 text-muted-foreground">{user.email}</TableCell>
      <TableCell className="px-4 text-muted-foreground">{user.phone}</TableCell>
      <TableCell className="px-4">
        <span className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </span>
      </TableCell>
      <TableCell className="px-4">
        {user.phoneVerified ? (
          <StatusBadge tone="green">
            <BadgeCheck /> Verified
          </StatusBadge>
        ) : (
          <StatusBadge tone="amber">
            <Clock /> Pending
          </StatusBadge>
        )}
      </TableCell>
      <TableCell className="px-4 text-muted-foreground">{joinedFormat.format(new Date(user.createdAt))}</TableCell>
    </TableRow>
  )
}

function SkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, row) => (
    <TableRow key={row}>
      {HEADINGS.map((heading) => (
        <TableCell key={heading} className="px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

function MessageRow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <TableRow>
      <TableCell colSpan={HEADINGS.length} className="h-24 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  )
}
