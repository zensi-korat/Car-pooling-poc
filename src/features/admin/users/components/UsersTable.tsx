import type { ReactNode } from 'react'
import { ListTable, RoleBadge } from '@/components/page'
import { TableCell, TableRow } from '@/components/ui/table'
import type { AdminUser } from '../api/usersSchema'

const HEADINGS = ['Name', 'Email', 'Phone', 'Role', 'Joined']

const joinedFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

type UsersTableProps = Readonly<{
  users: AdminUser[] | undefined
  isUpdating?: boolean
  footer?: ReactNode
}>

export function UsersTable({ users, isUpdating, footer }: UsersTableProps) {
  return (
    <ListTable
      headings={HEADINGS}
      items={users}
      isUpdating={isUpdating}
      emptyMessage="No users found."
      renderRow={(user) => <UserRow user={user} />}
      footer={footer}
    />
  )
}

function UserRow({ user }: Readonly<{ user: AdminUser }>) {
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
      <TableCell className="px-4 text-muted-foreground">{joinedFormat.format(new Date(user.createdAt))}</TableCell>
    </TableRow>
  )
}
