import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  oauthError: string | null
  clearOauthError: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

type ClientState =
  | { type: 'ready'; client: SupabaseClient }
  | { type: 'error'; message: string }

const AuthContext = createContext<AuthContextValue | null>(null)

function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-xl font-semibold">TimeBlocking can't start</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clientState] = useState<ClientState>(() => {
    try {
      return { type: 'ready', client: createClient() }
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not connect to Supabase.',
      }
    }
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [oauthError, setOauthError] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const errorDescription = params.get('error_description')
    return error ? (errorDescription ?? error) : null
  })

  useEffect(() => {
    if (clientState.type !== 'ready') return
    const supabaseClient = clientState.client

    let active = true

    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      params.delete('error')
      params.delete('error_description')
      const newQuery = params.toString()
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`
      window.history.replaceState({}, '', newUrl)
    }

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setLoading(false)
      })

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [clientState])

  const signInWithGoogle = useCallback(async () => {
    if (clientState.type !== 'ready') throw new Error('Supabase is not configured.')
    const { error } = await clientState.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [clientState])

  const signOut = useCallback(async () => {
    if (clientState.type !== 'ready') throw new Error('Supabase is not configured.')
    const { error } = await clientState.client.auth.signOut()
    if (error) throw error
  }, [clientState])

  const clearOauthError = useCallback(() => setOauthError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, oauthError, clearOauthError, signInWithGoogle, signOut }),
    [user, loading, oauthError, clearOauthError, signInWithGoogle, signOut],
  )

  if (clientState.type === 'error') {
    return <ConfigErrorScreen message={clientState.message} />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}