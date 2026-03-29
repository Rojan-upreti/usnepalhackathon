import { getFirebaseDb } from '@/lib/firebase'
import type { CalendarEntry } from '@/lib/calendarEntries'
import { isGoogleCalendarEntry } from '@/lib/calendarEntries'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'

const INTEGRATION_PATH = 'google_calendar_integration'
const SETTINGS_DOC_ID = 'settings'
const EVENTS_PATH = 'google_calendar_events'

export type GoogleCalendarIntegration = {
  connectedAt: Timestamp
  primaryEmail: string | null
  displayName: string | null
  lastImportEventCount: number
}

function settingsRef(uid: string) {
  return doc(getFirebaseDb(), 'users', uid, INTEGRATION_PATH, SETTINGS_DOC_ID)
}

function eventsCollectionRef(uid: string) {
  return collection(getFirebaseDb(), 'users', uid, EVENTS_PATH)
}

function eventDocRef(uid: string, eventId: string) {
  return doc(getFirebaseDb(), 'users', uid, EVENTS_PATH, eventId)
}

export function subscribeGoogleCalendarIntegration(
  uid: string,
  onData: (data: GoogleCalendarIntegration | null) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null)
        return
      }
      const d = snap.data() as Record<string, unknown>
      if (!(d.connectedAt instanceof Timestamp)) {
        onData(null)
        return
      }
      onData({
        connectedAt: d.connectedAt,
        primaryEmail: typeof d.primaryEmail === 'string' ? d.primaryEmail : null,
        displayName: typeof d.displayName === 'string' ? d.displayName : null,
        lastImportEventCount: typeof d.lastImportEventCount === 'number' ? d.lastImportEventCount : 0,
      })
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err))),
  )
}

function entryFromFirestore(data: Record<string, unknown>, docId: string): CalendarEntry | null {
  if (data.type !== 'time_block' && data.type !== 'deadline') return null
  if (typeof data.title !== 'string' || typeof data.date !== 'string') return null
  if (data.source !== 'google_calendar') return null
  const id = typeof data.id === 'string' ? data.id : docId
  const entry: CalendarEntry = {
    id,
    type: data.type,
    title: data.title,
    date: data.date,
    startTime: typeof data.startTime === 'string' ? data.startTime : undefined,
    endTime: typeof data.endTime === 'string' ? data.endTime : undefined,
    dueDate: typeof data.dueDate === 'string' ? data.dueDate : undefined,
    dueTime: typeof data.dueTime === 'string' ? data.dueTime : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    source: 'google_calendar',
    lmsKind: typeof data.lmsKind === 'string' ? data.lmsKind : undefined,
    googleCalendarEventId: typeof data.googleCalendarEventId === 'string' ? data.googleCalendarEventId : undefined,
  }
  if (!isGoogleCalendarEntry(entry)) return null
  return entry
}

export function subscribeGoogleCalendarEvents(
  uid: string,
  onData: (entries: CalendarEntry[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return onSnapshot(
    eventsCollectionRef(uid),
    (snap) => {
      const list: CalendarEntry[] = []
      snap.forEach((d) => {
        const e = entryFromFirestore(d.data() as Record<string, unknown>, d.id)
        if (e) list.push(e)
      })
      list.sort((a, b) => {
        const c = a.date.localeCompare(b.date)
        if (c !== 0) return c
        const ta = a.type === 'time_block' && a.startTime ? a.startTime : a.dueTime ?? ''
        const tb = b.type === 'time_block' && b.startTime ? b.startTime : b.dueTime ?? ''
        return ta.localeCompare(tb)
      })
      onData(list)
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err))),
  )
}

function entryToFirestorePayload(e: CalendarEntry): Record<string, unknown> {
  const o: Record<string, unknown> = {
    id: e.id,
    type: e.type,
    title: e.title,
    date: e.date,
    source: 'google_calendar',
  }
  if (e.startTime != null) o.startTime = e.startTime
  if (e.endTime != null) o.endTime = e.endTime
  if (e.dueDate != null) o.dueDate = e.dueDate
  if (e.dueTime != null) o.dueTime = e.dueTime
  if (e.notes != null) o.notes = e.notes
  if (e.lmsKind != null) o.lmsKind = e.lmsKind
  if (e.googleCalendarEventId != null) o.googleCalendarEventId = e.googleCalendarEventId
  return o
}

async function deleteAllGoogleEvents(uid: string): Promise<void> {
  const snap = await getDocs(eventsCollectionRef(uid))
  const ids = snap.docs.map((d) => d.id)
  const db = getFirebaseDb()
  for (let i = 0; i < ids.length; i += 500) {
    const batch = writeBatch(db)
    for (const id of ids.slice(i, i + 500)) {
      batch.delete(eventDocRef(uid, id))
    }
    await batch.commit()
  }
}

export async function writeGoogleCalendarAndEvents(
  uid: string,
  meta: { primaryEmail: string | null; displayName: string | null },
  events: CalendarEntry[],
): Promise<void> {
  await deleteAllGoogleEvents(uid)
  const db = getFirebaseDb()
  await setDoc(settingsRef(uid), {
    connectedAt: Timestamp.now(),
    primaryEmail: meta.primaryEmail,
    displayName: meta.displayName,
    lastImportEventCount: events.length,
  })

  for (let i = 0; i < events.length; i += 500) {
    const batch = writeBatch(db)
    for (const e of events.slice(i, i + 500)) {
      batch.set(eventDocRef(uid, e.id), entryToFirestorePayload(e))
    }
    await batch.commit()
  }
}

export async function removeGoogleCalendarIntegration(uid: string): Promise<void> {
  await deleteAllGoogleEvents(uid)
  await deleteDoc(settingsRef(uid))
}
