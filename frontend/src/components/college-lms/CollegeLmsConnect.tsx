import {
  BlackboardMockConsentPanel,
  BlackboardMockLoginForm,
  CanvasMockConsentPanel,
  CanvasMockLoginForm,
  LmsProviderPicker,
} from '@/components/college-lms/LmsMockLoginScreens'
import { MiniBrowserFrame } from '@/components/college-lms/MiniBrowserFrame'
import { LmsConnectedDashboard } from '@/components/college-lms/LmsConnectedDashboard'
import { UniversityPickerPanel } from '@/components/college-lms/UniversityPickerPanel'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  blackboardDemoLoginUrl,
  canvasDemoLoginUrl,
  collegePortalDemoUrl,
} from '@/lib/collegeDemoUrls'
import { generateLmsDataset } from '@/lib/mockLmsImport'
import { writeUserCollegeName } from '@/lib/userStatsFirestore'
import type { CalendarEntry } from '@/lib/calendarEntries'
import {
  removeLmsIntegration,
  subscribeLmsCalendarEvents,
  subscribeLmsIntegration,
  writeLmsIntegrationAndEvents,
  type LmsIntegrationSettings,
  type LmsProvider,
} from '@/lib/lmsFirestore'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

export type CollegeLmsConnectProps = {
  /** Increment from parent header button to open the sign-in window. */
  connectSignal?: number
}

type Flow =
  | 'idle'
  | 'pick_college'
  | 'portal_loading'
  | 'choose_provider'
  | 'login'
  | 'consent'
  | 'importing'

export function CollegeLmsConnect({ connectSignal = 0 }: CollegeLmsConnectProps) {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const accountLabel = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Student'

  const [integration, setIntegration] = useState<LmsIntegrationSettings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [flow, setFlow] = useState<Flow>('idle')
  const [collegeName, setCollegeName] = useState('')
  const [provider, setProvider] = useState<LmsProvider | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeData, setAgreeData] = useState(false)
  const [agreeCalendar, setAgreeCalendar] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [lmsEvents, setLmsEvents] = useState<CalendarEntry[]>([])

  const lastConnectSignal = useRef(0)
  /** Keeps portal URL stable (avoids about:blank) if state batches oddly after Continue. */
  const portalSchoolRef = useRef('')

  useEffect(() => {
    if (!uid) {
      setIntegration(null)
      return
    }
    return subscribeLmsIntegration(
      uid,
      (s) => {
        setIntegration(s)
        setLoadError(null)
      },
      (e) => setLoadError(e.message),
    )
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setLmsEvents([])
      return
    }
    return subscribeLmsCalendarEvents(
      uid,
      (list) => setLmsEvents(list),
      () => setLmsEvents([]),
    )
  }, [uid])

  useEffect(() => {
    if (connectSignal <= 0 || connectSignal === lastConnectSignal.current) return
    lastConnectSignal.current = connectSignal
    setActionError(null)
    setCollegeName('')
    portalSchoolRef.current = ''
    setFlow('pick_college')
    setProvider(null)
    setAgreeData(false)
    setAgreeCalendar(false)
  }, [connectSignal])

  const closeWindow = useCallback(() => {
    setFlow('idle')
    setCollegeName('')
    portalSchoolRef.current = ''
    setProvider(null)
    setActionError(null)
  }, [])

  const continueFromCollege = useCallback(() => {
    if (!collegeName.trim()) {
      setActionError('Enter or select your university.')
      return
    }
    setActionError(null)
    portalSchoolRef.current = collegeName.trim()
    setFlow('portal_loading')
  }, [collegeName])

  useEffect(() => {
    if (flow !== 'portal_loading') return
    const id = window.setTimeout(() => setFlow('choose_provider'), 2000)
    return () => window.clearTimeout(id)
  }, [flow])

  const pickProvider = (p: LmsProvider) => {
    setActionError(null)
    setProvider(p)
    setEmail(user?.email ?? '')
    setPassword('')
    setFlow('login')
  }

  const submitLogin = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setActionError('Enter your school email.')
      return
    }
    setActionError(null)
    setAgreeData(false)
    setAgreeCalendar(false)
    setFlow('consent')
  }

  const runImport = useCallback(async () => {
    if (!uid || !provider) return
    const school = collegeName.trim()
    if (!school) {
      setActionError('University name is missing.')
      return
    }
    if (!agreeData || !agreeCalendar) {
      setActionError('Accept both to continue.')
      return
    }
    setActionError(null)
    setFlow('importing')
    setImportProgress(0)
    const steps = [20, 55, 85, 100]
    for (const p of steps) {
      await new Promise((r) => setTimeout(r, 320))
      setImportProgress(p)
    }
    try {
      const data = generateLmsDataset(provider, accountLabel, school)
      await writeLmsIntegrationAndEvents(
        uid,
        {
          provider,
          collegeName: school,
          institutionName: data.institutionName,
          semesterLabel: data.semesterLabel,
          courses: data.courses,
          displayName: data.displayName,
        },
        data.events,
      )
      await writeUserCollegeName(uid, school)
      closeWindow()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Import failed.')
      setFlow('consent')
    }
  }, [uid, provider, collegeName, agreeData, agreeCalendar, accountLabel, closeWindow])

  const onRemove = async () => {
    if (!uid) return
    setBusy(true)
    setActionError(null)
    try {
      await removeLmsIntegration(uid)
      setRemoveOpen(false)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not remove.')
    } finally {
      setBusy(false)
    }
  }

  const demoUrl = (() => {
    const school = collegeName.trim() || portalSchoolRef.current.trim()
    const portalFallback = 'https://easeup.app/college-lms/portal'

    if (flow === 'pick_college') return 'https://easeup.app/college-lms/select-school'
    if (flow === 'portal_loading' || flow === 'choose_provider') {
      return school ? collegePortalDemoUrl(school) : portalFallback
    }
    if (!school) return portalFallback
    if (flow === 'importing' && provider) {
      return provider === 'canvas' ? canvasDemoLoginUrl(school) : blackboardDemoLoginUrl(school)
    }
    if (provider === 'canvas') return canvasDemoLoginUrl(school)
    if (provider === 'blackboard') return blackboardDemoLoginUrl(school)
    return portalFallback
  })()

  const browserWindowTitle =
    flow === 'pick_college'
      ? 'Select your college'
      : flow === 'portal_loading'
        ? 'Institution portal'
        : flow === 'choose_provider'
          ? 'College LMS'
          : provider === 'canvas'
            ? 'Canvas — demo'
            : provider === 'blackboard'
              ? 'Blackboard — demo'
              : 'College LMS'

  const windowOpen = flow !== 'idle'

  if (!uid) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to link a college LMS (demo).</p>
    )
  }

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
  }

  const connected = Boolean(integration)

  const portal =
    windowOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
            role="presentation"
            onClick={closeWindow}
          >
            <div
              className="relative"
              role="dialog"
              aria-modal="true"
              aria-label="College LMS sign-in"
              onClick={(e) => e.stopPropagation()}
            >
              <MiniBrowserFrame url={demoUrl} windowTitle={browserWindowTitle} onClose={closeWindow}>
                {flow === 'pick_college' ? (
                  <UniversityPickerPanel
                    collegeName={collegeName}
                    onCollegeNameChange={(v) => {
                      setCollegeName(v)
                      setActionError(null)
                    }}
                    onContinue={continueFromCollege}
                    onBack={closeWindow}
                    error={actionError}
                  />
                ) : null}

                {flow === 'portal_loading' ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center bg-gradient-to-b from-[#eef1f4] to-[#f5f7f9] px-6 py-10 text-center dark:from-[#1f2328] dark:to-[#16191c]">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20 dark:bg-indigo-500/10" aria-hidden />
                      <Loader2
                        className="relative h-11 w-11 animate-spin text-indigo-600 dark:text-indigo-400"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-6 text-sm font-semibold text-gray-800 dark:text-gray-100">Connecting to your school…</p>
                    <p className="mt-1 max-w-[300px] text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      Secure redirect to your institution portal (simulation).
                    </p>
                    {(collegeName.trim() || portalSchoolRef.current) ? (
                      <p
                        className="mt-3 max-w-[300px] truncate text-[11px] font-medium text-gray-600 dark:text-gray-300"
                        title={collegeName.trim() || portalSchoolRef.current}
                      >
                        {collegeName.trim() || portalSchoolRef.current}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {flow === 'choose_provider' ? (
                  <LmsProviderPicker
                    schoolName={collegeName.trim() || portalSchoolRef.current}
                    onPickCanvas={() => pickProvider('canvas')}
                    onPickBlackboard={() => pickProvider('blackboard')}
                    onBack={() => setFlow('pick_college')}
                  />
                ) : null}

                {flow === 'login' && provider === 'canvas' ? (
                  <CanvasMockLoginForm
                    email={email}
                    password={password}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onSubmit={submitLogin}
                    onBack={() => {
                      setActionError(null)
                      setFlow('choose_provider')
                    }}
                    actionError={actionError}
                    demoNote={`You’re signed in to EaseUp as ${accountLabel}. Use any school email below (demo).`}
                  />
                ) : null}

                {flow === 'login' && provider === 'blackboard' ? (
                  <BlackboardMockLoginForm
                    email={email}
                    password={password}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onSubmit={submitLogin}
                    onBack={() => {
                      setActionError(null)
                      setFlow('choose_provider')
                    }}
                    actionError={actionError}
                    demoNote={`EaseUp: ${accountLabel}. Institution fields are simulated.`}
                  />
                ) : null}

                {flow === 'consent' && provider === 'canvas' ? (
                  <CanvasMockConsentPanel
                    agreeData={agreeData}
                    agreeCalendar={agreeCalendar}
                    onAgreeData={setAgreeData}
                    onAgreeCalendar={setAgreeCalendar}
                    onAccept={() => void runImport()}
                    onBack={() => setFlow('login')}
                    actionError={actionError}
                  />
                ) : null}

                {flow === 'consent' && provider === 'blackboard' ? (
                  <BlackboardMockConsentPanel
                    agreeData={agreeData}
                    agreeCalendar={agreeCalendar}
                    onAgreeData={setAgreeData}
                    onAgreeCalendar={setAgreeCalendar}
                    onAccept={() => void runImport()}
                    onBack={() => setFlow('login')}
                    actionError={actionError}
                  />
                ) : null}

                {flow === 'importing' ? (
                  <div
                    className={`space-y-4 p-6 text-center ${
                      provider === 'blackboard' ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'bg-[#f5f5f6] text-[#2d3b45]'
                    }`}
                  >
                    <Loader2
                      className={`mx-auto h-8 w-8 animate-spin ${provider === 'blackboard' ? 'text-[#00C389]' : 'text-[#E72429]'}`}
                      aria-hidden
                    />
                    <p className="text-sm font-medium">Importing from {provider === 'blackboard' ? 'Blackboard' : 'Canvas'}…</p>
                    <div className={`h-1.5 overflow-hidden rounded-full ${provider === 'blackboard' ? 'bg-[#404040]' : 'bg-[#dce3e8]'}`}>
                      <div
                        className={`h-full transition-all duration-300 ${provider === 'blackboard' ? 'bg-[#00C389]' : 'bg-[#E72429]'}`}
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                    <ul className={`mx-auto max-w-[240px] space-y-1.5 text-left text-xs ${provider === 'blackboard' ? 'text-[#a3a3a3]' : 'text-[#5c6c7c]'}`}>
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${importProgress >= 20 ? (provider === 'blackboard' ? 'text-[#00C389]' : 'text-[#E72429]') : 'opacity-30'}`}
                        />
                        Courses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${importProgress >= 55 ? (provider === 'blackboard' ? 'text-[#00C389]' : 'text-[#E72429]') : 'opacity-30'}`}
                        />
                        Assignments &amp; quizzes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${importProgress >= 85 ? (provider === 'blackboard' ? 'text-[#00C389]' : 'text-[#E72429]') : 'opacity-30'}`}
                        />
                        Discussions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${importProgress >= 100 ? (provider === 'blackboard' ? 'text-[#00C389]' : 'text-[#E72429]') : 'opacity-30'}`}
                        />
                        Save
                      </li>
                    </ul>
                  </div>
                ) : null}
              </MiniBrowserFrame>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div className="space-y-4">
      {!connected ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">Connect LMS</span> in the bar above — the sign-in
          opens in a small browser window (demo; nothing is sent to Canvas or Blackboard).
        </p>
      ) : null}

      {actionError && !windowOpen ? (
        <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {actionError}
        </p>
      ) : null}

      {connected && integration ? (
        <LmsConnectedDashboard
          integration={integration}
          events={lmsEvents}
          demoLoginUrl={
            integration.provider === 'canvas'
              ? canvasDemoLoginUrl(integration.collegeName)
              : blackboardDemoLoginUrl(integration.collegeName)
          }
          onRemoveClick={() => setRemoveOpen(true)}
          removeBusy={busy}
        />
      ) : null}

      {portal}

      <ConfirmDialog
        open={removeOpen}
        title="Remove College LMS?"
        description="Disconnects your linked LMS and deletes imported calendar events. Your own calendar entries stay."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={() => void onRemove()}
        onCancel={() => setRemoveOpen(false)}
      />
    </div>
  )
}
