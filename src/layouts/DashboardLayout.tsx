import {
  Car,
  ClipboardCheck,
  CarFront,
  ChevronsUpDown,
  CirclePlus,
  History,
  LayoutDashboard,
  LogOut,
  Moon,
  Route,
  Search,
  Sun,
  Ticket,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, Outlet, useLocation } from 'react-router'
import { PageError } from '@/components/PageError'
import { ThemeRadioItems } from '@/components/ThemeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/features/auth/api/authSchema'
import { useCurrentUser } from '@/features/auth/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { initials } from '@/lib/text'
import { selectResolvedTheme, useThemeStore } from '@/stores/themeStore'

// No `role` → every logged-in user sees it.
type NavItem = { to: string; label: string; Icon: LucideIcon; role?: Role }

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: 'Dashboard', Icon: LayoutDashboard },
  { to: ROUTES.profile, label: 'My Profile', Icon: UserRound },
  { to: ROUTES.driver.vehicles, label: 'My Vehicles', Icon: CarFront, role: 'DRIVER' },
  { to: ROUTES.driver.rides, label: 'My Rides', Icon: Route, role: 'DRIVER' },
  { to: ROUTES.driver.newRide, label: 'Post a Ride', Icon: CirclePlus, role: 'DRIVER' },
  { to: ROUTES.rider.search, label: 'Find a Ride', Icon: Search, role: 'RIDER' },
  { to: ROUTES.rider.bookings, label: 'My Bookings', Icon: Ticket, role: 'RIDER' },
  { to: ROUTES.admin.users, label: 'Users', Icon: Users, role: 'ADMIN' },
  { to: ROUTES.admin.rides, label: 'Rides', Icon: Car, role: 'ADMIN' },
  { to: ROUTES.admin.vehicles, label: 'Vehicles', Icon: ClipboardCheck, role: 'ADMIN' },
  { to: ROUTES.admin.auditLogs, label: 'Audit log', Icon: History, role: 'ADMIN' },
]

export function DashboardLayout() {
  const { pathname } = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
        </header>
        <div className="flex-1">
          {/* A crashing page shows PageError; the sidebar keeps working. Opening another page clears it. */}
          <ErrorBoundary FallbackComponent={PageError} resetKeys={[pathname]}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar() {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const user = useCurrentUser()
  const navItems = NAV_ITEMS.filter((item) => !item.role || user.roles.includes(item.role))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={env.appName}>
              <Link to={ROUTES.home}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CarFront className="size-4" />
                </div>
                <span className="text-lg font-extrabold tracking-tight">{env.appName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === to}
                    tooltip={label}
                    className="h-10 rounded-xl data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-primary-foreground"
                  >
                    <Link to={to} onClick={() => isMobile && setOpenMobile(false)}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavUser() {
  const user = useCurrentUser()
  const logout = useLogout()
  const resolvedTheme = useThemeStore(selectResolvedTheme)
  const { isMobile, state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile || state === 'expanded' ? 'top' : 'right'}
            align="end"
            sideOffset={8}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          >
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate">{user.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.profile}>
                <UserRound />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {resolvedTheme === 'dark' ? <Moon /> : <Sun />}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <ThemeRadioItems />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
