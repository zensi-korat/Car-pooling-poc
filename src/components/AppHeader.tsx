import { CarFront, LogOut } from 'lucide-react'
import { Link } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { env } from '@/config/env'
import { useAuth } from '@/features/auth/useAuth'
import type { User } from '@/features/auth/types'

export function AppHeader() {
  const auth = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2 rounded-lg font-semibold tracking-tight">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CarFront className="size-4" />
        </div>
        {env.appName}
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {auth.status === 'authenticated' && <UserMenu user={auth.user} onLogout={auth.logout} />}
      </div>
    </header>
  )
}

function UserMenu({ user, onLogout }: Readonly<{ user: User; onLogout: () => Promise<void> }>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
            {user.name.charAt(0)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void onLogout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
