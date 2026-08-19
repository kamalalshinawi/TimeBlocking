import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout, NotFoundPage } from '@/app/routes/AppLayout'
import { useData } from '@/app/providers/data-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TodayPage } from '@/features/today/TodayPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { HabitsPage } from '@/features/habits/HabitsPage'
import { PomodoroPage } from '@/features/pomodoro/PomodoroPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function HomeRedirect() {
  const { profile } = useData()
  return <Navigate to={profile ? '/dashboard' : '/profile'} replace />
}

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}