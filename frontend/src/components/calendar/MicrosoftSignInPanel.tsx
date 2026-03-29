import {
  importMockMicrosoftCalendarToFirestore,
  MOCK_OAUTH_DELAY_MS,
} from '@/lib/microsoftMockCalendar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const msBlue = '#0078d4'
const msBlueHover = '#106ebe'
const msText = '#1b1b1b'
const msSubtext = '#605e5c'
const msBorder = '#8a8886'
const msBgPage = '#f2f2f2'

function MicrosoftLogo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg className={className} viewBox="0 0 23 23" width={size} height={size} aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
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

const fontStack =
  '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, sans-serif'

/**
 * Demo UI only: Microsoft-style email → password → fake OAuth redirect, then mock calendar import to Firestore.
 * No real Microsoft / Entra requests; passwords are not sent anywhere.
 */
export function MicrosoftSignInPanel({ firebaseUid, onBack, onSuccess, onError }: Props) {
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
      console.log('Starting Microsoft Calendar import...')
      const { count } = await importMockMicrosoftCalendarToFirestore(firebaseUid, emailTrim)
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
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=…&response_type=code&scope=Calendars.Read%20openid'

  return (
    <div className="overflow-hidden rounded-none sm:rounded-sm" style={{ fontFamily: fontStack }}>
      <div className="relative flex min-h-[420px] flex-col sm:min-h-[480px]" style={{ backgroundColor: msBgPage }}>
        {step === 'authorizing' ? (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-full max-w-[420px] overflow-hidden rounded-sm bg-white shadow-2xl ring-1 ring-black/10">
              <div className="flex items-center gap-2 border-b border-[#d2d0ce] bg-[#f3f2f1] px-3 py-2">
                <span className="inline-flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </span>
                <div className="ml-2 min-w-0 flex-1 truncate rounded border border-[#c8c6c4] bg-white px-2 py-1 text-left text-[11px] text-[#323130]">
                  <span className="text-[#107c10]">🔒</span> {oauthUrl}
                </div>
              </div>
              <div className="flex flex-col items-center px-8 py-12">
                <MicrosoftLogo size={32} className="mb-6" />
                <p className="text-center text-lg font-normal" style={{ color: msText }}>
                  Sign in to your account
                </p>
                <p className="mt-2 text-center text-[14px]" style={{ color: msSubtext }}>
                  Verifying credentials with Microsoft…
                </p>
                <Loader2 className="mt-8 h-9 w-9 animate-spin" style={{ color: msBlue }} aria-hidden />
                <p className="mt-6 max-w-xs text-center text-[12px] leading-relaxed" style={{ color: msSubtext }}>
                  Third-party apps redirect here so you sign in on Microsoft’s domain. This demo simulates that step —
                  no data is sent to Microsoft.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col items-stretch px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto w-full max-w-[440px] bg-white px-10 py-9 shadow-sm">
            <div className="mb-6 flex justify-center">
              <MicrosoftLogo />
            </div>

            {step === 'email' ? (
              <>
                <h1 className="text-center text-2xl font-normal leading-tight" style={{ color: msText }}>
                  Sign in
                </h1>
                <p className="mt-2 text-center text-[15px] leading-snug" style={{ color: msSubtext }}>
                  to continue to Microsoft Teams and Outlook calendar
                </p>
                <p className="mt-3 text-center text-[12px] font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
                  Demo — mock sign-in &amp; sample events only
                </p>

                <div className="mt-8">
                  <label htmlFor="ms-signin-email" className="mb-1 block text-[13px] font-normal" style={{ color: msText }}>
                    Email, phone, or Skype
                  </label>
                  <input
                    id="ms-signin-email"
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
                    className="box-border w-full border px-3 py-2.5 text-[15px] outline-none transition focus:border-[2px] focus:px-[11px] focus:py-[9px]"
                    style={{ borderColor: msBorder, color: msText }}
                  />
                  <p className="mt-3 text-[13px] leading-relaxed" style={{ color: msSubtext }}>
                    No account?{' '}
                    <span className="text-[#a19f9d]">Create one (disabled in demo)</span>
                  </p>
                </div>

                <div className="mt-8 flex flex-row-reverse items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={goPassword}
                    className="min-h-[32px] min-w-[108px] px-4 py-1.5 text-[15px] font-normal text-white transition disabled:opacity-60"
                    style={{ backgroundColor: msBlue }}
                    onMouseEnter={(e) => {
                      if (!busy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = msBlueHover
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = msBlue
                    }}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onBack}
                    className="min-h-[32px] bg-transparent px-1 py-1.5 text-[15px] font-normal disabled:opacity-50"
                    style={{ color: msText }}
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
                  style={{ color: msBlue }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  {displayEmail}
                </button>
                <h1 className="text-2xl font-normal leading-tight" style={{ color: msText }}>
                  Enter password
                </h1>
                <p className="mt-1 text-[14px]" style={{ color: msSubtext }}>
                  Microsoft account
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                    style={{ backgroundColor: msBlue }}
                  >
                    {(displayEmail[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 truncate text-[15px]" style={{ color: msText }}>
                    {displayEmail}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="ms-signin-password" className="mb-1 block text-[13px] font-normal" style={{ color: msText }}>
                    Password
                  </label>
                  <input
                    id="ms-signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !busy) handleSignIn()
                    }}
                    disabled={busy}
                    placeholder=""
                    className="box-border w-full border px-3 py-2.5 text-[15px] outline-none transition focus:border-[2px] focus:px-[11px] focus:py-[9px]"
                    style={{ borderColor: msBorder, color: msText }}
                  />
                  <button
                    type="button"
                    className="mt-2 bg-transparent p-0 text-[13px] font-normal hover:underline"
                    style={{ color: msBlue }}
                  >
                    Forgot my password
                  </button>
                </div>

                <div className="mt-8 flex flex-row-reverse items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSignIn()}
                    className="min-h-[32px] min-w-[108px] px-4 py-1.5 text-[15px] font-normal text-white transition disabled:opacity-60"
                    style={{ backgroundColor: busy ? msBlueHover : msBlue }}
                    onMouseEnter={(e) => {
                      if (!busy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = msBlueHover
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = msBlue
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
                    className="min-h-[32px] bg-transparent px-1 py-1.5 text-[15px] font-normal disabled:opacity-50"
                    style={{ color: msText }}
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
                <h1 className="text-2xl font-semibold" style={{ color: msText }}>
                  Connection Successful!
                </h1>
                <p className="mt-2 text-[15px]" style={{ color: msSubtext }}>
                  {emailTrim}
                </p>
                
                <div className="mt-6 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-950/30">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    ✓ Data saved to Firebase
                  </p>
                  <p className="mt-2 text-[13px]" style={{ color: msSubtext }}>
                    {importedCount} calendar event{importedCount === 1 ? '' : 's'} imported and synced
                  </p>
                  <ul className="mt-3 space-y-2 text-[12px]" style={{ color: msSubtext }}>
                    <li>✓ Events synced to your account</li>
                    <li>✓ Available in My Calendar</li>
                    <li>✓ Saved to Firestore database</li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-[12px]" style={{ color: msSubtext }}>
                    Closing this window to return to import options...
                  </p>
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" aria-hidden />
                </div>
              </div>
            )}

            <p className="mt-8 border-t border-[#edebe9] pt-4 text-center text-[11px] leading-relaxed" style={{ color: msSubtext }}>
              This flow mimics third-party OAuth: your app sends you to Microsoft, then Microsoft sends you back with an
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
            <p className="text-center text-[12px]" style={{ color: msSubtext }}>
              <a
                href="https://www.microsoft.com/servicesagreement"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: msBlue }}
              >
                Terms of use
              </a>
              <span className="mx-2 text-[#a19f9d]">|</span>
              <a
                href="https://privacy.microsoft.com/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: msBlue }}
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
