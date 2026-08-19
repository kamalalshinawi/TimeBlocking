import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.58 5.58 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3a6.35 6.35 0 0 1-4.07 1.16c-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a6.7 6.7 0 0 1 0-4.58V6.62H1.29a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0C7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C5.22 6.86 7.87 4.75 12 4.75z"
      />
    </svg>
  )
}

export function LoginPage() {
  const { user, loading, oauthError, clearOauthError, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  async function handleSignIn() {
    setError(null)
    clearOauthError()
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in')
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setError(null)
    clearOauthError()
    setBusy(true)
    try {
      await signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign out')
      setBusy(false)
    }
  }

  if (loading) return <LoadingScreen />

  const displayName = user?.user_metadata?.full_name ?? user?.email
  const avatarUrl = user?.user_metadata?.avatar_url

  const visibleError = oauthError ?? error

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-full max-w-md items-center justify-end">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>TimeBlocking</CardTitle>
          <CardDescription>
            {user
              ? 'You are signed in with Google.'
              : 'Sign in to continue to your schedule.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-10 rounded-full bg-muted"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{displayName}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate(from, { replace: true })}>Continue to app</Button>
                <Button variant="outline" onClick={handleSignOut} disabled={busy}>
                  {busy ? 'Signing out…' : 'Sign out'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button onClick={handleSignIn} disabled={busy} className="w-full">
                <GoogleIcon />
                {busy ? 'Connecting to Google…' : 'Continue with Google'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Signing in with Google creates your account automatically.
              </p>
            </>
          )}

          {visibleError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                {visibleError}
                {oauthError
                  ? ' — Check that this URL is added to the Redirect URLs in your Supabase project.'
                  : ''}
              </p>
              {oauthError ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={clearOauthError}
                >
                  Dismiss
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}