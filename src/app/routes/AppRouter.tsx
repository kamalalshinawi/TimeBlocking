import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout, NotFoundPage } from '@/app/routes/AppLayout'
import { useData } from '@/app/providers/data-provider'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TodayPage } from '@/features/today/TodayPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

function HomeRedirect() {
  const { profile } = useData()
  return <Navigate to={profile ? '/dashboard' : '/profile'} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}