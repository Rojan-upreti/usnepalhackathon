import type { UserGoalDoc } from '@/lib/goalsFirestore'
import { getGoalTemplateById } from '@/lib/goalInsightsMock'
import {
  addDays,
  coerceToDate,
  formatGoalDay,
  milestoneSchedule,
  sprintProgressPercent,
  startOfLocalWeek,
} from '@/components/goals/goalTimelineUtils'
import { CheckCircle2, Circle, type LucideIcon } from 'lucide-react'

const SAGE = '#95B18E'
const ORANGE = '#F2994A'

const DEFAULT_MILESTONES = ['Start', 'Mid-sprint check-in', 'Review & next step']

function startOfDay(d: Date): number {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

type Props = {
  goal: UserGoalDoc
  domainMeta: { Icon: LucideIcon; label: string; badgeClass: string }
}

export function ActiveGoalTimelineRow({ goal, domainMeta }: Props) {
  const template = getGoalTemplateById(goal.templateId)
  const durationWeeks = goal.durationWeeks ?? template?.durationWeeks ?? 2
  const labels =
    goal.milestones?.length === 3
      ? goal.milestones
      : template?.milestones ?? DEFAULT_MILESTONES

  const start = coerceToDate(goal.createdAt) ?? new Date()
  const dates = milestoneSchedule(start, durationWeeks, 3)
  const end = dates[dates.length - 1] ?? addDays(start, durationWeeks * 7)
  const now = new Date()
  const pct = sprintProgressPercent(now, start, end)
  const MetaIcon = domainMeta.Icon

  return (
    <li className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900">
      <div
        className="border-b border-gray-100 px-4 py-3 dark:border-gray-800"
        style={{
          background: `linear-gradient(90deg, ${SAGE}22, transparent)`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${domainMeta.badgeClass}`}
          >
            <MetaIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {domainMeta.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {durationWeeks} week{durationWeeks === 1 ? '' : 's'} · ends ~{formatGoalDay(end)}
          </span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h3>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{goal.detail}</p>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Sprint progress</span>
            <span>{pct}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${SAGE}, ${ORANGE})`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Timeline
        </p>
        <ol className="relative space-y-0">
          {labels.slice(0, 3).map((label, i) => {
            const at = dates[i] ?? start
            const done = startOfDay(now) >= startOfDay(at)
            const Icon = done ? CheckCircle2 : Circle
            return (
              <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
                {i < 2 ? (
                  <span
                    className="absolute left-[11px] top-6 h-[calc(100%-0.25rem)] w-px bg-gray-200 dark:bg-gray-700"
                    aria-hidden
                  />
                ) : null}
                <div className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center">
                  <Icon
                    className={`h-5 w-5 ${done ? '' : 'text-gray-300 dark:text-gray-600'}`}
                    style={done ? { color: SAGE } : undefined}
                    strokeWidth={done ? 2 : 1.75}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatGoalDay(at)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </li>
  )
}

type SprintStripProps = {
  activeCount: number
  openSuggestionCount: number
}

/** Four-week horizon from the start of this local week — orientation only. */
export function SprintCalendarStrip({ activeCount, openSuggestionCount }: SprintStripProps) {
  const week0 = startOfLocalWeek(new Date())
  const weeks = [0, 1, 2, 3].map((i) => addDays(week0, i * 7))
  const today = new Date()

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Next four weeks</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeCount} on your list · {openSuggestionCount} ideas left
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {weeks.map((w, i) => {
          const weekEnd = addDays(w, 6)
          const isCurrent = today >= w && today <= weekEnd
          return (
            <div
              key={i}
              className={`flex min-h-[5.5rem] flex-col justify-between rounded-xl border px-2 py-3 text-center transition-colors ${
                isCurrent
                  ? 'border-[#95B18E]/70 bg-[#95B18E]/12 dark:border-[#95B18E]/50 dark:bg-[#95B18E]/15'
                  : 'border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/40'
              }`}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Week {i + 1}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-800 dark:text-gray-200">{formatGoalDay(w)}</p>
              </div>
              <div className="mt-2 flex h-5 items-center justify-center">
                {isCurrent ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: SAGE }}
                  >
                    This week
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
