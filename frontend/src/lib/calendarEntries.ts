/** User-created calendar items: meetings / time blocks (pro) or deadline tasks (students). */

export type CalendarEntryType = 'time_block' | 'deadline'

export type CalendarEntrySource = 'user' | 'lms_canvas' | 'lms_blackboard' | 'microsoft_calendar' | 'google_calendar'

export type LmsProviderId = 'canvas' | 'blackboard'

export type CalendarEntry = {
  id: string
  type: CalendarEntryType
  title: string
  /** YYYY-MM-DD — day this item appears on the grid */
  date: string
  /** HH:mm (24h) — meeting / focus start */
  startTime?: string
  /** HH:mm — meeting / focus end */
  endTime?: string
  /** YYYY-MM-DD — when a task is due (defaults to same as `date` if omitted on save) */
  dueDate?: string
  /** HH:mm — optional specific due time */
  dueTime?: string
  notes?: string
  /** Omitted or `user` = stored in localStorage; LMS / Microsoft rows live in Firestore only */
  source?: CalendarEntrySource
  lmsProvider?: LmsProviderId
  lmsKind?: string
  /** Microsoft Graph calendar event id */
  msGraphEventId?: string
  /** Google Calendar event id */
  googleCalendarEventId?: string
}

export function isLmsEntry(e: CalendarEntry): boolean {
  return e.source === 'lms_canvas' || e.source === 'lms_blackboard'
}

export function isMicrosoftCalendarEntry(e: CalendarEntry): boolean {
  return e.source === 'microsoft_calendar'
}

export function isGoogleCalendarEntry(e: CalendarEntry): boolean {
  return e.source === 'google_calendar'
}

/** Firestore-backed imports the user cannot edit in-app. */
export function isImportedReadOnlyEntry(e: CalendarEntry): boolean {
  return isLmsEntry(e) || isMicrosoftCalendarEntry(e) || isGoogleCalendarEntry(e)
}

/** Entries that belong in localStorage (never LMS-sourced). */
export function filterManualEntriesOnly(entries: CalendarEntry[]): CalendarEntry[] {
  return entries.filter((e) => !isImportedReadOnlyEntry(e))
}

const STORAGE_KEY = 'easeup:calendarEntries:v1'

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODateLocal(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) }
}

export function loadCalendarEntries(): CalendarEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidEntry)
  } catch {
    return []
  }
}

function isValidEntry(x: unknown): x is CalendarEntry {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    (o.type !== 'time_block' && o.type !== 'deadline') ||
    typeof o.title !== 'string' ||
    typeof o.date !== 'string'
  ) {
    return false
  }
  if (o.source != null) {
    if (
      o.source !== 'user' &&
      o.source !== 'lms_canvas' &&
      o.source !== 'lms_blackboard' &&
      o.source !== 'microsoft_calendar' &&
      o.source !== 'google_calendar'
    ) {
      return false
    }
  }
  if (o.lmsProvider != null && o.lmsProvider !== 'canvas' && o.lmsProvider !== 'blackboard') return false
  if (o.lmsKind != null && typeof o.lmsKind !== 'string') return false
  if (o.msGraphEventId != null && typeof o.msGraphEventId !== 'string') return false
  if (o.googleCalendarEventId != null && typeof o.googleCalendarEventId !== 'string') return false
  return true
}

export function saveCalendarEntries(entries: CalendarEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore quota */
  }
}

export function entriesForDay(entries: CalendarEntry[], year: number, month: number, day: number): CalendarEntry[] {
  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return entries.filter((e) => e.date === key)
}

/** Compact label for a cell line */
export function formatEntryTimeSummary(e: CalendarEntry): string {
  if (e.type === 'time_block' && e.startTime && e.endTime) {
    return `${formatHm(e.startTime)}–${formatHm(e.endTime)}`
  }
  if (e.type === 'deadline') {
    const timePart = e.dueTime ? formatHm(e.dueTime) : null
    if (timePart) return `Due ${timePart}`
    return 'Due (all day)'
  }
  return ''
}

function formatHm(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function minutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}
