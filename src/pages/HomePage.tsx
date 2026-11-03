import { BadgeCheck, TriangleAlert } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUser } from '@/features/auth/useAuth'

export function HomePage() {
  const user = useCurrentUser()

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Hi, {user.name} 👋</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span key={role} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>

            {user.phoneVerified ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="size-4" /> Phone verified
              </p>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground">
                <TriangleAlert className="size-4" /> Phone not verified yet
              </p>
            )}

            <p className="rounded-lg bg-muted p-3 text-muted-foreground">
              Reload the page: you stay logged in, because the app asks the server who you are on every load.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
