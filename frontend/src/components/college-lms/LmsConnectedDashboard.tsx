import type { CalendarEntry } from '@/lib/calendarEntries'
import { formatEntryTimeSummary, toISODateLocal } from '@/lib/calendarEntries'
import type { LmsIntegrationSettings } from '@/lib/lmsFirestore'
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Trophy,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  integration: LmsIntegrationSettings
  events: CalendarEntry[]
  demoLoginUrl: string
  onRemoveClick: () => void
  removeBusy: boolean
}

function sortKey(e: CalendarEntry): string {
  const day = e.type === 'deadline' ? (e.dueDate ?? e.date) : e.date
  const t = e.type === 'deadline' ? (e.dueTime ?? '23:59') : (e.startTime ?? '00:00')
  return `${day}T${t}`
}

function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  return sortKey(a).localeCompare(sortKey(b))
}

function kindLabel(kind: string | undefined): string {
  switch (kind) {
    case 'quiz':
      return 'Quiz'
    case 'exam':
      return 'Exam'
    case 'discussion':
      return 'Discussion'
    case 'assignment':
      return 'Assignment'
    case 'office_hours':
      return 'Office hours'
    case 'review_session':
      return 'Review session'
    case 'policy':
      return 'Policy'
    default:
      return kind ? kind.replace(/_/g, ' ') : 'Activity'
  }
}

function formatDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function LmsConnectedDashboard({
  integration,
  events,
  demoLoginUrl,
  onRemoveClick,
  removeBusy,
}: Props) {
  const { upcoming, sessions, stats } = useMemo(() => {
    const todayIso = toISODateLocal(new Date())
    const sorted = [...events].sort(compareEntries)
    const upcomingList = sorted.filter((e) => {
      const day = e.type === 'deadline' ? (e.dueDate ?? e.date) : e.date
      return day >= todayIso
    })
    const sessionsList = upcomingList.filter(
      (e) => e.type === 'time_block' || e.lmsKind === 'office_hours' || e.lmsKind === 'review_session',
    )
    const deadlines = upcomingList.filter((e) => e.type === 'deadline')
    const assignment = deadlines.filter((e) => e.lmsKind === 'assignment' || e.lmsKind === 'policy')
    const quiz = deadlines.filter((e) => e.lmsKind === 'quiz')
    const exam = deadlines.filter((e) => e.lmsKind === 'exam')
    const discussion = deadlines.filter((e) => e.lmsKind === 'discussion')

    return {
      upcoming: upcomingList,
      sessions: sessionsList,
      stats: {
        assignments: assignment.length,
        quizzes: quiz.length,
        exams: exam.length,
        discussions: discussion.length,
      },
    }
  }, [events])

  const timelineItems = useMemo(() => {
    const deadlines = upcoming
      .filter((e) => e.type === 'deadline')
      .slice(0, 10)
    return deadlines
  }, [upcoming])

  const providerLabel = integration.provider === 'canvas' ? 'Canvas' : 'Blackboard'

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-white px-5 py-5 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:to-gray-900 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                College LMS · Connected
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                {integration.displayName}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                  {providerLabel}
                </span>
                <span className="text-gray-400 dark:text-gray-600">·</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{integration.collegeName}</span>
                <span className="text-gray-400 dark:text-gray-600">·</span>
                <span>{integration.semesterLabel}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveClick}
              disabled={removeBusy}
              className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Remove integration
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
          <StatTile
            icon={ClipboardList}
            label="Assignments"
            value={stats.assignments}
            sub="Due ahead"
          />
          <StatTile icon={GraduationCap} label="Quizzes" value={stats.quizzes} sub="Scheduled" />
          <StatTile icon={Trophy} label="Exams" value={stats.exams} sub="On calendar" />
          <StatTile icon={MessageSquare} label="Discussions" value={stats.discussions} sub="Deadlines" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <CalendarClock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Upcoming deadlines
            </h3>
            <Link
              to="/mycalendar"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              My Calendar
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {timelineItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming items. Open My Calendar to add your own events.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {timelineItems.map((e) => {
                const day = e.dueDate ?? e.date
                return (
                  <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex w-24 shrink-0 flex-col text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDay(day)}</span>
                      <span>{formatEntryTimeSummary(e)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                        {kindLabel(e.lmsKind)}
                      </span>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{e.title}</p>
                      {e.notes ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{e.notes}</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Courses
          </h3>
          <ul className="space-y-2">
            {integration.courses.map((c) => (
              <li
                key={c}
                className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-100"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Due dates and quizzes from these courses sync to <strong className="font-medium text-gray-700 dark:text-gray-300">My Calendar</strong>.
            Removing the integration clears LMS events only.
          </p>
        </section>
      </div>

      {sessions.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Sessions &amp; office hours
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sessions.slice(0, 6).map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/30"
              >
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{kindLabel(e.lmsKind)}</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{e.title}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formatDay(e.date)} · {formatEntryTimeSummary(e)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
        <summary className="cursor-pointer font-medium text-gray-600 dark:text-gray-300">Demo login URL (simulation)</summary>
        <p className="mt-2 break-all font-mono text-[11px]">{demoLoginUrl}</p>
      </details>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof ClipboardList
  label: string
  value: number
  sub: string
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-800/30 sm:p-4">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">{value}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{sub}</p>
    </div>
  )
}
