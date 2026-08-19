import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useData } from '@/app/providers/data-provider'
import { navItems } from '@/app/routes/navigation'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'

function SidebarNav() {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )
          }
        >
          <item.icon aria-hidden="true" className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const { ready, profile } = useData()
  const location = useLocation()

  if (!ready) return <LoadingScreen />
  if (!profile) return <Navigate to="/profile" replace state={{ from: location.pathname }} />

  return (
    <div className="min-h-svh md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-muted/30 md:flex md:flex-col md:justify-between md:px-4 md:py-6">
        <div>
          <p className="mb-6 px-3 text-lg font-semibold tracking-tight">TimeBlocking</p>
          <SidebarNav />
        </div>
        <div className="flex items-center justify-between border-t px-3 pt-4">
          <p className="truncate text-sm text-muted-foreground">
            {profile?.name ? `Hi, ${profile.name}` : 'Hi'}
          </p>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <p className="font-semibold tracking-tight">TimeBlocking</p>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <nav
          aria-label="Main navigation"
          className="sticky bottom-0 z-30 grid grid-cols-6 border-t bg-background/95 backdrop-blur md:hidden"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2 text-[11px] font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-2xl font-semibold">Page not found</p>
      <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild variant="outline" className="mt-2">
        <NavLink to="/dashboard">Go to Dashboard</NavLink>
      </Button>
    </div>
  )
}