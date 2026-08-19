import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from '@/app/routes/AppRouter'
import { DataProvider } from '@/app/providers/data-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { ToastProvider } from '@/components/shared/toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </DataProvider>
    </ThemeProvider>
  </StrictMode>,
)