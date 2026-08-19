import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, LogOut, RefreshCcw, Trash2, User } from 'lucide-react'
import { useData } from '@/app/providers/data-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ThemePreference } from '@/domain/types'

export function SettingsPage() {
  const { profile, exportData, importData, clearAllData } = useData()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      toast('Could not sign out', 'destructive')
      setSigningOut(false)
    }
  }

  function handleExport() {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timeblocking-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast('Backup downloaded')
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      await importData(text)
      toast('Data imported successfully')
    } catch {
      toast('Import failed — not a valid backup file', 'destructive')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleClearAll() {
    await clearAllData()
    toast('All data cleared')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LogOut aria-hidden="true" className="size-4" />
              Account
            </CardTitle>
            <CardDescription>Your Google account used to sign in.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">Signed in with Google</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User aria-hidden="true" className="size-4" />
            Profile
          </CardTitle>
          <CardDescription>Your local profile. It never leaves this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{profile?.name ?? 'No profile'}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.timezone ?? 'No timezone'} · {profile?.timeFormat ?? '12h'} time format
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/profile">Edit profile</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose the color theme for the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={(value) => setTheme(value as ThemePreference)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>
            Export a JSON backup, import one back, or clear everything. Imported data is validated
            before it is loaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download aria-hidden="true" />
              Export data
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <RefreshCcw aria-hidden="true" />
              {importing ? 'Importing…' : 'Import data'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
              aria-label="Import backup file"
            />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 aria-hidden="true" />
                Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your profile, tasks, time blocks, projects, habits,
                  pomodoro sessions, and categories from this browser. Export a backup first if you
                  want to keep your data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void handleClearAll()
                  }}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}