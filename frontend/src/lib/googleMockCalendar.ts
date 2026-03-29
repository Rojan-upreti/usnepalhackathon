import type { CalendarEntry } from '@/lib/calendarEntries'
import { toISODateLocal } from '@/lib/calendarEntries'
import { writeGoogleCalendarAndEvents } from '@/lib/googleCalendarFirestore'

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function idForMock(i: number): string {
  return `google_mock_${String(i).padStart(4, '0')}`
}

/** Demo-only Google Calendar-style events (no Google API). */
export function buildMockGoogleCalendarEntries(primaryEmail: string): CalendarEntry[] {
  const email = primaryEmail.trim() || 'demo.user@gmail.com'
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blocks: Omit<CalendarEntry, 'id'>[] = [
    {
      type: 'time_block',
      title: 'CS 401 — Lab Session',
      date: toISODateLocal(addDays(today, 2)),
      startTime: '14:00',
      endTime: '15:30',
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(1)}`,
      lmsKind: 'google_event',
      notes: 'Computer Lab Building A · Meet link: meet.google.com',
    },
    {
      type: 'time_block',
      title: 'Project review meeting',
      date: toISODateLocal(today),
      startTime: '11:00',
      endTime: '11:45',
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(2)}`,
      lmsKind: 'google_event',
      notes: 'Via Google Meet',
    },
    {
      type: 'time_block',
      title: 'Office hours with Dr. Smith',
      date: toISODateLocal(addDays(today, 4)),
      startTime: '16:00',
      endTime: '16:45',
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(3)}`,
      lmsKind: 'google_event',
    },
    {
      type: 'deadline',
      title: 'Project proposal due',
      date: toISODateLocal(addDays(today, 6)),
      dueDate: toISODateLocal(addDays(today, 6)),
      dueTime: '17:00',
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(4)}`,
      lmsKind: 'google_event',
      notes: 'Submit via Google Drive',
    },
    {
      type: 'deadline',
      title: 'Final project submission',
      date: toISODateLocal(addDays(today, 8)),
      dueDate: toISODateLocal(addDays(today, 8)),
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(5)}`,
      lmsKind: 'google_all_day',
    },
    {
      type: 'time_block',
      title: 'Career fair (Google)',
      date: toISODateLocal(addDays(today, 11)),
      startTime: '10:00',
      endTime: '14:00',
      source: 'google_calendar',
      googleCalendarEventId: `mock-google-${idForMock(6)}`,
      lmsKind: 'google_event',
      notes: `Student center · Organized by ${email.split('@')[0] ?? 'you'} · Bring resume`,
    },
  ]

  return blocks.map((b, i) => ({ ...b, id: idForMock(i) }))
}

export async function importMockGoogleCalendarToFirestore(
  uid: string,
  primaryEmail: string,
): Promise<{ count: number; email: string }> {
  const email = primaryEmail.trim() || 'demo.user@gmail.com'
  const entries = buildMockGoogleCalendarEntries(email)
  const localPart = email.split('@')[0] ?? 'User'
  const displayName = localPart
    .split(/[._-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
  await writeGoogleCalendarAndEvents(uid, { primaryEmail: email, displayName }, entries)
  return { count: entries.length, email }
}

/** Simulated OAuth redirect delay (ms). */
export const MOCK_OAUTH_DELAY_MS = 2200
