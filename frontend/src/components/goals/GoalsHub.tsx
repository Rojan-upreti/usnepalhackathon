import { ActiveGoalTimelineRow, SprintCalendarStrip } from '@/components/goals/GoalsTimelineVisual'
import { coerceToDate } from '@/components/goals/goalTimelineUtils'
import { GOAL_INSIGHT_TEMPLATES, type GoalInsightTemplate } from '@/lib/goalInsightsMock'
import {
  dismissUserGoal,
  setUserGoalActive,
  subscribeUserGoals,
  type UserGoalDoc,
} from '@/lib/goalsFirestore'
import { loadLocalGoals, saveLocalGoals, upsertLocalGoals } from '@/lib/goalsLocalStorage'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/contexts/UserRoleContext'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  Moon,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const SAGE = '#95B18E'

const DOMAIN_META: Record<
  GoalInsightTemplate['domain'],
  { label: string; Icon: LucideIcon; badgeClass: string }
> = {
  calendar: {
    label: 'Calendar',
    Icon: Calendar,
    badgeClass: 'bg-[#F2994A]/20 text-amber-950 dark:bg-[#F2994A]/18 dark:text-orange-100',
  },
  sleep: {
    label: 'Sleep',
    Icon: Moon,
    badgeClass: 'bg-[#95B18E]/22 text-gray-900 dark:bg-[#95B18E]/20 dark:text-gray-100',
  },
  health: {
    label: 'Health',
    Icon: HeartPulse,
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
  },
  career: {
    label: 'Career',
    Icon: Briefcase,
    badgeClass: 'bg-[#F2994A]/16 text-amber-950 dark:bg-[#F2994A]/14 dark:text-orange-100',
  },
  lms: {
    label: 'College',
    Icon: GraduationCap,
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
  },
}

function templatePayload(t: GoalInsightTemplate) {
  return {
    templateId: t.templateId,
    domain: t.domain,
    title: t.suggestedGoalTitle,
    detail: t.suggestedGoalDetail,
    durationWeeks: t.durationWeeks,
    milestones: [...t.milestones],
  }
}

function goalDocActive(t: GoalInsightTemplate, existing: UserGoalDoc | undefined): UserGoalDoc {
  const now = new Date().toISOString()
  const created = existing?.createdAt != null ? coerceToDate(existing.createdAt)?.toISOString() ?? now : now
  return {
    templateId: t.templateId,
    domain: t.domain,
    title: t.suggestedGoalTitle,
    detail: t.suggestedGoalDetail,
    status: 'active',
    durationWeeks: t.durationWeeks,
    milestones: [...t.milestones],
    createdAt: created,
    updatedAt: now,
  }
}

function goalDocDismissed(t: GoalInsightTemplate, existing: UserGoalDoc | undefined): UserGoalDoc {
  const now = new Date().toISOString()
  const base = existing ?? goalDocActive(t, undefined)
  return {
    ...base,
    ...templatePayload(t),
    status: 'dismissed',
    updatedAt: now,
  }
}

export function GoalsHub() {
  const { user } = useAuth()
  const { status: workStatus } = useUserRole()
  const [goals, setGoals] = useState<UserGoalDoc[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const activeGoalsSectionRef = useRef<HTMLElement>(null)

  const uid = user?.uid ?? null

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeUserGoals(
      uid,
      (list) => {
        setGoals(list)
        saveLocalGoals(uid, list)
      },
      () => {
        setGoals(loadLocalGoals(uid))
      },
    )
    return () => unsub()
  }, [uid])

  const visibleTemplates = useMemo(() => {
    const hideLms = workStatus === 'professional'
    return GOAL_INSIGHT_TEMPLATES.filter((t) => !t.studentOnly || !hideLms)
  }, [workStatus])

  const byTemplateId = useMemo(() => {
    const m = new Map<string, UserGoalDoc>()
    for (const g of goals) m.set(g.templateId, g)
    return m
  }, [goals])

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals])

  const stillOpen = useMemo(
    () => visibleTemplates.filter((t) => byTemplateId.get(t.templateId)?.status !== 'active'),
    [visibleTemplates, byTemplateId],
  )

  const suggestionOrder = useMemo(() => {
    return [...visibleTemplates].sort((a, b) => {
      const aOn = byTemplateId.get(a.templateId)?.status === 'active' ? 0 : 1
      const bOn = byTemplateId.get(b.templateId)?.status === 'active' ? 0 : 1
      if (aOn !== bOn) return aOn - bOn
      const aSnooze = byTemplateId.get(a.templateId)?.status === 'dismissed' ? 1 : 0
      const bSnooze = byTemplateId.get(b.templateId)?.status === 'dismissed' ? 1 : 0
      return aSnooze - bSnooze
    })
  }, [visibleTemplates, byTemplateId])

  async function onSetGoal(t: GoalInsightTemplate) {
    if (!uid) return
    setPendingId(t.templateId)
    const existing = goals.find((g) => g.templateId === t.templateId)
    try {
      await setUserGoalActive(uid, templatePayload(t))
      requestAnimationFrame(() => {
        activeGoalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch {
      const doc = goalDocActive(t, existing)
      setGoals((prev) => {
        const next = upsertLocalGoals(prev, doc)
        saveLocalGoals(uid, next)
        return next
      })
      requestAnimationFrame(() => {
        activeGoalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } finally {
      setPendingId(null)
    }
  }

  async function onDismiss(t: GoalInsightTemplate) {
    if (!uid) return
    setPendingId(t.templateId)
    const existing = goals.find((g) => g.templateId === t.templateId)
    try {
      await dismissUserGoal(uid, templatePayload(t))
    } catch {
      const doc = goalDocDismissed(t, existing)
      setGoals((prev) => {
        const next = upsertLocalGoals(prev, doc)
        saveLocalGoals(uid, next)
        return next
      })
    } finally {
      setPendingId(null)
    }
  }

  if (!uid) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to set and sync goals.</p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white px-6 py-7 dark:border-gray-800 dark:bg-gray-900/60">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.12]"
          style={{ background: SAGE }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: SAGE }}
              aria-hidden
            >
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-2xl">
                Your goals
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Pick an idea, add it to your list, and follow the dated checkpoints—pulled from calendar, sleep,
                health, career, and school.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {[
              { n: '1', t: 'Browse' },
              { n: '2', t: 'Add' },
              { n: '3', t: 'Track' },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="hidden text-gray-300 dark:text-gray-600 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200">
                  <span className="font-semibold" style={{ color: SAGE }}>
                    {s.n}
                  </span>
                  {s.t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <SprintCalendarStrip activeCount={activeGoals.length} openSuggestionCount={stillOpen.length} />

      <section ref={activeGoalsSectionRef} aria-labelledby="goals-active-heading">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 id="goals-active-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            On your list
          </h2>
          {activeGoals.length > 0 ? (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: SAGE }}
            >
              {activeGoals.length}
            </span>
          ) : null}
        </div>
        {activeGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nothing here yet. Scroll to <span className="font-medium text-gray-800 dark:text-gray-200">Ideas for you</span>{' '}
              and tap <span className="font-medium text-gray-800 dark:text-gray-200">Set this goal</span>.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {activeGoals.map((g) => (
              <ActiveGoalTimelineRow key={g.templateId} goal={g} domainMeta={DOMAIN_META[g.domain]} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ideas-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="ideas-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ideas for you
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sample signals—tap a card to add it. Checkpoints stay on the card until you add it.
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{stillOpen.length} available</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {suggestionOrder.map((t) => {
            const meta = DOMAIN_META[t.domain]
            const TIcon = meta.Icon
            const saved = byTemplateId.get(t.templateId)
            const isActive = saved?.status === 'active'
            const isDismissed = saved?.status === 'dismissed'
            const busy = pendingId === t.templateId
            return (
              <article
                key={t.templateId}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex flex-col rounded-2xl border bg-white transition dark:bg-gray-900/80 ${
                  isActive
                    ? 'border-[#95B18E]/60 shadow-[0_0_0_1px_rgba(149,177,142,0.25)] dark:border-[#95B18E]/45'
                    : 'border-gray-200/90 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                }`}
              >
                {isActive ? (
                  <div
                    className="flex items-center gap-2 rounded-t-2xl px-4 py-2.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: SAGE }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 opacity-95" aria-hidden />
                    On your list
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-4 pt-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}
                    >
                      <TIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{t.durationWeeks} wk</span>
                    {isDismissed && !isActive ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Passed for now
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug text-gray-900 dark:text-gray-100">{t.headline}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.mockMetric}</p>
                  <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">{t.suggestedGoalTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t.suggestedGoalDetail}</p>

                  <details className="mt-4 group/details rounded-xl border border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/40">
                    <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-gray-600 outline-none transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-2">
                        {isActive ? 'Your checkpoints' : 'Checkpoints'}
                        <span className="text-gray-400 group-open/details:rotate-180 dark:text-gray-500">▼</span>
                      </span>
                    </summary>
                    <ol className="space-y-1.5 border-t border-gray-100 px-3 py-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
                      {t.milestones.map((m, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="w-4 shrink-0 font-medium text-gray-400">{i + 1}</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ol>
                  </details>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={isActive || busy}
                      onClick={() => onSetGoal(t)}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? 'cursor-default border-2 border-[#95B18E] bg-[#95B18E]/15 text-gray-900 opacity-100 disabled:opacity-100 dark:text-gray-100'
                          : 'text-white shadow-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50'
                      }`}
                      style={isActive ? undefined : { backgroundColor: SAGE }}
                    >
                      {busy && !isActive ? (
                        'Saving…'
                      ) : isActive ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                          Added
                        </>
                      ) : (
                        'Set this goal'
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isActive || busy}
                      onClick={() => onDismiss(t)}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
