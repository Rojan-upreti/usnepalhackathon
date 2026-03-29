import {
  importMockGoogleCalendarToFirestore,
  MOCK_OAUTH_DELAY_MS,
} from '@/lib/googleMockCalendar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const googleBlue = '#1f2937'
const googleBlueHover = '#374151'
const googleText = '#202124'
const googleSubtext = '#5f6368'
const googleBorder = '#dadce0'
const googleBgPage = '#ffffff'

function GoogleLogo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

type Step = 'email' | 'password' | 'authorizing' | 'success'

type Props = {
  firebaseUid: string
  onBack: () => void
  onSuccess: (count: number) => void
  onError: (message: string) => void
}

const fontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/**
 * Demo UI only: Google-style email → password → fake OAuth redirect, then mock calendar import to Firestore.
 * No real Google / OAuth requests; passwords are not sent anywhere.
 */
export function GoogleSignInPanel({ firebaseUid, onBack, onSuccess, onError }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const authTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (authTimer.current) clearTimeout(authTimer.current)
    }
  }, [])

  const emailTrim = email.trim()
  const displayEmail = emailTrim || 'you@example.com'

  const goPassword = () => {
    if (!emailTrim) {
      onError('Enter an email address to continue (demo).')
      return
    }
    setStep('password')
  }

  const runMockOAuthAndImport = async () => {
    setBusy(true)
    setStep('authorizing')
    
    // Simulate OAuth delay
    await new Promise((resolve) => setTimeout(resolve, MOCK_OAUTH_DELAY_MS))
    
    try {
      console.log('Starting Google Calendar import...')
      const { count } = await importMockGoogleCalendarToFirestore(firebaseUid, emailTrim)
      console.log(`Successfully imported ${count} events`)
      setImportedCount(count)
      setStep('success')
      
      // Show success screen for 1.5 seconds, then close
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onSuccess(count)
    } catch (err) {
      console.error('Import error:', err)
      const message = err instanceof Error ? err.message : 'Could not save mock calendar.'
      onError(message)
      setStep('password')
      setBusy(false)
    }
  }

  const handleSignIn = async () => {
    setBusy(true)
    // Brief pause mimics client-side validation before redirect to IdP
    await new Promise((resolve) => setTimeout(resolve, 400))
    setBusy(false)
    await runMockOAuthAndImport()
  }

  const oauthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?client_id=…&response_type=code&scope=calendar'

  return (
    <div className="overflow-hidden rounded-none sm:rounded-sm" style={{ fontFamily: fontStack }}>
      <div className="relative flex min-h-[420px] flex-col sm:min-h-[480px]" style={{ backgroundColor: googleBgPage }}>
        {step === 'authorizing' ? (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-full max-w-[420px] overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
              <div className="flex items-center gap-2 border-b border-[#dadce0] bg-white px-3 py-2">
                <span className="inline-flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </span>
                <div className="ml-2 min-w-0 flex-1 truncate rounded border border-[#dadce0] bg-white px-2 py-1 text-left text-[11px] text-[#5f6368]">
                  <span className="text-[#1f2937]">🔒</span> {oauthUrl}
                </div>
              </div>
              <div className="flex flex-col items-center px-8 py-12">
                <GoogleLogo size={32} className="mb-6" />
                <p className="text-center text-lg font-normal" style={{ color: googleText }}>
                  Sign in to your account
                </p>
                <p className="mt-2 text-center text-[14px]" style={{ color: googleSubtext }}>
                  Verifying credentials with Google…
                </p>
                <Loader2 className="mt-8 h-9 w-9 animate-spin" style={{ color: '#4285F4' }} aria-hidden />
                <p className="mt-6 max-w-xs text-center text-[12px] leading-relaxed" style={{ color: googleSubtext }}>
                  Third-party apps redirect here so you sign in on Google's domain. This demo simulates that step — no
                  data is sent to Google.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col items-stretch px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto w-full max-w-[440px] bg-white px-10 py-9 shadow-sm border border-[#dadce0] rounded-lg">
            <div className="mb-6 flex justify-center">
              <GoogleLogo />
            </div>

            {step === 'email' ? (
              <>
                <h1 className="text-center text-2xl font-normal leading-tight" style={{ color: googleText }}>
                  Sign in
                </h1>
                <p className="mt-1 text-center text-[15px] leading-snug" style={{ color: googleSubtext }}>
                  to Google Workspace and Calendar
                </p>
                <p className="mt-3 text-center text-[12px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Demo — mock sign-in &amp; sample events only
                </p>

                <div className="mt-8">
                  <label htmlFor="google-signin-email" className="mb-1 block text-[13px] font-normal" style={{ color: googleText }}>
                    Email or phone
                  </label>
                  <input
                    id="google-signin-email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !busy) goPassword()
                    }}
                    disabled={busy}
                    className="box-border w-full border rounded px-3 py-2.5 text-[15px] outline-none transition focus:border-2 focus:px-[11px] focus:py-[9px]"
                    style={{ borderColor: googleBorder, color: googleText }}
                  />
                  <p className="mt-3 text-[13px] leading-relaxed" style={{ color: googleSubtext }}>
                    No account?{' '}
                    <span style={{ color: '#a0a0a0' }}>Create one (disabled in demo)</span>
                  </p>
                </div>

                <div className="mt-8 flex flex-row-reverse items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={goPassword}
                    className="min-h-[36px] min-w-[100px] px-6 py-1.5 rounded text-[15px] font-normal text-white transition disabled:opacity-60"
                    style={{ backgroundColor: googleBlue }}
                    onMouseEnter={(e) => {
                      if (!busy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = googleBlueHover
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = googleBlue
                    }}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onBack}
                    className="min-h-[36px] bg-transparent px-1 py-1.5 rounded text-[15px] font-normal disabled:opacity-50"
                    style={{ color: googleText }}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setPassword('')
                  }}
                  disabled={busy}
                  className="mb-4 flex items-center gap-1 text-[13px] disabled:opacity-50"
                  style={{ color: '#4285F4' }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  {displayEmail}
                </button>
                <h1 className="text-2xl font-normal leading-tight" style={{ color: googleText }}>
                  Enter password
                </h1>
                <p className="mt-1 text-[14px]" style={{ color: googleSubtext }}>
                  Google account
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                    style={{ backgroundColor: '#EA4335' }}
                  >
                    {(displayEmail[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 truncate text-[15px]" style={{ color: googleText }}>
                    {displayEmail}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="google-signin-password" className="mb-1 block text-[13px] font-normal" style={{ color: googleText }}>
                    Password
                  </label>
                  <input
                    id="google-signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !busy) handleSignIn()
                    }}
                    disabled={busy}
                    placeholder=""
                    className="box-border w-full border rounded px-3 py-2.5 text-[15px] outline-none transition focus:border-2 focus:px-[11px] focus:py-[9px]"
                    style={{ borderColor: googleBorder, color: googleText }}
                  />
                  <button
                    type="button"
                    className="mt-2 bg-transparent p-0 text-[13px] font-normal hover:underline"
                    style={{ color: '#4285F4' }}
                  >
                    Forgot my password
                  </button>
                </div>

                <div className="mt-8 flex flex-row-reverse items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSignIn()}
                    className="min-h-[36px] min-w-[100px] px-6 py-1.5 rounded text-[15px] font-normal text-white transition disabled:opacity-60"
                    style={{ backgroundColor: busy ? googleBlueHover : googleBlue }}
                    onMouseEnter={(e) => {
                      if (!busy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = googleBlueHover
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = googleBlue
                    }}
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Please wait…
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setStep('email')}
                    className="min-h-[36px] bg-transparent px-1 py-1.5 rounded text-[15px] font-normal disabled:opacity-50"
                    style={{ color: googleText }}
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-semibold" style={{ color: googleText }}>
                  Connection Successful!
                </h1>
                <p className="mt-2 text-[15px]" style={{ color: googleSubtext }}>
                  {emailTrim}
                </p>
                
                <div className="mt-6 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-950/30">
                  <p className="text-sm font-medium" style={{ color: '#1f2937' }}>
                    ✓ Data saved to Firebase
                  </p>
                  <p className="mt-2 text-[13px]" style={{ color: googleSubtext }}>
                    {importedCount} calendar event{importedCount === 1 ? '' : 's'} imported and synced
                  </p>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: googleSubtext }}>
                    <li>✓ Events synced to your account</li>
                    <li>✓ Available in My Calendar</li>
                    <li>✓ Saved to Firestore database</li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-[12px]" style={{ color: googleSubtext }}>
                    Closing this window to return to import options...
                  </p>
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" style={{ color: '#4285F4' }} aria-hidden />
                </div>
              </div>
            )}

            <p className="mt-8 border-t border-[#dadce0] pt-4 text-center text-[11px] leading-relaxed" style={{ color: googleSubtext }}>
              This flow mimics third-party OAuth: your app sends you to Google, then Google sends you back with an
              authorization. Here everything stays local; calendar rows are mock data for the UI.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to import options
            </button>
            <p className="text-center text-[12px]" style={{ color: googleSubtext }}>
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#4285F4' }}
              >
                Terms of use
              </a>
              <span className="mx-2" style={{ color: '#a0a0a0' }}>|</span>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#4285F4' }}
              >
                Privacy &amp; cookies
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
