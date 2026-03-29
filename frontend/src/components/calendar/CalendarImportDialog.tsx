import { useAuth } from '@/contexts/AuthContext'
import { loadCalendarEntries, saveCalendarEntries } from '@/lib/calendarEntries'
import { parseIcsFileToCalendarEntries } from '@/lib/icsCalendarImport'
import { MicrosoftSignInPanel } from '@/components/calendar/MicrosoftSignInPanel'
import { GoogleSignInPanel } from '@/components/calendar/GoogleSignInPanel'
import { Building2, FileUp, X, Mail } from 'lucide-react'
import { useRef, useState, type ChangeEventHandler } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  /** Increment to force My Calendar to reload manual entries from localStorage (ICS path). */
  onManualEntriesChanged?: () => void
}

export function CalendarImportDialog({ open, onClose, onManualEntriesChanged }: Props) {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'pick' | 'microsoft' | 'google'>('pick')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetAndClose = () => {
    setStep('pick')
    setMessage(null)
    setError(null)
    onClose()
  }

  const onIcs: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setMessage(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const parsed = parseIcsFileToCalendarEntries(text)
        if (parsed.length === 0) {
          setError('No events found in this .ics file.')
          return
        }
        const existing = loadCalendarEntries()
        const ids = new Set(existing.map((x) => x.id))
        const merged = [...existing]
        for (const p of parsed) {
          if (!ids.has(p.id)) {
            merged.push(p)
            ids.add(p.id)
          }
        }
        saveCalendarEntries(merged)
        setMessage(`Added ${parsed.length} item${parsed.length === 1 ? '' : 's'} from ${file.name}.`)
        onManualEntriesChanged?.()
      } catch {
        setError('Could not read this calendar file.')
      }
    }
    reader.onerror = () => setError('Could not read this file.')
    reader.readAsText(file)
  }

  if (!open) return null

  if (step === 'microsoft' && user) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ms-signin-title"
        onClick={resetAndClose}
      >
        <div className="relative w-full max-w-lg sm:max-w-[480px]" onClick={(ev) => ev.stopPropagation()}>
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute right-3 top-3 z-20 rounded p-2 text-white/90 hover:bg-white/10 sm:text-gray-600 sm:hover:bg-gray-100 dark:sm:text-gray-300 dark:sm:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <span id="ms-signin-title" className="sr-only">
            Microsoft sign in
          </span>
          <MicrosoftSignInPanel
            firebaseUid={user.uid}
            onBack={() => {
              setStep('pick')
              setError(null)
            }}
            onSuccess={(count) => {
              setMessage(`✓ Successfully imported ${count} event${count === 1 ? '' : 's'} from Microsoft 365. Your calendar will refresh automatically.`)
              setStep('pick')
              setTimeout(() => {
                resetAndClose()
              }, 2000)
            }}
            onError={(m) => setError(m)}
          />
        </div>
      </div>
    )
  }

  if (step === 'google' && user) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-signin-title"
        onClick={resetAndClose}
      >
        <div className="relative w-full max-w-lg sm:max-w-[480px]" onClick={(ev) => ev.stopPropagation()}>
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute right-3 top-3 z-20 rounded p-2 text-white/90 hover:bg-white/10 sm:text-gray-600 sm:hover:bg-gray-100 dark:sm:text-gray-300 dark:sm:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <span id="google-signin-title" className="sr-only">
            Google sign in
          </span>
          <GoogleSignInPanel
            firebaseUid={user.uid}
            onBack={() => {
              setStep('pick')
              setError(null)
            }}
            onSuccess={(count) => {
              setMessage(`✓ Successfully imported ${count} event${count === 1 ? '' : 's'} from Google Calendar. Your calendar will refresh automatically.`)
              setStep('pick')
              setTimeout(() => {
                resetAndClose()
              }, 2000)
            }}
            onError={(m) => setError(m)}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-import-title"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 id="cal-import-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Import calendar
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload a calendar file or connect your Google or Microsoft calendar.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          {error ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
              {message}
            </div>
          ) : null}

          <>
            <input
              ref={fileRef}
              type="file"
              accept=".ics,.ical,text/calendar,application/ics"
              hidden
              onChange={onIcs}
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setError('Sign in to import your Microsoft 365 calendar.')
                  return
                }
                setError(null)
                setMessage(null)
                setStep('microsoft')
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Microsoft Teams / Microsoft 365
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Microsoft-style demo sign-in; mock Outlook events save to your account.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setError('Sign in to import your Google Calendar.')
                  return
                }
                setError(null)
                setMessage(null)
                setStep('google')
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Google Workspace / Google Calendar
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Google-style demo sign-in; mock Google Calendar events save to your account.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                <FileUp className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Upload .ics file</span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                  Add events to this device (saved with your other calendar items).
                </span>
              </span>
            </button>
          </>
        </div>
      </div>
    </div>
  )
}
