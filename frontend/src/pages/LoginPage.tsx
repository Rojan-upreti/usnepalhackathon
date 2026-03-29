import { useAuth } from '@/contexts/AuthContext'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { getFirebaseAuth } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const [isRegister, setIsRegister] = useState(modeParam === 'register')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setIsRegister(modeParam === 'register')
  }, [modeParam])

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const auth = getFirebaseAuth()
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(
        getFirebaseAuthErrorMessage(err, isRegister ? 'email-register' : 'email-signin'),
      )
    } finally {
      setPending(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setPending(true)
    try {
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(getFirebaseAuthErrorMessage(err, 'google'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="font-jakarta relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Back to home
        </Link>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 12c5 0 4-8 10-8 0 3 6 3 6 8s-6 5-6 8c-6 0-5-8-10-8Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">EaseUp</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isRegister ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {error ? (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-2 text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
              onClick={() => {
                setIsRegister(!isRegister)
                setError(null)
              }}
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
