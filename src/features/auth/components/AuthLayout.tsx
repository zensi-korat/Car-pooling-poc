import { IndianRupee, Route, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { env } from '@/config/env'

const FEATURES: { title: string; description: string; Icon: LucideIcon }[] = [
  { title: 'Rides on your route', description: 'See who is heading your way, right on the map.', Icon: Route },
  { title: 'Split the fare', description: 'One total fare, shared among the riders.', Icon: IndianRupee },
  { title: 'People you can trust', description: 'Verified phone numbers and approved vehicles.', Icon: ShieldCheck },
]

type AuthLayoutProps = Readonly<{ title: string; description: ReactNode; footer: ReactNode; children: ReactNode }>

export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col">
        <AppHeader />

        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="flex w-full max-w-sm flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {children}

            <p className="text-center text-sm text-muted-foreground">{footer}</p>
          </div>
        </main>
      </div>

      <AuthShowcase />
    </div>
  )
}

function AuthShowcase() {
  return (
    <aside className="relative hidden flex-col justify-center gap-12 overflow-hidden border-l bg-muted p-12 lg:flex">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <RoutePreview />

      <div className="relative flex max-w-md flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Going the same way? Share the ride.</h2>
        <p className="text-muted-foreground">
          {env.appName} connects drivers who have empty seats with riders heading in the same direction.
        </p>
      </div>

      <ul className="relative flex flex-col gap-5">
        {FEATURES.map(({ title, description, Icon }) => (
          <li key={title} className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
              <Icon className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{title}</span>
              <span className="text-sm text-muted-foreground">{description}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

// A picture of a ride, drawn like the real map: hollow start dot, road line, filled end dot, fare bubble.
function RoutePreview() {
  return (
    <div aria-hidden className="relative flex max-w-md flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm">
      <div className="relative aspect-[5/3]">
        <svg viewBox="0 0 400 240" fill="none" className="absolute inset-0 size-full">
          <path
            d="M40 200 C 140 200, 110 90, 200 100 S 290 40, 360 40"
            className="stroke-primary"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle cx="40" cy="200" r="9" className="fill-background stroke-primary" strokeWidth={4} />
          <circle cx="360" cy="40" r="9" className="fill-primary stroke-background" strokeWidth={3} />
        </svg>
        <span className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground tabular-nums shadow-md">
          ₹120 / seat
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="truncate font-medium">Ahmedabad → Gandhinagar</span>
        <span className="shrink-0 text-muted-foreground">3 seats left</span>
      </div>
    </div>
  )
}
