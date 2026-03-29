import { coerceToDate } from '@/components/goals/goalTimelineUtils'
import type { GoalDomain, UserGoalDoc, UserGoalStatus } from '@/lib/goalsFirestore'

const STORAGE_VERSION = 1

function storageKey(uid: string): string {
  return `easeup_user_goals_v${STORAGE_VERSION}_${uid}`
}

function isDomain(v: unknown): v is GoalDomain {
  return (
    v === 'calendar' ||
    v === 'sleep' ||
    v === 'health' ||
    v === 'career' ||
    v === 'lms'
  )
}

function isStatus(v: unknown): v is UserGoalStatus {
  return v === 'active' || v === 'dismissed'
}

function parseGoalRow(raw: unknown): UserGoalDoc | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const templateId = o.templateId
  const domain = o.domain
  const title = o.title
  const detail = o.detail
  const status = o.status
  if (typeof templateId !== 'string' || !isDomain(domain) || typeof title !== 'string' || typeof detail !== 'string' || !isStatus(status)) {
    return null
  }
  const durationWeeks = o.durationWeeks
  const rawM = o.milestones
  let milestones: string[] | undefined
  if (Array.isArray(rawM) && rawM.every((x) => typeof x === 'string')) {
    milestones = rawM as string[]
  }
  return {
    templateId,
    domain,
    title,
    detail,
    status,
    durationWeeks: typeof durationWeeks === 'number' && durationWeeks > 0 ? durationWeeks : undefined,
    milestones,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}

export function loadLocalGoals(uid: string): UserGoalDoc[] {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: UserGoalDoc[] = []
    for (const row of parsed) {
      const g = parseGoalRow(row)
      if (g) out.push(g)
    }
    return out
  } catch {
    return []
  }
}

export function saveLocalGoals(uid: string, goals: UserGoalDoc[]): void {
  try {
    const serializable = goals.map((g) => ({
      ...g,
      createdAt: serializeField(g.createdAt),
      updatedAt: serializeField(g.updatedAt),
    }))
    localStorage.setItem(storageKey(uid), JSON.stringify(serializable))
  } catch {
    /* ignore quota / private mode */
  }
}

function serializeField(v: unknown): string | undefined {
  const d = coerceToDate(v)
  if (d) return d.toISOString()
  if (typeof v === 'string' && !Number.isNaN(Date.parse(v))) return v
  return undefined
}

export function upsertLocalGoals(prev: UserGoalDoc[], next: UserGoalDoc): UserGoalDoc[] {
  const i = prev.findIndex((g) => g.templateId === next.templateId)
  if (i >= 0) {
    const copy = [...prev]
    copy[i] = next
    return copy
  }
  return [...prev, next]
}
