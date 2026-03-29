import { getFirebaseDb } from '@/lib/firebase'
import type { CalendarEntry } from '@/lib/calendarEntries'
import { isLmsEntry } from '@/lib/calendarEntries'
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

export type LmsProvider = 'canvas' | 'blackboard'

export type LmsIntegrationSettings = {
  provider: LmsProvider
  connectedAt: Timestamp
  /** User-selected university (same idea as profile `college_name`). */
  collegeName: string
  institutionName: string
  semesterLabel: string
  courses: string[]
  displayName: string
}

const SETTINGS_PATH = 'lms_integration'
const SETTINGS_DOC_ID = 'settings'
const EVENTS_PATH = 'lms_calendar_events'

function settingsRef(uid: string) {
  return doc(getFirebaseDb(), 'users', uid, SETTINGS_PATH, SETTINGS_DOC_ID)
}

function eventsCollectionRef(uid: string) {
  return collection(getFirebaseDb(), 'users', uid, EVENTS_PATH)
}

function eventDocRef(uid: string, eventId: string) {
  return doc(getFirebaseDb(), 'users', uid, EVENTS_PATH, eventId)
}

export function subscribeLmsIntegration(
  uid: string,
  onData: (settings: LmsIntegrationSettings | null) => void,
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
      if (
        (d.provider === 'canvas' || d.provider === 'blackboard') &&
        d.connectedAt instanceof Timestamp &&
        typeof d.institutionName === 'string' &&
        typeof d.semesterLabel === 'string' &&
        Array.isArray(d.courses) &&
        typeof d.displayName === 'string'
      ) {
        const institutionName = d.institutionName
        const collegeName =
          typeof d.collegeName === 'string' && d.collegeName.trim() !== ''
            ? d.collegeName
            : institutionName
        onData({
          provider: d.provider,
          connectedAt: d.connectedAt,
          collegeName,
          institutionName,
          semesterLabel: d.semesterLabel,
          courses: d.courses.filter((c): c is string => typeof c === 'string'),
          displayName: d.displayName,
        })
      } else {
        onData(null)
      }
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err))),
  )
}

function entryFromFirestore(data: Record<string, unknown>, docId: string): CalendarEntry | null {
  if (data.type !== 'time_block' && data.type !== 'deadline') return null
  if (typeof data.title !== 'string' || typeof data.date !== 'string') return null
  const id = typeof data.id === 'string' ? data.id : docId
  const source = data.source
  if (source !== 'lms_canvas' && source !== 'lms_blackboard') return null
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
    source,
    lmsProvider: data.lmsProvider === 'canvas' || data.lmsProvider === 'blackboard' ? data.lmsProvider : undefined,
    lmsKind: typeof data.lmsKind === 'string' ? data.lmsKind : undefined,
  }
  if (!isLmsEntry(entry)) return null
  return entry
}

export function subscribeLmsCalendarEvents(
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
  }
  if (e.startTime != null) o.startTime = e.startTime
  if (e.endTime != null) o.endTime = e.endTime
  if (e.dueDate != null) o.dueDate = e.dueDate
  if (e.dueTime != null) o.dueTime = e.dueTime
  if (e.notes != null) o.notes = e.notes
  if (e.source != null) o.source = e.source
  if (e.lmsProvider != null) o.lmsProvider = e.lmsProvider
  if (e.lmsKind != null) o.lmsKind = e.lmsKind
  return o
}

async function deleteAllLmsEvents(uid: string): Promise<void> {
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

export async function writeLmsIntegrationAndEvents(
  uid: string,
  settings: {
    provider: LmsProvider
    collegeName: string
    institutionName: string
    semesterLabel: string
    courses: string[]
    displayName: string
    connectedAt?: Timestamp
  },
  events: CalendarEntry[],
): Promise<void> {
  await deleteAllLmsEvents(uid)
  const db = getFirebaseDb()
  const connectedAt = settings.connectedAt ?? Timestamp.now()
  await setDoc(settingsRef(uid), {
    provider: settings.provider,
    connectedAt,
    collegeName: settings.collegeName.trim(),
    institutionName: settings.institutionName,
    semesterLabel: settings.semesterLabel,
    courses: settings.courses,
    displayName: settings.displayName,
  })

  for (let i = 0; i < events.length; i += 500) {
    const batch = writeBatch(db)
    for (const e of events.slice(i, i + 500)) {
      batch.set(eventDocRef(uid, e.id), entryToFirestorePayload(e))
    }
    await batch.commit()
  }
}

export async function removeLmsIntegration(uid: string): Promise<void> {
  await deleteAllLmsEvents(uid)
  await deleteDoc(settingsRef(uid))
}
