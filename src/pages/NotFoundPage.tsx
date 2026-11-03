import { Link } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-16 text-center">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground">This page doesn't exist or has moved.</p>
        </div>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </main>
    </div>
  )
}
