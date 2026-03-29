import type { CalendarEntry } from '@/lib/calendarEntries'
import { toISODateLocal } from '@/lib/calendarEntries'
import { writeMicrosoftCalendarAndEvents } from '@/lib/microsoftCalendarFirestore'

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function idForMock(i: number): string {
  return `ms_mock_${String(i).padStart(4, '0')}`
}

/** Demo-only Outlook-style events (no Microsoft API). */
export function buildMockMicrosoftCalendarEntries(primaryEmail: string): CalendarEntry[] {
  const email = primaryEmail.trim() || 'demo.user@outlook.com'
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blocks: Omit<CalendarEntry, 'id'>[] = [
    {
      type: 'time_block',
      title: 'CS 401 — Lecture',
      date: toISODateLocal(addDays(today, 1)),
      startTime: '10:00',
      endTime: '11:15',
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(1)}`,
      lmsKind: 'outlook_event',
      notes: 'Room 204 · Teams link in invite',
    },
    {
      type: 'time_block',
      title: 'Team standup (Teams)',
      date: toISODateLocal(today),
      startTime: '09:30',
      endTime: '09:45',
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(2)}`,
      lmsKind: 'outlook_event',
      notes: 'Daily sync',
    },
    {
      type: 'time_block',
      title: 'Advisor meeting',
      date: toISODateLocal(addDays(today, 3)),
      startTime: '14:00',
      endTime: '14:30',
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(3)}`,
      lmsKind: 'outlook_event',
    },
    {
      type: 'deadline',
      title: 'Assignment 3 — submit on Canvas',
      date: toISODateLocal(addDays(today, 5)),
      dueDate: toISODateLocal(addDays(today, 5)),
      dueTime: '23:59',
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(4)}`,
      lmsKind: 'outlook_event',
      notes: 'Upload PDF only',
    },
    {
      type: 'deadline',
      title: 'Midterm review (all day)',
      date: toISODateLocal(addDays(today, 7)),
      dueDate: toISODateLocal(addDays(today, 7)),
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(5)}`,
      lmsKind: 'outlook_all_day',
    },
    {
      type: 'time_block',
      title: 'Hackathon workshop',
      date: toISODateLocal(addDays(today, 10)),
      startTime: '13:00',
      endTime: '16:00',
      source: 'microsoft_calendar',
      msGraphEventId: `mock-graph-${idForMock(6)}`,
      lmsKind: 'outlook_event',
      notes: `Organizer: ${email.split('@')[0] ?? 'you'}`,
    },
  ]

  return blocks.map((b, i) => ({ ...b, id: idForMock(i) }))
}

export async function importMockMicrosoftCalendarToFirestore(
  uid: string,
  primaryEmail: string,
): Promise<{ count: number; email: string }> {
  const email = primaryEmail.trim() || 'demo.user@outlook.com'
  const entries = buildMockMicrosoftCalendarEntries(email)
  const localPart = email.split('@')[0] ?? 'User'
  const displayName = localPart
    .split(/[._-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
  await writeMicrosoftCalendarAndEvents(uid, { primaryEmail: email, displayName }, entries)
  return { count: entries.length, email }
}

/** Simulated OAuth redirect delay (ms). */
export const MOCK_OAUTH_DELAY_MS = 2200
