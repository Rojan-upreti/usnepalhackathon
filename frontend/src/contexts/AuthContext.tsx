import { getApiBaseUrl } from '@/lib/apiBase'
import { getFirebaseAuth, initFirebase } from '@/lib/firebase'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProviderInner({ apiBase, children }: { apiBase: string; children: ReactNode }) {
  const [initError, setInitError] = useState<string | null>(null)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [initRetryNonce, setInitRetryNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setInitError(null)
    initFirebase(apiBase)
      .then(() => {
        if (!cancelled) setFirebaseReady(true)
      })
      .catch((e: unknown) => {
        if (!cancelled) setInitError(e instanceof Error ? e.message : 'Firebase initialization failed.')
      })
    return () => {
      cancelled = true
    }
  }, [apiBase, initRetryNonce])

  useEffect(() => {
    if (!firebaseReady) return
    let cancelled = false
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      if (cancelled) return
      setUser(u)
      setAuthLoading(false)
    })
    void auth.authStateReady().then(() => {
      if (cancelled) return
      setUser(auth.currentUser)
      setAuthLoading(false)
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [firebaseReady])

  const loading = !firebaseReady || authLoading

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut: () => firebaseSignOut(getFirebaseAuth()),
    }),
    [user, loading],
  )

  if (initError) {
    return (
      <div className="font-jakarta flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="max-w-md text-sm font-medium text-red-800">Cannot start auth: {initError}</p>
        <p className="max-w-md text-xs text-slate-600">
          Dev setup: API on <strong className="font-medium">http://127.0.0.1:PORT</strong> (from{' '}
          <code className="rounded bg-slate-200 px-1">PORT</code> in{' '}
          <code className="rounded bg-slate-200 px-1">backend/.env</code>, default 4000 — Vite proxies{' '}
          <code className="rounded bg-slate-200 px-1">/api</code> there), app on{' '}
          <strong className="font-medium">http://127.0.0.1:3000</strong>. From the repo root run{' '}
          <code className="rounded bg-slate-200 px-1">npm install</code> once, then{' '}
          <code className="rounded bg-slate-200 px-1">npm run dev</code> (starts API first, then Vite). Or run{' '}
          <code className="rounded bg-slate-200 px-1">cd backend && npm run dev</code> before{' '}
          <code className="rounded bg-slate-200 px-1">cd frontend && npm run dev</code>. Ensure{' '}
          <code className="rounded bg-slate-200 px-1">backend/.env</code> has{' '}
          <code className="rounded bg-slate-200 px-1">FIREBASE_WEB_*</code> (see{' '}
          <code className="rounded bg-slate-200 px-1">backend/.env.example</code>).
        </p>
        <button
          type="button"
          onClick={() => {
            setFirebaseReady(false)
            setAuthLoading(true)
            setInitRetryNonce((n) => n + 1)
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Retry connection
        </button>
      </div>
    )
  }

  if (!firebaseReady) {
    return (
      <div className="font-jakarta flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const apiBase = getApiBaseUrl()
  const missingProdApi = import.meta.env.PROD && !import.meta.env.VITE_API_URL?.trim()
  if (missingProdApi) {
    return (
      <div className="font-jakarta flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="max-w-md text-sm font-medium text-red-800">
          Set <code className="rounded bg-slate-200 px-1">VITE_API_URL</code> in{' '}
          <code className="rounded bg-slate-200 px-1">frontend/.env</code> before building for production (your deployed
          API origin).
        </p>
      </div>
    )
  }
  return <AuthProviderInner apiBase={apiBase}>{children}</AuthProviderInner>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth must live next to context
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
