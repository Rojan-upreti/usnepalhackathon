import {
  ArrowRight,
  Brain,
  Briefcase,
  CalendarDays,
  HeartHandshake,
  HeartPulse,
  Moon,
  Sparkles,
} from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  DashboardMentalHealthSection,
  getDailyAffirmation,
  stressCopy,
} from '@/components/dashboard/DashboardMentalHealthSection'
import { MonthCalendarView } from '@/components/dashboard/MonthCalendarView'
import { useUserRole } from '@/contexts/UserRoleContext'
import { useCalendarDisplayEntries } from '@/hooks/useCalendarDisplayEntries'
import type { CalendarEntry } from '@/lib/calendarEntries'
import {
  formatEntryTimeSummary,
  isGoogleCalendarEntry,
  isLmsEntry,
  isMicrosoftCalendarEntry,
  minutesSinceMidnight,
  parseISODateLocal,
  toISODateLocal,
} from '@/lib/calendarEntries'
import { generateMockSleepData } from '@/lib/sleepDataTypes'
import { cn } from '@/lib/utils'

const SAGE = '#95B18E'
const ORANGE = '#F2994A'
const SLEEP_GOAL_HOURS = 8

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const CARD_PAD = 'p-5 sm:p-6'
/** Tight padding for square metric tiles */
const SQUARE_PAD = 'p-4 sm:p-5'
const KICKER =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400'
const BODY = 'text-sm leading-6 text-gray-600 dark:text-gray-400'
const SECTION_TITLE = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function startOfISOWeekMonday(d: Date) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function countsPerWeekdayThisMonth(entries: CalendarEntry[], year: number, month: number) {
  const c = [0, 0, 0, 0, 0, 0, 0]
  for (const e of entries) {
    const p = parseISODateLocal(e.date)
    if (!p || p.y !== year || p.m !== month) continue
    const wd = (new Date(p.y, p.m, p.d).getDay() + 6) % 7
    c[wd]++
  }
  return c
}

function weekEventCount(entries: CalendarEntry[], weekStart: Date) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const t0 = weekStart.getTime()
  const t1 = weekEnd.getTime()
  let n = 0
  for (const e of entries) {
    const t = new Date(`${e.date}T12:00:00`).getTime()
    if (t >= t0 && t < t1) n++
  }
  return n
}

function isMeetingLikeEntry(e: CalendarEntry): boolean {
  return (
    isMicrosoftCalendarEntry(e) || isGoogleCalendarEntry(e) || (e.type === 'time_block' && Boolean(e.startTime))
  )
}

function inferEndMinutes(e: CalendarEntry): number {
  if (e.endTime) return minutesSinceMidnight(e.endTime)
  if (e.startTime) return minutesSinceMidnight(e.startTime) + 60
  return 0
}

function backToBackPairsOnDay(entries: CalendarEntry[]): number {
  const timed = entries
    .filter((e) => e.startTime)
    .sort((a, b) => minutesSinceMidnight(a.startTime!) - minutesSinceMidnight(b.startTime!))
  let c = 0
  for (let i = 1; i < timed.length; i++) {
    const prev = timed[i - 1]!
    const cur = timed[i]!
    const gap = minutesSinceMidnight(cur.startTime!) - inferEndMinutes(prev)
    if (gap >= 0 && gap < 15) c++
  }
  return c
}

function busyDescriptor(count: number): { title: string; subtitle: string; load: number } {
  if (count <= 4) {
    return {
      title: 'Room to breathe',
      subtitle: 'Your calendar is light this week — good space for rest and focus.',
      load: Math.min(100, Math.round((count / 4) * 35)),
    }
  }
  if (count <= 12) {
    return {
      title: 'Balanced rhythm',
      subtitle: 'A steady mix of commitments. Watch sleep on your busiest days.',
      load: 40 + Math.round(((count - 4) / 8) * 35),
    }
  }
  return {
    title: 'High demand week',
    subtitle: 'Lots on the calendar — prioritize wind-down and consistent bedtimes.',
    load: Math.min(100, 75 + Math.round(((count - 12) / 15) * 25)),
  }
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** Tighter cards for the narrow left column (w-64). */
const SIDEBAR_PAD = 'p-3.5 sm:p-4'

function DashboardStressWeekCard({
  busyLoad,
  widthClass = '',
  compact = false,
}: {
  busyLoad: number
  widthClass?: string
  compact?: boolean
}) {
  const headingId = useId().replace(/:/g, '')
  const stress = useMemo(() => stressCopy(busyLoad), [busyLoad])
  const pad = compact ? SIDEBAR_PAD : CARD_PAD
  return (
    <section className={`${CARD} ${pad} ${widthClass}`.trim()} aria-labelledby={headingId}>
      <div className={`flex items-start justify-between ${compact ? 'gap-2' : 'gap-3'}`}>
        <div className={`flex min-w-0 items-center ${compact ? 'gap-2' : 'gap-3'}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
              compact ? 'h-8 w-8 rounded-lg' : 'h-10 w-10'
            }`}
            style={{ backgroundColor: ORANGE }}
          >
            <Brain className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={compact ? 'text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400' : KICKER}>
              Stress & week
            </p>
            <p
              id={headingId}
              className={
                compact
                  ? 'mt-0.5 text-sm font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-100'
                  : `${SECTION_TITLE} mt-0.5`
              }
            >
              {stress.title}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-md font-bold tabular-nums text-white ${
            compact ? 'px-2 py-0.5 text-[10px]' : 'rounded-lg px-2.5 py-1 text-xs'
          }`}
          style={{ backgroundColor: ORANGE }}
        >
          {busyLoad}
        </span>
      </div>
      <p
        className={`${BODY} leading-relaxed ${compact ? 'mt-2 text-[11px] leading-5 sm:text-xs' : 'mt-4 text-xs sm:text-sm'}`}
      >
        {stress.body}
      </p>
      <div className={compact ? 'mt-3' : 'mt-5'}>
        <div
          className={`mb-1 flex justify-between font-medium text-gray-500 dark:text-gray-400 ${
            compact ? 'text-[10px]' : 'mb-1.5 text-xs'
          }`}
        >
          <span>Week load index</span>
          <span className="tabular-nums text-gray-700 dark:text-gray-300">{busyLoad}/100</span>
        </div>
        <div className={`overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ${compact ? 'h-1.5' : 'h-2'}`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, busyLoad)}%`,
              background: `linear-gradient(90deg, ${SAGE}, ${ORANGE})`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

function DashboardReminderCard({
  affirmation,
  widthClass = '',
  compact = false,
}: {
  affirmation: string
  widthClass?: string
  compact?: boolean
}) {
  const pad = compact ? SIDEBAR_PAD : CARD_PAD
  return (
    <section className={`${CARD} ${pad} ${widthClass}`.trim()}>
      <div className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-300 ${
            compact ? 'h-8 w-8 rounded-lg' : 'h-10 w-10'
          }`}
        >
          <HeartHandshake className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={
              compact
                ? 'text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400'
                : KICKER
            }
          >
            Reminder
          </p>
          <p
            className={
              compact
                ? 'mt-0.5 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100'
                : `${SECTION_TITLE} mt-0.5 leading-snug`
            }
          >
            {affirmation}
          </p>
        </div>
      </div>
      <p className={`${BODY} leading-relaxed ${compact ? 'mt-2.5 text-[11px]' : 'mt-4 text-xs sm:text-sm'}`}>
        Crisis support (US):{' '}
        <a
          href="tel:988"
          className="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-2 hover:text-rose-700 dark:text-rose-400"
        >
          988
        </a>
        {' · '}24/7
      </p>
    </section>
  )
}

function DashboardInsightCard({
  description,
  widthClass = '',
  compact = false,
}: {
  description: string
  widthClass?: string
  compact?: boolean
}) {
  const pad = compact ? SIDEBAR_PAD : CARD_PAD
  return (
    <section
      className={`${CARD} flex flex-col bg-gradient-to-br from-white via-white to-gray-50/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/95 ${pad} ${widthClass}`.trim()}
    >
      <div className={`flex items-center ${compact ? 'gap-2' : 'gap-2.5'}`}>
        <Sparkles
          className={`shrink-0 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`}
          style={{ color: ORANGE }}
          aria-hidden
        />
        <h2 className={compact ? 'text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100' : SECTION_TITLE}>
          Insight
        </h2>
      </div>
      <p
        className={`${BODY} flex-1 leading-relaxed ${compact ? 'mt-2 line-clamp-4 text-[11px] sm:text-xs' : 'mt-3'}`}
      >
        {description}
      </p>
      <Link
        to="/insight"
        className={`inline-flex items-center gap-1 font-semibold transition hover:opacity-80 ${compact ? 'mt-2.5 text-xs' : 'mt-5 text-sm'}`}
        style={{ color: SAGE }}
      >
        Open Insights
        <ArrowRight className={compact ? 'h-3 w-3' : 'h-4 w-4'} aria-hidden />
      </Link>
    </section>
  )
}

function SleepScoreRing({ ringPct, className }: { ringPct: number; className: string }) {
  return (
    <div className={`relative mx-auto flex shrink-0 items-center justify-center ${className}`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-100 dark:text-gray-800"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={SAGE}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(ringPct / 100) * 251.2} 251.2`}
        />
      </svg>
      <div className="relative text-center">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">{ringPct}%</p>
        <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">Sleep score</p>
      </div>
    </div>
  )
}

export type DashboardHealthOverviewProps = {
  greeting: string
  userEmail?: string | null
  manualRefreshSignal: number
  detailSlot?: ReactNode
}

export function DashboardHealthOverview({
  greeting,
  userEmail,
  manualRefreshSignal,
  detailSlot,
}: DashboardHealthOverviewProps) {
  const [mutationTick, setMutationTick] = useState(0)
  const refreshKey = manualRefreshSignal + mutationTick
  const displayEntries = useCalendarDisplayEntries(refreshKey)
  const sleep = useMemo(() => generateMockSleepData(), [])
  const { status: workStatus } = useUserRole()

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const monthLabel = `${MONTH_NAMES_SHORT[m]} ${y}`

  const weekdayCounts = useMemo(() => countsPerWeekdayThisMonth(displayEntries, y, m), [displayEntries, y, m])
  const maxBar = Math.max(1, ...weekdayCounts)

  const weekStart = startOfISOWeekMonday(now)
  const thisWeekN = useMemo(() => weekEventCount(displayEntries, weekStart), [displayEntries, weekStart])
  const busy = busyDescriptor(thisWeekN)

  const debtHours = Math.max(0, SLEEP_GOAL_HOURS - sleep.current.duration)
  const debtMinutes = Math.round(debtHours * 60)
  const sleepHeadline =
    debtMinutes <= 0
      ? 'On track'
      : debtMinutes < 60
        ? `${debtMinutes} min behind`
        : `${Math.floor(debtMinutes / 60)}h ${debtMinutes % 60}m behind`
  const sleepMeta = `Target ${SLEEP_GOAL_HOURS}h · ${sleep.current.duration.toFixed(1)}h last night · ${sleep.current.quality} quality`

  const upcoming = useMemo(() => {
    const todayIso = toISODateLocal(new Date())
    return [...displayEntries]
      .filter((e) => e.date >= todayIso)
      .sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date)))
      .slice(0, 5)
  }, [displayEntries])

  const professionalWeek = useMemo(() => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const t0 = weekStart.getTime()
    const t1 = weekEnd.getTime()
    const meetings = displayEntries.filter((e) => {
      const t = new Date(`${e.date}T12:00:00`).getTime()
      return t >= t0 && t < t1 && isMeetingLikeEntry(e)
    })
    const byDay = new Map<string, CalendarEntry[]>()
    for (const e of meetings) {
      const list = byDay.get(e.date) ?? []
      list.push(e)
      byDay.set(e.date, list)
    }
    let backToBack = 0
    for (const list of byDay.values()) backToBack += backToBackPairsOnDay(list)
    return { count: meetings.length, backToBack }
  }, [displayEntries, weekStart])

  const showProCard = workStatus === 'professional' || workStatus === 'both'

  const ringPct = Math.min(100, Math.max(0, sleep.current.score))

  const affirmation = useMemo(() => getDailyAffirmation(), [])
  const insightDescription =
    sleep.insights[0]?.description ?? 'Connect your routine to see richer tips here.'

  const initial = greeting.trim().slice(0, 1).toUpperCase() || '?'

  return (
    <div className="font-jakarta mx-auto w-full max-w-[1440px] antialiased">
      <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="hidden w-full max-w-xs shrink-0 flex-col gap-4 sm:max-w-none lg:flex lg:w-64 lg:max-w-none">
          <aside className={`${CARD} aspect-square w-full flex-col overflow-hidden`} aria-label="How are you right now">
            <div className={`flex h-full min-h-0 flex-col ${SQUARE_PAD}`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {initial}
              </div>
              <p className={`${SECTION_TITLE} mt-4 text-[15px] leading-snug`}>How are you right now?</p>
              <p className={`${BODY} mt-1.5 line-clamp-4 text-xs leading-relaxed sm:text-sm`}>
                Pause for a breath—notice your energy, mood, and rest. A ten-second honest answer helps EaseUp nudge you
                before the week runs away with you.
              </p>
              <div className="min-h-0 flex-1" aria-hidden />
              <Link
                to="/insight"
                className="mt-3 inline-flex w-full shrink-0 items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                style={{ backgroundColor: SAGE }}
              >
                Check in here
              </Link>
              <div
                className="mt-3 flex h-11 shrink-0 items-end justify-center gap-1.5 rounded-xl bg-gray-50 px-2 pb-1.5 dark:bg-gray-800/70"
                aria-hidden
              >
                <div className="h-7 w-5 rounded-md" style={{ backgroundColor: SAGE }} />
                <div className="h-5 w-5 rounded-md" style={{ backgroundColor: ORANGE }} />
                <div className="h-9 w-5 rounded-md bg-gray-300/90 dark:bg-gray-600" />
              </div>
            </div>
          </aside>

          <section className={`${CARD} w-full p-4 sm:p-5`} aria-labelledby="daily-progress-heading">
            <h2 id="daily-progress-heading" className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Daily progress
            </h2>
            <p className={`${BODY} mt-1.5 text-xs`}>
              Sleep score from duration, efficiency, and last night&apos;s stages.
            </p>
            <div className="mt-4 flex justify-center">
              <SleepScoreRing ringPct={ringPct} className="h-32 w-32 sm:h-36 sm:w-36" />
            </div>
          </section>

          <DashboardStressWeekCard busyLoad={busy.load} widthClass="w-full" compact />
          <DashboardReminderCard affirmation={affirmation} widthClass="w-full" compact />
          <DashboardInsightCard description={insightDescription} widthClass="w-full" compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_min(100%,380px)] 2xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <section
                className={cn(
                  CARD,
                  'relative overflow-hidden p-5 lg:hidden',
                  'shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
                )}
                aria-label="How are you right now"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full opacity-[0.2] dark:opacity-[0.15]"
                  style={{ background: `radial-gradient(circle at center, ${SAGE}, transparent 68%)` }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full opacity-[0.12] dark:opacity-[0.1]"
                  style={{ background: `radial-gradient(circle at center, ${ORANGE}, transparent 70%)` }}
                  aria-hidden
                />
                <div className="relative flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg font-bold text-gray-800 shadow-inner dark:bg-gray-800 dark:text-gray-100">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={KICKER}>Today</p>
                    <p className="mt-1 text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50">
                      How are you right now?
                    </p>
                    <p className={`${BODY} mt-2 text-xs leading-relaxed sm:text-sm`}>
                      A quick check-in keeps tips and sleep nudges aligned with how you actually feel.
                    </p>
                  </div>
                </div>
                <Link
                  to="/insight"
                  className="relative mt-4 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.99]"
                  style={{ backgroundColor: SAGE }}
                >
                  Check in here
                </Link>
              </section>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div
                  className={`${CARD} flex w-full flex-col sm:aspect-square ${SQUARE_PAD}`}
                >
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: SAGE }}
                      >
                        <Moon className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={KICKER}>Sleep debt</p>
                        <p className="mt-1.5 text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 sm:text-xl">
                          {sleepHeadline}
                        </p>
                      </div>
                    </div>
                    <p className={`${BODY} mt-3 line-clamp-3 text-xs leading-relaxed sm:text-sm`}>{sleepMeta}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-medium text-gray-900 dark:text-gray-100 sm:text-xs"
                        style={{ backgroundColor: `${SAGE}45` }}
                      >
                        Bed {sleep.current.bedtime}
                      </span>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-medium text-gray-900 dark:text-gray-100 sm:text-xs"
                        style={{ backgroundColor: `${ORANGE}38` }}
                      >
                        Wake {sleep.current.wakeTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`${CARD} flex w-full flex-col sm:aspect-square ${SQUARE_PAD}`}>
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: ORANGE }}
                      >
                        <CalendarDays className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={KICKER}>How busy you are</p>
                        <p className="mt-1.5 text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 sm:text-xl">
                          {busy.title}
                        </p>
                      </div>
                    </div>
                    <p className={`${BODY} mt-3 line-clamp-4 text-xs leading-relaxed sm:text-sm`}>{busy.subtitle}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200 sm:text-xs">
                        This week · {thisWeekN} items
                      </span>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white sm:text-xs"
                        style={{ backgroundColor: SAGE }}
                      >
                        Load ~{busy.load}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <section className={`${CARD} ${CARD_PAD} lg:hidden`} aria-labelledby="daily-progress-heading-mobile">
                <h2 id="daily-progress-heading-mobile" className={SECTION_TITLE}>
                  Daily progress
                </h2>
                <p className={`${BODY} mt-1.5 text-sm`}>
                  Sleep score from duration, efficiency, and last night&apos;s stages.
                </p>
                <div className="mt-5 flex justify-center">
                  <SleepScoreRing ringPct={ringPct} className="h-36 w-36 sm:h-40 sm:w-40" />
                </div>
              </section>

              <div className="space-y-4 lg:hidden">
                <DashboardStressWeekCard busyLoad={busy.load} />
                <DashboardReminderCard affirmation={affirmation} />
                <DashboardInsightCard description={insightDescription} />
              </div>

              <div className={`${CARD} ${CARD_PAD}`}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4 sm:mb-5 dark:border-gray-800">
                  <div className="min-w-0">
                    <h2 className={SECTION_TITLE}>Week load</h2>
                    <p className={`${BODY} mt-1 text-xs sm:text-sm`}>
                      Scheduled items per weekday · {monthLabel}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 sm:text-xs">
                    This month
                  </span>
                </div>
                <div className="flex h-36 items-end justify-between gap-1 px-0.5 sm:h-40 sm:gap-2 md:h-[11rem] md:gap-3">
                  {WEEKDAY_LABELS.map((label, i) => {
                    const h = Math.round((weekdayCounts[i]! / maxBar) * 100)
                    return (
                      <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:gap-2">
                        <div className="flex h-[7.25rem] w-full items-end justify-center px-0.5 sm:h-32 md:h-[9.5rem]">
                          <div
                            className="w-full max-w-[2rem] rounded-t-md transition-all sm:max-w-10 md:max-w-11"
                            style={{
                              height: `${Math.max(10, h)}%`,
                              backgroundColor: SAGE,
                              opacity: 0.42 + (weekdayCounts[i]! / maxBar) * 0.58,
                            }}
                            title={`${weekdayCounts[i]} items`}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 sm:text-xs">{label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex gap-3 rounded-xl border border-gray-100 bg-gray-50/90 px-3.5 py-3 sm:mt-5 sm:px-4 sm:py-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                  <HeartPulse className="mt-0.5 h-5 w-5 shrink-0" style={{ color: SAGE }} aria-hidden />
                  <p className={`${BODY} min-w-0`}>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Recovery tip: </span>
                    {sleep.trend?.description ?? 'Keep a steady sleep window when the week gets dense.'}
                  </p>
                </div>
              </div>

              {showProCard && workStatus ? (
                <div className={`${CARD} ${CARD_PAD}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                      <Briefcase className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className={KICKER}>Professional lens</p>
                      <h3 className={SECTION_TITLE}>Meeting load (this week)</h3>
                    </div>
                  </div>
                  <p className={`${BODY} mt-2 text-xs`}>
                    Counts timed blocks from Google, Microsoft, and manual focus blocks with a start time.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-950 dark:bg-sky-950/60 dark:text-sky-100">
                      {professionalWeek.count} meetings / blocks
                    </span>
                    {professionalWeek.backToBack > 0 ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
                        {professionalWeek.backToBack} tight back-to-back pair
                        {professionalWeek.backToBack === 1 ? '' : 's'} (under 15 min gap)
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 dark:bg-gray-300">
                        No back-to-back gaps under 15 min detected
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              <DashboardMentalHealthSection sleepScore={ringPct} busyLoad={busy.load} />

              {detailSlot ? <div className="pt-1">{detailSlot}</div> : null}
            </div>

            <div className="min-w-0 space-y-4 sm:space-y-5 xl:sticky xl:top-1 xl:self-start">
              <MonthCalendarView
                manualRefreshSignal={manualRefreshSignal}
                variant="embedded"
                onCalendarMutation={() => setMutationTick((t) => t + 1)}
              />

              <div className={`${CARD} p-4 sm:p-5 lg:p-6`}>
                <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-base">
                  Upcoming
                </h3>
                <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                  {upcoming.length === 0 ? (
                    <li
                      className={`rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-3 py-4 text-center text-sm sm:px-4 sm:py-5 ${BODY}`}
                    >
                      Nothing scheduled ahead. Add tasks in the calendar or open{' '}
                      <Link
                        to="/mycalendar"
                        className="font-semibold underline decoration-[#95B18E]/35 underline-offset-2 hover:opacity-90 dark:decoration-[#95B18E]/45"
                        style={{ color: SAGE }}
                      >
                        My Calendar
                      </Link>
                      .
                    </li>
                  ) : (
                    upcoming.map((item) => {
                      const ms = isMicrosoftCalendarEntry(item)
                      const lms = isLmsEntry(item)
                      const accent = ms ? '#0078d4' : lms ? '#7c3aed' : SAGE
                      return (
                        <li
                          key={item.id}
                          className="flex items-stretch gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/40 sm:px-3.5 sm:py-3"
                        >
                          <span
                            className="my-0.5 w-1 shrink-0 self-stretch rounded-full"
                            style={{ backgroundColor: accent }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                              {item.date} · {formatEntryTimeSummary(item)}
                            </p>
                          </div>
                        </li>
                      )
                    })
                  )}
                </ul>
                <Link
                  to="/mycalendar"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 transition hover:text-gray-950 dark:text-gray-200 dark:hover:text-white"
                >
                  See more schedule
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {userEmail ? (
                <p className="hidden text-center text-xs leading-relaxed text-gray-400 dark:text-gray-500 xl:block">
                  {userEmail}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
