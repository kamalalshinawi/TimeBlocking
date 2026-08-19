import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from '@/app/routes/AppRouter'
import { DataProvider } from '@/app/providers/data-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { AuthProvider } from '@/app/providers/auth-provider'
import { ToastProvider } from '@/components/shared/toast'
import { ErrorBoundary } from '@/components/shared/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)