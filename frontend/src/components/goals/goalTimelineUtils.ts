/** Normalize Firestore Timestamp, Date, or millis to a Date. */
export function coerceToDate(v: unknown): Date | null {
  if (v == null) return null
  if (v instanceof Date) return v
  const t = v as { toDate?: () => Date; seconds?: number }
  if (typeof t.toDate === 'function') {
    try {
      return t.toDate()
    } catch {
      return null
    }
  }
  if (typeof t.seconds === 'number') {
    return new Date(t.seconds * 1000)
  }
  if (typeof v === 'string') {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function startOfLocalWeek(d: Date): Date {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Evenly space `count` milestone dates across [start, start + durationWeeks weeks]. */
export function milestoneSchedule(
  start: Date,
  durationWeeks: number,
  count: number,
): Date[] {
  const totalDays = Math.max(7, Math.round(durationWeeks * 7))
  if (count <= 0) return []
  if (count === 1) return [start]
  const out: Date[] = []
  for (let i = 0; i < count; i++) {
    const frac = i / (count - 1)
    out.push(addDays(start, Math.round(frac * totalDays)))
  }
  return out
}

export function sprintProgressPercent(now: Date, start: Date, end: Date): number {
  const t0 = start.getTime()
  const t1 = end.getTime()
  const tn = now.getTime()
  if (tn <= t0) return 0
  if (tn >= t1) return 100
  return Math.round(((tn - t0) / (t1 - t0)) * 100)
}

export function formatGoalDay(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)
}
