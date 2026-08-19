import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useData } from '@/app/providers/data-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { nowIso } from '@/storage/database'
import { commonTimezones, detectDefaultTimeFormat, detectTimezone } from '@/utils/date/time-format'
import type { ThemePreference, TimeFormat } from '@/domain/types'

export function ProfilePage() {
  const { profile, saveProfile, ready } = useData()
  const { setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState(profile?.name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [timezone, setTimezone] = useState(profile?.timezone ?? detectTimezone())
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(
    profile?.timeFormat ?? detectDefaultTimeFormat(),
  )
  const [theme, setThemeState] = useState<ThemePreference>(profile?.theme ?? 'system')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = !profile
  const timezoneOptions = useMemo(() => {
    const detected = detectTimezone()
    if (commonTimezones.includes(detected)) return commonTimezones
    return [detected, ...commonTimezones]
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const timestamp = nowIso()
      await saveProfile({
        id: profile?.id ?? crypto.randomUUID(),
        name: trimmedName,
        email: email.trim(),
        timezone,
        timeFormat,
        theme,
        createdAt: profile?.createdAt ?? timestamp,
        updatedAt: timestamp,
      })
      setTheme(theme)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== '/profile' ? from : '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!ready) return null

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isNew ? 'Welcome to TimeBlocking' : 'Edit profile'}</CardTitle>
          <CardDescription>
            {isNew
              ? 'Set up your local profile to get started. Everything stays on this device.'
              : 'Update your local profile details.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email (optional)</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="profile-timezone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezoneOptions.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-timeformat">Time format</Label>
                <Select
                  value={timeFormat}
                  onValueChange={(value) => setTimeFormat(value as TimeFormat)}
                >
                  <SelectTrigger id="profile-timeformat" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(value) => setThemeState(value as ThemePreference)}
                >
                  <SelectTrigger id="profile-theme" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Get started' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}