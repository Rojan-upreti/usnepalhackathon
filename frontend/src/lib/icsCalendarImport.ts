import type { CalendarEntry } from '@/lib/calendarEntries'
import { toISODateLocal } from '@/lib/calendarEntries'

/** Unfold ICS lines (continuation lines start with space/tab). */
function unfoldIcs(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function parseIcsDateLine(value: string): { allDay: boolean; start: Date; end?: Date } | null {
  const v = value.trim()
  if (!v) return null
  const upper = v.toUpperCase()
  if (upper.includes('TZID=')) {
    const colon = v.lastIndexOf(':')
    if (colon < 0) return null
    const rest = v.slice(colon + 1)
    if (rest.length >= 15) {
      const y = Number(rest.slice(0, 4))
      const mo = Number(rest.slice(4, 6)) - 1
      const d = Number(rest.slice(6, 8))
      const h = Number(rest.slice(9, 11) || '0')
      const mi = Number(rest.slice(11, 13) || '0')
      const s = Number(rest.slice(13, 15) || '0')
      const start = new Date(y, mo, d, h, mi, s)
      return { allDay: false, start }
    }
  }
  if (/^\d{8}$/.test(v)) {
    const y = Number(v.slice(0, 4))
    const mo = Number(v.slice(4, 6)) - 1
    const d = Number(v.slice(6, 8))
    const start = new Date(y, mo, d, 12, 0, 0)
    return { allDay: true, start }
  }
  if (/^\d{8}T\d{6}Z?$/.test(v)) {
    const iso = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`
    const start = new Date(iso)
    if (Number.isNaN(start.getTime())) return null
    return { allDay: false, start }
  }
  return null
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function toHmLocal(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/**
 * Best-effort VEVENT parse (no RRULE). Adds entries as user-owned (localStorage).
 */
export function parseIcsFileToCalendarEntries(raw: string): CalendarEntry[] {
  const text = unfoldIcs(raw)
  const blocks = text.split(/BEGIN:VEVENT/gi).slice(1)
  const out: CalendarEntry[] = []

  for (const block of blocks) {
    const endIdx = block.search(/END:VEVENT/i)
    const chunk = endIdx >= 0 ? block.slice(0, endIdx) : block
    const lines = chunk.split('\n').map((l) => l.trim())
    let dtStart: string | null = null
    let dtEnd: string | null = null
    let summary = ''
    let uid = ''
    for (const line of lines) {
      const m = /^([A-Z]+)(?:;[^:]*)?:(.*)$/i.exec(line)
      if (!m) continue
      const key = m[1].toUpperCase()
      const val = m[2]
      if (key === 'DTSTART') dtStart = val
      else if (key === 'DTEND') dtEnd = val
      else if (key === 'SUMMARY') summary = val
      else if (key === 'UID') uid = val
    }
    if (!dtStart) continue
    const startParsed = parseIcsDateLine(dtStart)
    if (!startParsed) continue
    const title = summary.trim() || '(Imported event)'
    const id = uid.trim() ? `ics_${uid.trim().replace(/[/\s#[\].$]/g, '_').slice(0, 80)}` : crypto.randomUUID()

    if (startParsed.allDay) {
      const date = toISODateLocal(startParsed.start)
      out.push({
        id,
        type: 'deadline',
        title,
        date,
        dueDate: date,
        source: 'user',
      })
      continue
    }

    const endParsed = dtEnd ? parseIcsDateLine(dtEnd) : null
    const endD =
      endParsed && !endParsed.allDay ? endParsed.start : new Date(startParsed.start.getTime() + 60 * 60 * 1000)
    const date = toISODateLocal(startParsed.start)
    out.push({
      id,
      type: 'time_block',
      title,
      date,
      startTime: toHmLocal(startParsed.start),
      endTime: toHmLocal(endD),
      source: 'user',
    })
  }

  return out
}
