import { CarFront } from 'lucide-react'
import { Link } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { env } from '@/config/env'

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2 rounded-lg font-semibold tracking-tight">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CarFront className="size-4" />
        </div>
        {env.appName}
      </Link>
      <ThemeToggle />
    </header>
  )
}
